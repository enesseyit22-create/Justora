import { activeDays, computeStreak, dayKey, shiftDay, uid, weekStart } from '@/src/domain/time';
import type {
  CardId,
  CardRarity,
  DailyQuest,
  QuestKind,
  RewardEvent,
  RewardsState,
  Session,
  Task,
  MoodEntry,
} from '@/src/domain/types';

export const DAILY_GOAL_MIN = 25;
export const WEEKLY_CHEST_DAYS = 4;
export const WEEKLY_CHEST_XP = 80;
export const QUEST_XP = 15;
export const XP_PER_FOCUS_MIN = 2;
export const XP_TASK = 15;
export const XP_JUST_START = 10;
export const XP_MOOD = 8;
export const XP_DAILY_GOAL = 25;
export const XP_DAILY_CARD_REPEAT = 10;
export const FREEZE_STREAK_STEP = 7;

export type CardMotif = 'wedge' | 'companion' | 'leaf' | 'star' | 'rain' | 'orbit' | 'flame' | 'shell';

export type CardDef = {
  id: CardId;
  rarity: CardRarity;
  proOnly?: boolean;
  colors: [string, string, string];
  motif: CardMotif;
  nameKey: `card${Capitalize<CardId>}`;
  bodyKey: `card${Capitalize<CardId>}Body`;
};

export const CARDS: CardDef[] = [
  { id: 'dawnWedge', rarity: 'common', colors: ['#F8D7B0', '#F0A88A', '#FFF6EC'], motif: 'companion', nameKey: 'cardDawnWedge', bodyKey: 'cardDawnWedgeBody' },
  { id: 'softRain', rarity: 'common', colors: ['#D5E4F2', '#9EC4DE', '#F4F8FB'], motif: 'companion', nameKey: 'cardSoftRain', bodyKey: 'cardSoftRainBody' },
  { id: 'focusPebble', rarity: 'common', colors: ['#E7D3C0', '#C4A484', '#FBF6F1'], motif: 'companion', nameKey: 'cardFocusPebble', bodyKey: 'cardFocusPebbleBody' },
  { id: 'openPage', rarity: 'common', colors: ['#F3E6C8', '#E7C98A', '#FFF9F0'], motif: 'companion', nameKey: 'cardOpenPage', bodyKey: 'cardOpenPageBody' },
  { id: 'sageLeaf', rarity: 'common', colors: ['#D5E6C8', '#8FAF86', '#F4F7F1'], motif: 'companion', nameKey: 'cardSageLeaf', bodyKey: 'cardSageLeafBody' },
  { id: 'quietLamp', rarity: 'common', colors: ['#F6E2C4', '#E0B07A', '#FFF8EE'], motif: 'companion', nameKey: 'cardQuietLamp', bodyKey: 'cardQuietLampBody' },
  { id: 'justSpark', rarity: 'rare', colors: ['#F8CDB8', '#F0A88A', '#FFF1E8'], motif: 'companion', nameKey: 'cardJustSpark', bodyKey: 'cardJustSparkBody' },
  { id: 'tideShell', rarity: 'rare', colors: ['#C9E4DE', '#7EB8B0', '#F3F8F7'], motif: 'companion', nameKey: 'cardTideShell', bodyKey: 'cardTideShellBody' },
  { id: 'groveMoss', rarity: 'rare', colors: ['#D5E0C4', '#6E8F62', '#F3F6EF'], motif: 'companion', nameKey: 'cardGroveMoss', bodyKey: 'cardGroveMossBody' },
  { id: 'duskRibbon', rarity: 'rare', colors: ['#F0D4E4', '#D7A8C4', '#FBF4F8'], motif: 'companion', nameKey: 'cardDuskRibbon', bodyKey: 'cardDuskRibbonBody' },
  { id: 'inkDot', rarity: 'epic', colors: ['#E7D5C8', '#C4A898', '#F7F1EA'], motif: 'companion', nameKey: 'cardInkDot', bodyKey: 'cardInkDotBody' },
  { id: 'weekBloom', rarity: 'epic', colors: ['#F6C9D4', '#E7A0B4', '#FFF5F7'], motif: 'companion', nameKey: 'cardWeekBloom', bodyKey: 'cardWeekBloomBody' },
  { id: 'streakFlame', rarity: 'epic', colors: ['#F6C4AE', '#E07A55', '#FFF1E8'], motif: 'companion', nameKey: 'cardStreakFlame', bodyKey: 'cardStreakFlameBody' },
  { id: 'companionBloom', rarity: 'epic', colors: ['#F6CDB8', '#8FAF86', '#FFF6F1'], motif: 'companion', nameKey: 'cardCompanionBloom', bodyKey: 'cardCompanionBloomBody' },
  { id: 'goldenWedge', rarity: 'legendary', colors: ['#F6E2A8', '#E7C15A', '#FFF8E4'], motif: 'companion', nameKey: 'cardGoldenWedge', bodyKey: 'cardGoldenWedgeBody' },
  { id: 'nightOrbit', rarity: 'legendary', colors: ['#D5DEE8', '#8AA0B8', '#EEF3F8'], motif: 'companion', nameKey: 'cardNightOrbit', bodyKey: 'cardNightOrbitBody' },
  { id: 'proAurora', rarity: 'epic', proOnly: true, colors: ['#C9F0E4', '#B7A4D6', '#F4FFFB'], motif: 'companion', nameKey: 'cardProAurora', bodyKey: 'cardProAuroraBody' },
  { id: 'proConstellation', rarity: 'legendary', proOnly: true, colors: ['#E4D8F4', '#B7A4D6', '#F7F4FC'], motif: 'companion', nameKey: 'cardProConstellation', bodyKey: 'cardProConstellationBody' },
  { id: 'proGilded', rarity: 'legendary', proOnly: true, colors: ['#F6E2A8', '#E7C15A', '#FFF6DC'], motif: 'companion', nameKey: 'cardProGilded', bodyKey: 'cardProGildedBody' },
  { id: 'proMoonwell', rarity: 'epic', proOnly: true, colors: ['#C9E4DE', '#7EB8B0', '#F3F8F7'], motif: 'companion', nameKey: 'cardProMoonwell', bodyKey: 'cardProMoonwellBody' },
];

export const CARD_BY_ID: Record<CardId, CardDef> = Object.fromEntries(CARDS.map((card) => [card.id, card])) as Record<
  CardId,
  CardDef
>;

type UnlockKey =
  | 'unlockLevel'
  | 'unlockStreak'
  | 'unlockSessions'
  | 'unlockJustStarts'
  | 'unlockMoods'
  | 'unlockWeekly'
  | 'unlockProLevel'
  | 'unlockProStreak';

/** The reliable way to earn a card. Daily and weekly drops can arrive sooner. */
export function cardUnlock(id: CardId): { key: UnlockKey; count?: number } {
  switch (id) {
    case 'dawnWedge':
      return { key: 'unlockLevel', count: 2 };
    case 'quietLamp':
      return { key: 'unlockLevel', count: 3 };
    case 'companionBloom':
      return { key: 'unlockLevel', count: 5 };
    case 'goldenWedge':
      return { key: 'unlockLevel', count: 8 };
    case 'groveMoss':
      return { key: 'unlockLevel', count: 10 };
    case 'nightOrbit':
      return { key: 'unlockLevel', count: 12 };
    case 'proAurora':
      return { key: 'unlockProLevel', count: 15 };
    case 'proGilded':
      return { key: 'unlockProLevel', count: 18 };
    case 'proMoonwell':
      return { key: 'unlockProLevel', count: 20 };
    case 'sageLeaf':
      return { key: 'unlockStreak', count: 3 };
    case 'streakFlame':
      return { key: 'unlockStreak', count: 7 };
    case 'tideShell':
      return { key: 'unlockStreak', count: 10 };
    case 'weekBloom':
      return { key: 'unlockStreak', count: 14 };
    case 'proConstellation':
      return { key: 'unlockProStreak', count: 30 };
    case 'focusPebble':
      return { key: 'unlockSessions', count: 1 };
    case 'openPage':
      return { key: 'unlockSessions', count: 10 };
    case 'duskRibbon':
      return { key: 'unlockSessions', count: 25 };
    case 'justSpark':
      return { key: 'unlockJustStarts', count: 3 };
    case 'softRain':
      return { key: 'unlockMoods', count: 5 };
    case 'inkDot':
      return { key: 'unlockWeekly' };
    default: {
      const never: never = id;
      return never;
    }
  }
}

export function defaultRewards(): RewardsState {
  return {
    xp: 0,
    lastLevelSeen: 1,
    earnedCardIds: [],
    revealedCardIds: [],
    freezeCount: 0,
    freezeEarnedTiers: 0,
    frozenDays: [],
    proFreezeGranted: false,
    dailyGoalAwardedDay: '',
    moodXpDay: '',
    dailyCardDay: '',
    questsDay: '',
    quests: [],
    weekKey: '',
    weekChestClaimed: false,
    freezeMonth: '',
  };
}

export function maxFreezes(pro: boolean): number {
  return pro ? 2 : 1;
}

export function refillMonthlyFreeze(rewards: RewardsState, pro: boolean, now = Date.now()): RewardsState {
  const month = dayKey(now).slice(0, 7);
  if (rewards.freezeMonth === month) return rewards;
  return { ...rewards, freezeMonth: month, freezeCount: maxFreezes(pro) };
}

export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let current = 1; current < level; current += 1) {
    total += 50 + current * 25;
  }
  return total;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (level < 99 && xp >= xpRequiredForLevel(level + 1)) level += 1;
  return level;
}

export function levelProgress(xp: number): { level: number; current: number; needed: number; ratio: number } {
  const level = levelFromXp(xp);
  const start = xpRequiredForLevel(level);
  const next = xpRequiredForLevel(level + 1);
  const needed = Math.max(1, next - start);
  const current = Math.max(0, xp - start);
  return { level, current, needed, ratio: Math.min(1, current / needed) };
}

export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const QUEST_POOL: { kind: QuestKind; target: number }[] = [
  { kind: 'session', target: 1 },
  { kind: 'focusMin', target: 15 },
  { kind: 'justStart', target: 1 },
  { kind: 'task', target: 1 },
  { kind: 'mood', target: 1 },
  { kind: 'goal', target: DAILY_GOAL_MIN },
];

export function questsForDay(day: string): DailyQuest[] {
  const pool = [...QUEST_POOL];
  const picked: DailyQuest[] = [];
  let seed = hashString(`justora-quests-${day}`);
  while (picked.length < 3 && pool.length > 0) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const index = seed % pool.length;
    const [item] = pool.splice(index, 1);
    picked.push({ kind: item.kind, target: item.target, progress: 0, claimed: false });
  }
  return picked;
}

export function focusedMinutesOnDay(sessions: Session[], day: string): number {
  const ms = sessions
    .filter((session) => session.kind !== 'break' && dayKey(session.endedAt) === day)
    .reduce((sum, session) => sum + session.focusedMs, 0);
  return Math.round(ms / 60_000);
}

export function completedFocusSessionsOnDay(sessions: Session[], day: string, kind?: Session['kind']): number {
  return sessions.filter(
    (session) =>
      session.kind !== 'break' &&
      session.focusedMs >= 60_000 &&
      dayKey(session.endedAt) === day &&
      (kind ? session.kind === kind : true),
  ).length;
}

export function tasksFinishedOnDay(tasks: Task[], day: string): number {
  return tasks.filter((task) => task.completedAt && dayKey(task.completedAt) === day).length;
}

export function questProgressValue(
  kind: QuestKind,
  input: { sessions: Session[]; tasks: Task[]; moods: MoodEntry[]; day: string },
): number {
  const minutes = focusedMinutesOnDay(input.sessions, input.day);
  switch (kind) {
    case 'session':
      return completedFocusSessionsOnDay(input.sessions, input.day);
    case 'focusMin':
      return minutes;
    case 'justStart':
      return completedFocusSessionsOnDay(input.sessions, input.day, 'just-start');
    case 'task':
      return tasksFinishedOnDay(input.tasks, input.day);
    case 'mood':
      return input.moods.some((item) => item.day === input.day) ? 1 : 0;
    case 'goal':
      return minutes;
    default:
      return 0;
  }
}

export function weekKeyFor(now = Date.now()): string {
  return dayKey(weekStart(now));
}

export function focusedDaysInWeek(sessions: Session[], tasks: Task[], now = Date.now()): number {
  const start = weekStart(now);
  const end = start + 7 * 86_400_000;
  const days = new Set<string>();
  for (const session of sessions) {
    if (session.kind === 'break' || session.focusedMs < 60_000) continue;
    if (session.endedAt >= start && session.endedAt < end) days.add(dayKey(session.endedAt));
  }
  for (const task of tasks) {
    if (task.completedAt && task.completedAt >= start && task.completedAt < end) days.add(dayKey(task.completedAt));
  }
  return days.size;
}

function lastCoveredDay(activity: Set<string>, frozen: readonly string[]): string | null {
  const all = [...activity, ...frozen];
  if (all.length === 0) return null;
  return all.reduce((latest, day) => (day > latest ? day : latest));
}

export function applyStreakFreezes(input: {
  sessions: Session[];
  tasks: Task[];
  freezeCount: number;
  frozenDays: readonly string[];
  now?: number;
}): { streak: number; freezeCount: number; frozenDays: string[]; used: string[] } {
  const now = input.now ?? Date.now();
  const today = dayKey(now);
  const yesterday = shiftDay(today, -1);
  const activity = activeDays(input.sessions, input.tasks);
  const frozen = new Set(input.frozenDays);
  const last = lastCoveredDay(activity, [...frozen]);
  const used: string[] = [];
  let stock = input.freezeCount;

  if (last && last < yesterday) {
    const gap: string[] = [];
    let cursor = shiftDay(last, 1);
    while (cursor <= yesterday) {
      if (!activity.has(cursor) && !frozen.has(cursor)) gap.push(cursor);
      cursor = shiftDay(cursor, 1);
    }
    if (gap.length > 0 && gap.length <= stock) {
      for (const day of gap) {
        frozen.add(day);
        used.push(day);
        stock -= 1;
      }
    }
  }

  const streak = computeStreak(input.sessions, input.tasks, { now, frozenDays: [...frozen] });
  return { streak, freezeCount: stock, frozenDays: [...frozen], used };
}

export function awardStreakFreezes(input: {
  streak: number;
  freezeCount: number;
  freezeEarnedTiers: number;
  pro: boolean;
}): { freezeCount: number; freezeEarnedTiers: number; earned: number } {
  if (input.streak <= 0) {
    return { freezeCount: input.freezeCount, freezeEarnedTiers: 0, earned: 0 };
  }
  const tiers = Math.floor(input.streak / FREEZE_STREAK_STEP);
  const room = Math.max(0, maxFreezes(input.pro) - input.freezeCount);
  const earned = Math.min(room, Math.max(0, tiers - input.freezeEarnedTiers));
  return {
    freezeCount: input.freezeCount + earned,
    freezeEarnedTiers: tiers,
    earned,
  };
}

const LEVEL_CARDS: Record<number, CardId> = {
  2: 'dawnWedge',
  3: 'quietLamp',
  5: 'companionBloom',
  8: 'goldenWedge',
  12: 'nightOrbit',
  15: 'proAurora',
  18: 'proGilded',
  20: 'proMoonwell',
};

const STREAK_CARDS: Record<number, CardId> = {
  3: 'sageLeaf',
  7: 'streakFlame',
  14: 'weekBloom',
  30: 'proConstellation',
};

export function milestoneCards(input: {
  level: number;
  streak: number;
  sessions: Session[];
  moods: MoodEntry[];
  justStarts: number;
}): CardId[] {
  const earned: CardId[] = [];
  for (const [level, card] of Object.entries(LEVEL_CARDS)) {
    if (input.level >= Number(level)) earned.push(card);
  }
  for (const [streak, card] of Object.entries(STREAK_CARDS)) {
    if (input.streak >= Number(streak)) earned.push(card);
  }
  const real = input.sessions.filter((session) => session.kind !== 'break' && session.focusedMs >= 60_000);
  if (real.length >= 1) earned.push('focusPebble');
  if (real.length >= 10) earned.push('openPage');
  if (real.length >= 25) earned.push('duskRibbon');
  if (input.justStarts >= 3) earned.push('justSpark');
  if (input.moods.length >= 5) earned.push('softRain');
  if (input.level >= 10) earned.push('groveMoss');
  if (input.streak >= 10) earned.push('tideShell');
  return earned;
}

export function canEarnCard(id: CardId, pro: boolean): boolean {
  const def = CARD_BY_ID[id];
  return Boolean(def) && (pro || !def.proOnly);
}

export function dailyCardPick(day: string, owned: readonly CardId[], pro: boolean): CardId | null {
  const pool = CARDS.filter(
    (card) =>
      (card.rarity === 'common' || card.rarity === 'rare') &&
      !card.proOnly &&
      !owned.includes(card.id) &&
      canEarnCard(card.id, pro),
  );
  if (pool.length === 0) return null;
  return pool[hashString(`justora-daily-${day}`) % pool.length]!.id;
}

export function weeklyChestCard(weekKey: string, owned: readonly CardId[], pro: boolean): CardId | null {
  const pool = CARDS.filter(
    (card) =>
      (card.rarity === 'rare' || card.rarity === 'epic') &&
      !owned.includes(card.id) &&
      canEarnCard(card.id, pro),
  );
  if (pool.length === 0) {
    const fallback = CARDS.find((card) => card.id === 'inkDot' && !owned.includes(card.id) && canEarnCard(card.id, pro));
    return fallback?.id ?? null;
  }
  return pool[hashString(`justora-chest-${weekKey}`) % pool.length]!.id;
}

export function grantCard(
  rewards: RewardsState,
  id: CardId,
  pro: boolean,
): { rewards: RewardsState; event: RewardEvent | null } {
  if (rewards.earnedCardIds.includes(id) || !canEarnCard(id, pro)) {
    return { rewards, event: null };
  }
  return {
    rewards: { ...rewards, earnedCardIds: [...rewards.earnedCardIds, id] },
    event: { id: uid(), kind: 'card', cardId: id },
  };
}

export function addXp(rewards: RewardsState, amount: number): { rewards: RewardsState; levels: number[] } {
  if (amount <= 0) return { rewards, levels: [] };
  const before = levelFromXp(rewards.xp);
  const next = { ...rewards, xp: rewards.xp + amount };
  const after = levelFromXp(next.xp);
  const levels: number[] = [];
  for (let level = before + 1; level <= after; level += 1) levels.push(level);
  next.lastLevelSeen = after;
  return { rewards: next, levels };
}

export function backfillRewards(input: {
  sessions: Session[];
  tasks: Task[];
  moods: MoodEntry[];
  pro: boolean;
  now?: number;
}): RewardsState {
  const now = input.now ?? Date.now();
  let rewards = defaultRewards();
  const real = input.sessions.filter((session) => session.kind !== 'break' && session.focusedMs >= 60_000);
  const focusMin = Math.round(real.reduce((sum, session) => sum + session.focusedMs, 0) / 60_000);
  let xp = focusMin * XP_PER_FOCUS_MIN;
  xp += real.filter((session) => session.kind === 'just-start').length * XP_JUST_START;
  xp += input.tasks.filter((task) => task.status === 'done').length * XP_TASK;
  const moodDays = new Set(input.moods.map((item) => item.day));
  xp += moodDays.size * XP_MOOD;
  const days = new Set(real.map((session) => dayKey(session.endedAt)));
  for (const day of days) {
    if (focusedMinutesOnDay(input.sessions, day) >= DAILY_GOAL_MIN) xp += XP_DAILY_GOAL;
  }
  rewards.xp = xp;
  rewards.lastLevelSeen = levelFromXp(xp);
  const frozen = applyStreakFreezes({
    sessions: input.sessions,
    tasks: input.tasks,
    freezeCount: 0,
    frozenDays: [],
    now,
  });
  // Do not spend freezes on migration of a long absence; only keep computed streak.
  const streak = computeStreak(input.sessions, input.tasks, { now, frozenDays: frozen.used.length ? [] : frozen.frozenDays });
  const awarded = awardStreakFreezes({
    streak,
    freezeCount: 0,
    freezeEarnedTiers: 0,
    pro: input.pro,
  });
  rewards.freezeCount = awarded.freezeCount;
  rewards.freezeEarnedTiers = awarded.freezeEarnedTiers;
  const justStarts = real.filter((session) => session.kind === 'just-start').length;
  const cards = milestoneCards({
    level: rewards.lastLevelSeen,
    streak,
    sessions: input.sessions,
    moods: input.moods,
    justStarts,
  }).filter((id) => canEarnCard(id, input.pro));
  rewards.earnedCardIds = [...new Set(cards)];
  rewards.revealedCardIds = [...rewards.earnedCardIds];
  const today = dayKey(now);
  rewards.questsDay = today;
  rewards.quests = questsForDay(today).map((quest) => {
    const progress = Math.min(quest.target, questProgressValue(quest.kind, { ...input, day: today }));
    return { ...quest, progress, claimed: progress >= quest.target };
  });
  rewards.weekKey = weekKeyFor(now);
  rewards.weekChestClaimed = false;
  if (focusedMinutesOnDay(input.sessions, today) >= DAILY_GOAL_MIN) rewards.dailyGoalAwardedDay = today;
  if (input.moods.some((item) => item.day === today)) rewards.moodXpDay = today;
  if (completedFocusSessionsOnDay(input.sessions, today) > 0) rewards.dailyCardDay = today;
  return rewards;
}

export function ensurePeriod(rewards: RewardsState, now = Date.now()): RewardsState {
  const today = dayKey(now);
  const week = weekKeyFor(now);
  let next = rewards;
  if (next.questsDay !== today) {
    next = { ...next, questsDay: today, quests: questsForDay(today) };
  }
  if (next.weekKey !== week) {
    next = { ...next, weekKey: week, weekChestClaimed: false };
  }
  return next;
}
