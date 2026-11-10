export type ThemeId = 'justora' | 'tide' | 'grove' | 'dusk' | 'ink';
export type AppLocale = 'en' | 'tr' | 'de' | 'es' | 'fr' | 'pt-BR' | 'it' | 'ja';
export type LocaleSetting = 'system' | AppLocale;
export type AmbientMix = { rain: number; brown: number };
export type AccessoryId = 'flower' | 'cap' | 'scarf' | 'glasses' | 'beret' | 'ribbon' | 'rounds' | 'star';
export type BackdropId = 'none' | 'sunset' | 'meadow' | 'night';
export type Mood = 'heavy' | 'foggy' | 'steady' | 'bright';
export type SessionFeel = 'rough' | 'low' | 'ok' | 'good' | 'great';
export type SessionKind = 'preset' | 'custom' | 'just-start' | 'task' | 'break';
export type BadgeId =
  | 'first'
  | 'just'
  | 'streak3'
  | 'streak7'
  | 'streak14'
  | 'sessions10'
  | 'estimates5'
  | 'routine'
  | 'break'
  | 'mood';

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type CardId =
  | 'dawnWedge'
  | 'softRain'
  | 'focusPebble'
  | 'openPage'
  | 'sageLeaf'
  | 'quietLamp'
  | 'justSpark'
  | 'tideShell'
  | 'groveMoss'
  | 'duskRibbon'
  | 'inkDot'
  | 'weekBloom'
  | 'streakFlame'
  | 'companionBloom'
  | 'goldenWedge'
  | 'nightOrbit'
  | 'proAurora'
  | 'proConstellation'
  | 'proGilded'
  | 'proMoonwell';

export type QuestKind = 'session' | 'focusMin' | 'justStart' | 'task' | 'mood' | 'goal';

export type DailyQuest = {
  kind: QuestKind;
  target: number;
  progress: number;
  claimed: boolean;
};

export type RewardEvent =
  | { id: string; kind: 'level-up'; level: number }
  | { id: string; kind: 'card'; cardId: CardId }
  | { id: string; kind: 'freeze-earned'; count: number }
  | { id: string; kind: 'freeze-used'; day: string }
  | { id: string; kind: 'chest'; xp: number }
  | { id: string; kind: 'quest'; questKind: QuestKind; xp: number };

export type RewardsState = {
  xp: number;
  lastLevelSeen: number;
  earnedCardIds: CardId[];
  revealedCardIds: CardId[];
  freezeCount: number;
  freezeEarnedTiers: number;
  frozenDays: string[];
  proFreezeGranted: boolean;
  dailyGoalAwardedDay: string;
  moodXpDay: string;
  dailyCardDay: string;
  questsDay: string;
  quests: DailyQuest[];
  weekKey: string;
  weekChestClaimed: boolean;
  freezeMonth: string;
};

export type Settings = {
  sound: boolean;
  haptics: boolean;
  checkIns: boolean;
  rain: number;
  brown: number;
  metronome: boolean;
  metronomeSec: 30 | 60 | 90;
  themeId: ThemeId;
  locale: LocaleSetting;
  onboardingDone: boolean;
  ahaStarted: boolean;
  paywallSeen: boolean;
  previewPro: boolean;
  notifPrompted: boolean;
  planReminder: boolean;
  planHour: number;
  planMinute: number;
  streakReminder: boolean;
  accessory: AccessoryId | 'none';
  backdrop: BackdropId;
  breakNudge: boolean;
  moodDismissedDay: string;
  breakdownDay: string;
  breakdownCount: number;
  nudgeOn: boolean;
  nudgeHour: number;
  nudgeMinute: number;
};

export type TaskStep = {
  id: string;
  title: string;
  done: boolean;
};

export type Task = {
  id: string;
  title: string;
  estimateMin: number;
  status: 'open' | 'done';
  createdAt: number;
  completedAt?: number;
  routineId?: string;
  steps?: TaskStep[];
};

export type Session = {
  id: string;
  label: string;
  taskId?: string;
  kind: SessionKind;
  plannedMin: number;
  focusedMs: number;
  completed: boolean;
  startedAt: number;
  endedAt: number;
  feel?: SessionFeel;
};

export type Estimate = {
  id: string;
  label: string;
  guessedMin: number;
  actualMin: number;
  at: number;
};

export type MoodEntry = { day: string; mood: Mood };

export type TimerState = {
  id: string;
  label: string;
  taskId?: string;
  durationMs: number;
  accumulatedMs: number;
  endsAt: number | null;
  status: 'running' | 'paused';
  kind: SessionKind;
  estimateMin?: number;
  stepId?: string;
  startedAt: number;
  checkpointsFired: { halfway: boolean; five: boolean };
};

export type Celebration = {
  id: string;
  code: 'finished' | 'stopped' | 'break-done';
  label: string;
  canExtend: boolean;
  offerBreak: boolean;
  badgeId?: BadgeId;
  xpGained?: number;
  sessionId?: string;
};

export type RoutineRun = {
  routineId: string;
  index: number;
  steps: { title: string; minutes: number }[];
};

export type Persisted = {
  version: 1 | 2;
  settings: Settings;
  tasks: Task[];
  sessions: Session[];
  estimates: Estimate[];
  moods: MoodEntry[];
  seenBadges: BadgeId[];
  timer: TimerState | null;
  rewards: RewardsState;
  routineRun: RoutineRun | null;
};
