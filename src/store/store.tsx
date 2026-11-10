import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { FREE_PRESET_MIN, FREE_TASK_LIMIT, JUST_START_MIN, FREE_BREAKDOWNS_PER_DAY } from '@/src/config';
import type {
  AccessoryId,
  BadgeId,
  Celebration,
  Mood,
  Persisted,
  RewardEvent,
  RewardsState,
  Session,
  SessionFeel,
  SessionKind,
  Settings,
  Task,
  ThemeId,
  TimerState,
} from '@/src/domain/types';
import {
  BREAK_KEYS,
  companionLevel,
  computeStreak,
  dayKey,
  elapsedMs,
  focusedToday,
  ROUTINES,
  uid,
  unlockedBadges,
} from '@/src/domain/time';
import {
  XP_DAILY_CARD_REPEAT,
  XP_DAILY_GOAL,
  XP_JUST_START,
  XP_MOOD,
  XP_PER_FOCUS_MIN,
  XP_TASK,
  QUEST_XP,
  WEEKLY_CHEST_DAYS,
  WEEKLY_CHEST_XP,
  DAILY_GOAL_MIN,
  addXp,
  applyStreakFreezes,
  backfillRewards,
  canEarnCard,
  completedFocusSessionsOnDay,
  dailyCardPick,
  defaultRewards,
  ensurePeriod,
  focusedDaysInWeek,
  focusedMinutesOnDay,
  grantCard,
  milestoneCards,
  questProgressValue,
  refillMonthlyFreeze,
  weeklyChestCard,
} from '@/src/domain/rewards';
import { stepTemplates } from '@/src/domain/breakdown';
import { lookEarned, focusSessionCount, SCENES, WEARS } from '@/src/domain/looks';
import { deviceLocale, translate, type Key } from '@/src/i18n';
import { haptic } from '@/src/services/haptics';
import { initNotifications, notificationPermission, syncNotifications } from '@/src/services/notifications';
import {
  buy,
  configurePurchases,
  loadPlans,
  restorePurchases,
  subscribePro,
  type ConfigureResult,
  type PlanInfo,
} from '@/src/services/purchases';
import { syncFocusSurface } from '@/src/services/surfaces';

const STORAGE_KEY = 'justora.v1';

const defaultSettings = (): Settings => ({
  sound: true,
  haptics: true,
  checkIns: true,
  rain: 0,
  brown: 0,
  metronome: false,
  metronomeSec: 60,
  themeId: 'justora',
  locale: 'system',
  onboardingDone: false,
  ahaStarted: false,
  paywallSeen: false,
  previewPro: false,
  notifPrompted: false,
  planReminder: true,
  planHour: 9,
  planMinute: 0,
  streakReminder: true,
  accessory: 'none',
  backdrop: 'none',
  breakNudge: true,
  moodDismissedDay: '',
  breakdownDay: '',
  breakdownCount: 0,
  nudgeOn: false,
  nudgeHour: 16,
  nudgeMinute: 0,
});

type State = Persisted & {
  ready: boolean;
  entitled: boolean;
  purchaseState: ConfigureResult;
  plans: { monthly: PlanInfo | null; yearly: PlanInfo | null };
  celebration: Celebration | null;
  pendingActual: Task | null;
  purchaseMessage: string | null;
  rewardQueue: RewardEvent[];
};

let state: State = {
  version: 2,
  settings: defaultSettings(),
  tasks: [],
  sessions: [],
  estimates: [],
  moods: [],
  seenBadges: [],
  timer: null,
  rewards: defaultRewards(),
  routineRun: null,
  ready: false,
  entitled: false,
  purchaseState: 'missing-key',
  plans: { monthly: null, yearly: null },
  celebration: null,
  pendingActual: null,
  purchaseMessage: null,
  rewardQueue: [],
};

const listeners = new Set<() => void>();
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let lastRemaining = 0;
let breakPing = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function snapshot(): State {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function localeOf(): 'en' | 'tr' | 'de' | 'es' | 'fr' | 'pt-BR' | 'it' | 'ja' {
  return state.settings.locale === 'system' ? deviceLocale() : state.settings.locale;
}

function t(key: Key, vars?: Record<string, string | number>) {
  return translate(localeOf(), key, vars);
}

function patch(partial: Partial<State>, persist = true) {
  state = { ...state, ...partial };
  emit();
  if (persist && state.ready) schedulePersist();
}

function schedulePersist() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    const { settings, tasks, sessions, estimates, moods, seenBadges, timer, rewards, routineRun } = state;
    const payload: Persisted = { version: 2, settings, tasks, sessions, estimates, moods, seenBadges, timer, rewards, routineRun };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, 180);
}

function isProNow() {
  return state.entitled || (__DEV__ && state.settings.previewPro);
}


function streakNow(now = Date.now()) {
  return computeStreak(state.sessions, state.tasks, { now, frozenDays: state.rewards.frozenDays });
}

function enqueue(events: RewardEvent[]) {
  if (events.length === 0) return;
  state = { ...state, rewardQueue: [...state.rewardQueue, ...events] };
}

function grantXp(rewards: RewardsState, amount: number, events: RewardEvent[]): RewardsState {
  const added = addXp(rewards, amount);
  for (const level of added.levels) events.push({ id: uid(), kind: 'level-up', level });
  return added.rewards;
}

function grantNewCards(rewards: RewardsState, ids: ReturnType<typeof milestoneCards>, events: RewardEvent[], pro: boolean): RewardsState {
  let next = rewards;
  for (const id of ids) {
    const granted = grantCard(next, id, pro);
    next = granted.rewards;
    if (granted.event) events.push(granted.event);
  }
  return next;
}

function syncRewards(events: RewardEvent[] = []): RewardEvent[] {
  const pro = isProNow();
  let rewards = refillMonthlyFreeze(ensurePeriod(state.rewards), pro);
  const frozen = applyStreakFreezes({
    sessions: state.sessions,
    tasks: state.tasks,
    freezeCount: rewards.freezeCount,
    frozenDays: rewards.frozenDays,
  });
  for (const day of frozen.used) events.push({ id: uid(), kind: 'freeze-used', day });
  rewards = { ...rewards, freezeCount: frozen.freezeCount, frozenDays: frozen.frozenDays };
  const today = dayKey();
  const minutes = focusedMinutesOnDay(state.sessions, today);
  if (minutes >= DAILY_GOAL_MIN && rewards.dailyGoalAwardedDay !== today) {
    rewards = grantXp({ ...rewards, dailyGoalAwardedDay: today }, XP_DAILY_GOAL, events);
  }
  const justStarts = state.sessions.filter((session) => session.kind === 'just-start' && session.focusedMs >= 60_000).length;
  rewards = grantNewCards(
    rewards,
    milestoneCards({
      level: Math.max(rewards.lastLevelSeen, 1),
      streak: frozen.streak,
      sessions: state.sessions,
      moods: state.moods,
      justStarts,
    }),
    events,
    pro,
  );
  const quests = rewards.quests.map((quest) => {
    const progress = Math.min(quest.target, questProgressValue(quest.kind, { sessions: state.sessions, tasks: state.tasks, moods: state.moods, day: today }));
    if (progress >= quest.target && !quest.claimed) {
      rewards = grantXp(rewards, QUEST_XP, events);
      events.push({ id: uid(), kind: 'quest', questKind: quest.kind, xp: QUEST_XP });
      return { ...quest, progress, claimed: true };
    }
    return { ...quest, progress };
  });
  rewards = { ...rewards, quests };
  state = { ...state, rewards };
  enqueue(events);
  return events;
}

function freshBadge(): BadgeId | undefined {
  const current = unlockedBadges({
    sessions: state.sessions,
    estimates: state.estimates,
    moods: state.moods,
    tasks: state.tasks,
    streak: streakNow(),
  });
  const fresh = current.find((id) => !state.seenBadges.includes(id));
  state = { ...state, seenBadges: current };
  return fresh;
}

async function pushSideEffects() {
  const granted = (await notificationPermission()) === 'granted';
  const streak = streakNow();
  const timer = state.timer;
  const ping = breakPing;
  breakPing = false;
  await syncNotifications({
    granted,
    sound: state.settings.sound,
    checkIns: state.settings.checkIns,
    timer: timer
      ? {
          status: timer.status,
          endsAt: timer.endsAt,
          durationMs: timer.durationMs,
          accumulatedMs: timer.accumulatedMs,
        }
      : null,
    planReminder: state.settings.planReminder,
    planHour: state.settings.planHour,
    planMinute: state.settings.planMinute,
    streakReminder: state.settings.streakReminder && streak > 0 && !focusedToday(state.sessions),
    nudgeOn: state.settings.nudgeOn,
    nudgeHour: state.settings.nudgeHour,
    nudgeMinute: state.settings.nudgeMinute,
    startedToday:
      Boolean(state.timer && dayKey(state.timer.startedAt) === dayKey()) ||
      state.sessions.some((session) => session.kind !== 'break' && dayKey(session.startedAt) === dayKey()),
    copy: {
      endTitle: t('notifEndTitle'),
      endBody: t('notifEndBody'),
      halfTitle: t('notifHalfTitle'),
      halfBody: t('notifHalfBody'),
      fiveTitle: t('notifFiveTitle'),
      fiveBody: t('notifFiveBody'),
      planTitle: t('notifPlanTitle'),
      planBody: t('notifPlanBody'),
      streakTitle: t('notifStreakTitle'),
      streakBody: t('notifStreakBody'),
      nudgeTitle: t('nudgeNotifTitle'),
      nudgeBodies: [t('nudge1'), t('nudge2'), t('nudge3'), t('nudge4')],
      breakTitle: t('breakNotifTitle'),
      breakBody: t('breakNotifBody'),
    },
    breakPing: ping,
  });
  const label = timer?.label || 'Justora';
  await syncFocusSurface({
    title: label,
    detail: !timer ? t('widgetIdle') : timer.status === 'paused' ? t('paused') : t('widgetRunning'),
    mode: timer ? timer.status : 'idle',
    endsAt: timer?.endsAt ?? null,
    durationMs: timer?.durationMs ?? JUST_START_MIN * 60_000,
    accumulatedMs: timer?.accumulatedMs ?? 0,
  });
}

function archive(reason: 'done' | 'stop', celebrate: boolean) {
  const timer = state.timer;
  if (!timer) return;
  const now = Date.now();
  const focused = reason === 'done' ? timer.durationMs : elapsedMs(timer, now);
  const sessions = [...state.sessions];
  const estimates = [...state.estimates];
  let tasks = state.tasks.map((task) => ({ ...task }));
  let finishedSessionId: string | undefined;
  if (focused >= 15_000) {
    const session: Session = {
      id: uid(),
      label: timer.label,
      taskId: timer.taskId,
      kind: timer.kind,
      plannedMin: Math.round(timer.durationMs / 60_000),
      focusedMs: focused,
      completed: reason === 'done',
      startedAt: timer.startedAt,
      endedAt: now,
    };
    finishedSessionId = session.id;
    sessions.push(session);
  }
  if (timer.stepId && reason === 'done') {
    tasks = tasks.map((task) =>
      task.id === timer.taskId
        ? { ...task, steps: task.steps?.map((step) => (step.id === timer.stepId ? { ...step, done: true } : step)) }
        : task,
    );
  } else if (timer.taskId && reason === 'done') {
    tasks = tasks.map((task) =>
      task.id === timer.taskId ? { ...task, status: 'done', completedAt: now } : task,
    );
    if (timer.estimateMin && focused >= 60_000) {
      estimates.push({
        id: uid(),
        label: timer.label,
        guessedMin: timer.estimateMin,
        actualMin: Math.max(1, Math.round(focused / 60_000)),
        at: now,
      });
    }
  }
  state = {
    ...state,
    sessions: sessions.slice(-300),
    estimates: estimates.slice(-150),
    tasks,
    timer: null,
  };
  const badgeId = freshBadge();
  let xpGained = 0;
  const rewardEvents: RewardEvent[] = [];
  if (focused >= 60_000 && timer.kind !== 'break') {
    const minutes = Math.max(1, Math.round(focused / 60_000));
    const before = state.rewards.xp;
    let rewards = grantXp(state.rewards, minutes * XP_PER_FOCUS_MIN, rewardEvents);
    if (timer.kind === 'just-start' && reason === 'done') {
      rewards = grantXp(rewards, XP_JUST_START, rewardEvents);
    }
    const today = dayKey();
    if (completedFocusSessionsOnDay(sessions, today) === 1 && rewards.dailyCardDay !== today) {
      const pick = dailyCardPick(today, rewards.earnedCardIds, isProNow());
      if (pick) {
        const granted = grantCard(rewards, pick, isProNow());
        rewards = granted.rewards;
        if (granted.event) rewardEvents.push(granted.event);
      } else {
        rewards = grantXp(rewards, XP_DAILY_CARD_REPEAT, rewardEvents);
      }
      rewards = { ...rewards, dailyCardDay: today };
    }
    state = { ...state, rewards };
    xpGained = state.rewards.xp - before;
  }
  if (timer.taskId && !timer.stepId && reason === 'done') {
    state = { ...state, rewards: grantXp(state.rewards, XP_TASK, rewardEvents) };
    xpGained += XP_TASK;
  }
  syncRewards(rewardEvents);
  const todayCount = sessions.filter((session) => session.kind !== 'break' && session.focusedMs >= 60_000 && dayKey(session.startedAt) === dayKey(now)).length;
  const offerBreak =
    reason === 'done' &&
    timer.kind !== 'break' &&
    state.settings.breakNudge &&
    (focused >= 25 * 60_000 || todayCount >= 3);
  if (offerBreak && AppState.currentState !== 'active') breakPing = true;
  const celebration: Celebration | null = celebrate
    ? {
        id: uid(),
        code: timer.kind === 'break' ? 'break-done' : reason === 'done' ? 'finished' : 'stopped',
        label: timer.label,
        canExtend: reason === 'done' && timer.kind === 'just-start',
        offerBreak,
        badgeId,
        xpGained: xpGained > 0 ? xpGained : undefined,
        sessionId: finishedSessionId,
      }
    : state.celebration;
  state = { ...state, celebration };
  emit();
  schedulePersist();
  if (state.settings.haptics && celebrate && reason === 'done') void haptic('success');
  void pushSideEffects();
}

function begin(input: {
  label: string;
  minutes: number;
  kind: SessionKind;
  taskId?: string;
  estimateMin?: number;
  stepId?: string;
}) {
  if (state.timer) archive('stop', false);
  const now = Date.now();
  const durationMs = Math.round(input.minutes * 60_000);
  const timer: TimerState = {
    id: uid(),
    label: input.label,
    taskId: input.taskId,
    durationMs,
    accumulatedMs: 0,
    endsAt: now + durationMs,
    status: 'running',
    kind: input.kind,
    estimateMin: input.estimateMin,
    stepId: input.stepId,
    startedAt: now,
    checkpointsFired: { halfway: false, five: false },
  };
  lastRemaining = durationMs;
  patch({ timer, celebration: null });
  if (state.settings.haptics) void haptic('light');
  void pushSideEffects();
}

function sanitizeRewards(raw: unknown, sessions: Session[], tasks: Task[], moods: import('@/src/domain/types').MoodEntry[], previewPro: boolean): RewardsState {
  if (!raw || typeof raw !== 'object') {
    return backfillRewards({ sessions, tasks, moods, pro: previewPro });
  }
  const data = raw as Partial<RewardsState>;
  const base = defaultRewards();
  return {
    ...base,
    ...data,
    earnedCardIds: Array.isArray(data.earnedCardIds) ? data.earnedCardIds : [],
    revealedCardIds: Array.isArray(data.revealedCardIds) ? data.revealedCardIds : [],
    frozenDays: Array.isArray(data.frozenDays) ? data.frozenDays : [],
    quests: Array.isArray(data.quests) ? data.quests : [],
    xp: typeof data.xp === 'number' ? Math.max(0, data.xp) : 0,
    freezeCount: typeof data.freezeCount === 'number' ? Math.max(0, data.freezeCount) : 0,
  };
}

function sanitize(raw: unknown): Persisted {
  const base = defaultSettings();
  if (!raw || typeof raw !== 'object') {
    return { version: 2, settings: base, tasks: [], sessions: [], estimates: [], moods: [], seenBadges: [], timer: null, rewards: defaultRewards(), routineRun: null };
  }
  const data = raw as Partial<Persisted>;
  const settings = { ...base, ...(data.settings ?? {}) };
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const sessions = Array.isArray(data.sessions) ? data.sessions : [];
  const estimates = Array.isArray(data.estimates) ? data.estimates : [];
  const moods = Array.isArray(data.moods) ? data.moods : [];
  const persisted: Persisted = {
    version: 2,
    settings,
    tasks,
    sessions,
    estimates,
    moods,
    seenBadges: Array.isArray(data.seenBadges) ? data.seenBadges : [],
    timer: data.timer ?? null,
    rewards: data.version === 2 && data.rewards
      ? sanitizeRewards(data.rewards, sessions, tasks, moods, Boolean(settings.previewPro))
      : backfillRewards({ sessions, tasks, moods, pro: Boolean(settings.previewPro) }),
    routineRun: data.routineRun && Array.isArray(data.routineRun.steps) ? data.routineRun : null,
  };
  if (!Array.isArray(data.seenBadges)) {
    persisted.seenBadges = unlockedBadges({
      sessions: persisted.sessions,
      estimates: persisted.estimates,
      moods: persisted.moods,
      tasks: persisted.tasks,
      streak: computeStreak(persisted.sessions, persisted.tasks, { frozenDays: persisted.rewards.frozenDays }),
    });
  }
  return persisted;
}

export const actions = {
  async hydrate() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const persisted = sanitize(raw ? JSON.parse(raw) : null);
      state = { ...state, ...persisted, ready: true, rewardQueue: [] };
      syncRewards();
      if (state.timer?.status === 'running' && state.timer.endsAt && state.timer.endsAt <= Date.now()) {
        archive('done', true);
      } else {
        emit();
        schedulePersist();
        void pushSideEffects();
      }
    } catch {
      patch({ ready: true }, false);
    }
    const purchaseState = await configurePurchases();
    patch({ purchaseState }, false);
    if (purchaseState === 'ready') {
      const plans = await loadPlans();
      patch({ plans }, false);
      subscribePro((entitled) => {
        patch({ entitled }, false);
        syncRewards();
        schedulePersist();
      });
    }
    void initNotifications();
  },
  tick() {
    const timer = state.timer;
    if (!timer || timer.status !== 'running' || !timer.endsAt) return;
    const remaining = timer.endsAt - Date.now();
    if (remaining <= 0) {
      archive('done', true);
      return;
    }
    const fired = { ...timer.checkpointsFired };
    let buzz = false;
    const half = timer.durationMs / 2;
    if (!fired.halfway && timer.durationMs >= 4 * 60_000 && lastRemaining > half && remaining <= half) {
      fired.halfway = true;
      buzz = true;
    }
    const five = 5 * 60_000;
    if (!fired.five && timer.durationMs >= 10 * 60_000 && lastRemaining > five && remaining <= five) {
      fired.five = true;
      buzz = true;
    }
    lastRemaining = remaining;
    if (fired.halfway !== timer.checkpointsFired.halfway || fired.five !== timer.checkpointsFired.five) {
      patch({ timer: { ...timer, checkpointsFired: fired } });
      if (buzz && state.settings.haptics && state.settings.checkIns) void haptic('medium');
    }
  },
  foreground() {
    syncRewards();
    schedulePersist();
    const timer = state.timer;
    if (!timer || timer.status !== 'running' || !timer.endsAt) {
      void pushSideEffects();
      return;
    }
    const remaining = timer.endsAt - Date.now();
    lastRemaining = remaining;
    if (remaining <= 0) {
      archive('done', true);
      return;
    }
    const fired = { ...timer.checkpointsFired };
    if (timer.durationMs - remaining >= timer.durationMs / 2) fired.halfway = true;
    if (remaining <= 5 * 60_000) fired.five = true;
    if (fired.halfway !== timer.checkpointsFired.halfway || fired.five !== timer.checkpointsFired.five) {
      patch({ timer: { ...timer, checkpointsFired: fired } });
    }
    void pushSideEffects();
  },
  setSettings(partial: Partial<Settings>) {
    const settings = { ...state.settings, ...partial };
    if (partial.themeId && partial.themeId !== 'justora' && !isProNow()) return 'locked' as const;
    const stats = { sessions: focusSessionCount(state.sessions), streak: streakNow() };
    if (partial.accessory && partial.accessory !== 'none') {
      const rule = WEARS[partial.accessory];
      if (!lookEarned(rule, stats)) return 'locked' as const;
      if (rule.pro && !isProNow()) return 'pro' as const;
    }
    if (partial.backdrop && partial.backdrop !== 'none') {
      const rule = SCENES[partial.backdrop];
      if (!lookEarned(rule, stats)) return 'locked' as const;
      if (rule.pro && !isProNow()) return 'pro' as const;
    }
    patch({ settings });
    void pushSideEffects();
    return 'ok' as const;
  },
  finishOnboarding() {
    patch({ settings: { ...state.settings, onboardingDone: true } });
  },
  markAha() {
    patch({ settings: { ...state.settings, ahaStarted: true, onboardingDone: true } });
  },
  markPaywallSeen() {
    patch({ settings: { ...state.settings, paywallSeen: true } });
  },
  markNotifPrompted() {
    patch({ settings: { ...state.settings, notifPrompted: true } });
    void pushSideEffects();
  },
  addTask(title: string, estimateMin: number) {
    const open = state.tasks.filter((task) => task.status === 'open');
    if (!isProNow() && open.length >= FREE_TASK_LIMIT) return 'limit' as const;
    const task: Task = {
      id: uid(),
      title: title.trim(),
      estimateMin,
      status: 'open',
      createdAt: Date.now(),
    };
    patch({ tasks: [...state.tasks, task] });
    return 'ok' as const;
  },
  addRoutine(id: (typeof ROUTINES)[number]['id']) {
    const routine = ROUTINES.find((item) => item.id === id);
    if (!routine) return 'limit' as const;
    const open = state.tasks.filter((task) => task.status === 'open').length;
    const room = isProNow() ? 99 : FREE_TASK_LIMIT - open;
    if (room <= 0) return 'limit' as const;
    const added: Task[] = routine.tasks.slice(0, room).map((item) => ({
      id: uid(),
      title: t(item.titleKey as Key),
      estimateMin: item.min,
      status: 'open' as const,
      createdAt: Date.now(),
      routineId: routine.id,
    }));
    const tasks = [...state.tasks, ...added];
    state = { ...state, tasks };
    const badgeId = freshBadge();
    patch({
      tasks: state.tasks,
      seenBadges: state.seenBadges,
      celebration: badgeId
        ? { id: uid(), code: 'finished', label: added[0]?.title ?? '', canExtend: false, offerBreak: false, badgeId }
        : state.celebration,
    });
    return room < routine.tasks.length ? ('partial' as const) : ('ok' as const);
  },
  removeTask(id: string) {
    patch({ tasks: state.tasks.filter((task) => task.id !== id) });
  },
  markDone(id: string) {
    const task = state.tasks.find((item) => item.id === id);
    if (!task) return;
    if (state.timer?.taskId === id) {
      archive('done', true);
      return;
    }
    const tasks = state.tasks.map((item) =>
      item.id === id ? { ...item, status: 'done' as const, completedAt: Date.now() } : item,
    );
    const events: RewardEvent[] = [];
    state = { ...state, tasks, pendingActual: { ...task, status: 'done', completedAt: Date.now() }, rewards: grantXp(state.rewards, XP_TASK, events) };
    syncRewards(events);
    emit();
    schedulePersist();
    if (state.settings.haptics) void haptic('success');
  },
  recordActual(minutes: number) {
    const task = state.pendingActual;
    if (!task) return;
    const estimates = [
      ...state.estimates,
      { id: uid(), label: task.title, guessedMin: task.estimateMin, actualMin: minutes, at: Date.now() },
    ];
    state = { ...state, estimates, pendingActual: null };
    const badgeId = freshBadge();
    patch({
      estimates: state.estimates,
      pendingActual: null,
      seenBadges: state.seenBadges,
      celebration: badgeId
        ? { id: uid(), code: 'finished', label: task.title, canExtend: false, offerBreak: false, badgeId }
        : state.celebration,
    });
  },
  dismissActual() {
    patch({ pendingActual: null });
  },
  setMood(mood: Mood) {
    const key = dayKey();
    const moods = [...state.moods.filter((item) => item.day !== key), { day: key, mood }];
    const events: RewardEvent[] = [];
    let rewards = state.rewards;
    if (rewards.moodXpDay !== key) {
      rewards = grantXp({ ...rewards, moodXpDay: key }, XP_MOOD, events);
    }
    state = { ...state, moods, rewards };
    const badgeId = freshBadge();
    syncRewards(events);
    patch({ moods, seenBadges: state.seenBadges, rewards: state.rewards, celebration: badgeId ? { id: uid(), code: 'finished', label: '', canExtend: false, offerBreak: false, badgeId } : state.celebration });
  },
  dismissMood(day: string) {
    patch({ settings: { ...state.settings, moodDismissedDay: day } });
  },
  startPreset(minutes: number, label?: string) {
    if (minutes !== FREE_PRESET_MIN && minutes !== JUST_START_MIN && !isProNow()) return 'locked' as const;
    begin({
      label: label?.trim() || t('timer'),
      minutes,
      kind: minutes === JUST_START_MIN ? 'just-start' : 'preset',
    });
    return 'ok' as const;
  },
  startCustom(minutes: number, label?: string) {
    if (!isProNow()) return 'locked' as const;
    begin({ label: label?.trim() || t('custom'), minutes, kind: 'custom' });
    return 'ok' as const;
  },
  startTask(taskId: string) {
    const task = state.tasks.find((item) => item.id === taskId && item.status === 'open');
    if (!task) return;
    begin({
      label: task.title,
      minutes: task.estimateMin,
      kind: 'task',
      taskId: task.id,
      estimateMin: task.estimateMin,
    });
  },
  breakDown(taskId: string) {
    const task = state.tasks.find((item) => item.id === taskId && item.status === 'open');
    if (!task) return 'missing' as const;
    if (task.steps && task.steps.length > 0) return 'ok' as const;
    const today = dayKey();
    const fresh = state.settings.breakdownDay !== today;
    const used = fresh ? 0 : state.settings.breakdownCount;
    if (!isProNow() && used >= FREE_BREAKDOWNS_PER_DAY) return 'limit' as const;
    const steps = stepTemplates(task.title, task.estimateMin).map((key) => ({
      id: uid(),
      title: t(key),
      done: false,
    }));
    patch({
      tasks: state.tasks.map((item) => (item.id === taskId ? { ...item, steps } : item)),
      settings: { ...state.settings, breakdownDay: today, breakdownCount: used + 1 },
    });
    return 'ok' as const;
  },
  toggleStep(taskId: string, stepId: string) {
    patch({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, steps: task.steps?.map((step) => (step.id === stepId ? { ...step, done: !step.done } : step)) }
          : task,
      ),
    });
  },
  renameStep(taskId: string, stepId: string, title: string) {
    const next = title.trim();
    if (!next) return;
    patch({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, steps: task.steps?.map((step) => (step.id === stepId ? { ...step, title: next } : step)) }
          : task,
      ),
    });
  },
  startStep(taskId: string) {
    const task = state.tasks.find((item) => item.id === taskId && item.status === 'open');
    const step = task?.steps?.find((item) => !item.done);
    if (!task || !step) return;
    begin({
      label: step.title,
      minutes: JUST_START_MIN,
      kind: 'task',
      taskId: task.id,
      stepId: step.id,
      estimateMin: JUST_START_MIN,
    });
  },
  setFeel(sessionId: string, feel: SessionFeel) {
    patch({
      sessions: state.sessions.map((session) => (session.id === sessionId ? { ...session, feel } : session)),
    });
  },
  startJust() {
    begin({ label: t('justStart'), minutes: JUST_START_MIN, kind: 'just-start' });
    patch({ settings: { ...state.settings, ahaStarted: true, onboardingDone: true } });
  },
  startBreak(minutes = 5) {
    const key = BREAK_KEYS[state.sessions.length % BREAK_KEYS.length];
    begin({ label: t(key), minutes: minutes === 3 ? 3 : 5, kind: 'break' });
  },
  startGuide(id: string) {
    const routine = ROUTINES.find((item) => item.id === id);
    if (!routine) return;
    const steps = routine.tasks.map((item) => ({ title: t(item.titleKey), minutes: 3 }));
    if (state.timer) archive('stop', false);
    state = {
      ...state,
      routineRun: { routineId: id, index: 0, steps },
      celebration: null,
    };
    begin({ label: steps[0]?.title ?? t('guideStart'), minutes: 3, kind: 'custom' });
  },
  nextGuide() {
    const run = state.routineRun;
    if (!run) return;
    if (state.timer) archive('stop', false);
    const index = (state.routineRun?.index ?? run.index) + 1;
    const steps = state.routineRun?.steps ?? run.steps;
    if (index >= steps.length) {
      patch({
        routineRun: null,
        celebration: {
          id: uid(),
          code: 'finished',
          label: t('routineDone'),
          canExtend: false,
          offerBreak: false,
        },
      });
      return;
    }
    const step = steps[index];
    state = { ...state, routineRun: { routineId: run.routineId, index, steps }, celebration: null };
    if (!step) return;
    begin({ label: step.title, minutes: step.minutes, kind: 'custom' });
  },
  pause() {
    const timer = state.timer;
    if (!timer || timer.status !== 'running') return;
    const accumulated = elapsedMs(timer);
    patch({ timer: { ...timer, status: 'paused', accumulatedMs: accumulated, endsAt: null } });
    void pushSideEffects();
  },
  resume() {
    const timer = state.timer;
    if (!timer || timer.status !== 'paused') return;
    const remaining = Math.max(1000, timer.durationMs - timer.accumulatedMs);
    lastRemaining = remaining;
    patch({ timer: { ...timer, status: 'running', endsAt: Date.now() + remaining } });
    void pushSideEffects();
  },
  stop() {
    archive('stop', true);
  },
  dismissCelebration() {
    patch({ celebration: null });
  },
  dismissReward() {
    const queue = state.rewardQueue.slice(1);
    patch({ rewardQueue: queue }, false);
  },
  revealCard(id: Parameters<typeof grantCard>[1]) {
    if (state.rewards.revealedCardIds.includes(id)) return;
    patch({ rewards: { ...state.rewards, revealedCardIds: [...state.rewards.revealedCardIds, id] } });
  },
  claimWeeklyChest() {
    const rewards = ensurePeriod(state.rewards);
    const days = focusedDaysInWeek(state.sessions, state.tasks);
    if (rewards.weekChestClaimed || days < WEEKLY_CHEST_DAYS) {
      patch({ rewards });
      return;
    }
    const events: RewardEvent[] = [];
    let next = grantXp({ ...rewards, weekChestClaimed: true }, WEEKLY_CHEST_XP, events);
    const card = weeklyChestCard(next.weekKey, next.earnedCardIds, isProNow());
    if (card) {
      const granted = grantCard(next, card, isProNow());
      next = granted.rewards;
      if (granted.event) events.push(granted.event);
    }
    events.unshift({ id: uid(), kind: 'chest', xp: WEEKLY_CHEST_XP });
    state = { ...state, rewards: next };
    enqueue(events);
    emit();
    schedulePersist();
    if (state.settings.haptics) void haptic('success');
  },
  async purchase(id: 'monthly' | 'yearly') {
    const outcome = await buy(id);
    if (outcome.kind === 'failed') patch({ purchaseMessage: 'fail' }, false);
    if (outcome.kind === 'purchased') {
      patch({ settings: { ...state.settings, paywallSeen: true }, purchaseMessage: null });
    }
    return outcome.kind;
  },
  async restore() {
    const result = await restorePurchases();
    patch({ purchaseMessage: result }, false);
    if (result === 'restored') patch({ settings: { ...state.settings, paywallSeen: true } });
    return result;
  },
  clearPurchaseMessage() {
    patch({ purchaseMessage: null }, false);
  },
};

export function useApp() {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

export function useIsPro() {
  const current = useApp();
  return current.entitled || (__DEV__ && current.settings.previewPro);
}

const ReadyContext = createContext(false);

export function StoreProvider({ children }: { children: ReactNode }) {
  const ready = useApp().ready;
  useEffect(() => {
    void actions.hydrate();
    const timer = setInterval(() => actions.tick(), 500);
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') actions.foreground();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []);
  return <ReadyContext.Provider value={ready}>{children}</ReadyContext.Provider>;
}

export function levelName(streak: number) {
  return t(`level${companionLevel(streak)}` as Key);
}

export function accessoryName(id: AccessoryId | 'none') {
  if (id === 'none') return t('accessoryNone');
  return t(WEARS[id].nameKey);
}
