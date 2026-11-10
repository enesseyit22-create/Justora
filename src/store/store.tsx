import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { FREE_PRESET_MIN, FREE_TASK_LIMIT, JUST_START_MIN } from '@/src/config';
import type {
  AccessoryId,
  BadgeId,
  Celebration,
  Mood,
  Persisted,
  Session,
  SessionKind,
  Settings,
  Task,
  ThemeId,
  TimerState,
} from '@/src/domain/types';
import {
  ACCESSORY_STREAK,
  BREAK_KEYS,
  companionLevel,
  computeStreak,
  elapsedMs,
  focusedToday,
  ROUTINES,
  uid,
  unlockedBadges,
} from '@/src/domain/time';
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
  moodDismissedDay: '',
});

type State = Persisted & {
  ready: boolean;
  entitled: boolean;
  purchaseState: ConfigureResult;
  plans: { monthly: PlanInfo | null; yearly: PlanInfo | null };
  celebration: Celebration | null;
  pendingActual: Task | null;
  purchaseMessage: string | null;
};

let state: State = {
  version: 1,
  settings: defaultSettings(),
  tasks: [],
  sessions: [],
  estimates: [],
  moods: [],
  seenBadges: [],
  timer: null,
  ready: false,
  entitled: false,
  purchaseState: 'missing-key',
  plans: { monthly: null, yearly: null },
  celebration: null,
  pendingActual: null,
  purchaseMessage: null,
};

const listeners = new Set<() => void>();
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let lastRemaining = 0;

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
    const { settings, tasks, sessions, estimates, moods, seenBadges, timer } = state;
    const payload: Persisted = { version: 1, settings, tasks, sessions, estimates, moods, seenBadges, timer };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, 180);
}

function isProNow() {
  return state.entitled || (__DEV__ && state.settings.previewPro);
}

function freshBadge(): BadgeId | undefined {
  const current = unlockedBadges({
    sessions: state.sessions,
    estimates: state.estimates,
    moods: state.moods,
    tasks: state.tasks,
    streak: computeStreak(state.sessions, state.tasks),
  });
  const fresh = current.find((id) => !state.seenBadges.includes(id));
  state = { ...state, seenBadges: current };
  return fresh;
}

async function pushSideEffects() {
  const granted = (await notificationPermission()) === 'granted';
  const streak = computeStreak(state.sessions, state.tasks);
  const timer = state.timer;
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
    },
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
    sessions.push(session);
  }
  if (timer.taskId && reason === 'done') {
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
  const celebration: Celebration | null = celebrate
    ? {
        id: uid(),
        code: timer.kind === 'break' ? 'break-done' : reason === 'done' ? 'finished' : 'stopped',
        label: timer.label,
        canExtend: reason === 'done' && timer.kind === 'just-start',
        offerBreak: reason === 'done' && timer.kind !== 'break',
        badgeId,
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
    startedAt: now,
    checkpointsFired: { halfway: false, five: false },
  };
  lastRemaining = durationMs;
  patch({ timer, celebration: null });
  if (state.settings.haptics) void haptic('light');
  void pushSideEffects();
}

function sanitize(raw: unknown): Persisted {
  const base = defaultSettings();
  if (!raw || typeof raw !== 'object') {
    return { version: 1, settings: base, tasks: [], sessions: [], estimates: [], moods: [], seenBadges: [], timer: null };
  }
  const data = raw as Partial<Persisted>;
  const settings = { ...base, ...(data.settings ?? {}) };
  const persisted: Persisted = {
    version: 1,
    settings,
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    sessions: Array.isArray(data.sessions) ? data.sessions : [],
    estimates: Array.isArray(data.estimates) ? data.estimates : [],
    moods: Array.isArray(data.moods) ? data.moods : [],
    seenBadges: Array.isArray(data.seenBadges) ? data.seenBadges : [],
    timer: data.timer ?? null,
  };
  if (!Array.isArray(data.seenBadges)) {
    persisted.seenBadges = unlockedBadges({
      sessions: persisted.sessions,
      estimates: persisted.estimates,
      moods: persisted.moods,
      tasks: persisted.tasks,
      streak: computeStreak(persisted.sessions, persisted.tasks),
    });
  }
  return persisted;
}

export const actions = {
  async hydrate() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const persisted = sanitize(raw ? JSON.parse(raw) : null);
      state = { ...state, ...persisted, ready: true };
      if (state.timer?.status === 'running' && state.timer.endsAt && state.timer.endsAt <= Date.now()) {
        archive('done', true);
      } else {
        emit();
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
      subscribePro((entitled) => patch({ entitled }, false));
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
    if (partial.accessory && partial.accessory !== 'none') {
      const need = ACCESSORY_STREAK[partial.accessory];
      if (computeStreak(state.sessions, state.tasks) < need) return 'locked' as const;
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
    patch({ tasks, pendingActual: { ...task, status: 'done', completedAt: Date.now() } });
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
    const day = new Date();
    const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    const moods = [...state.moods.filter((item) => item.day !== key), { day: key, mood }];
    state = { ...state, moods };
    const badgeId = freshBadge();
    patch({ moods, seenBadges: state.seenBadges, celebration: badgeId ? { id: uid(), code: 'finished', label: '', canExtend: false, offerBreak: false, badgeId } : state.celebration });
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
  startJust() {
    begin({ label: t('justStart'), minutes: JUST_START_MIN, kind: 'just-start' });
    patch({ settings: { ...state.settings, ahaStarted: true, onboardingDone: true } });
  },
  startBreak() {
    const key = BREAK_KEYS[state.sessions.length % BREAK_KEYS.length];
    begin({ label: t(key), minutes: 5, kind: 'break' });
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
  const map = { flower: 'accessoryFlower', scarf: 'accessoryScarf', glasses: 'accessoryGlasses', star: 'accessoryStar' } as const;
  return t(map[id]);
}
