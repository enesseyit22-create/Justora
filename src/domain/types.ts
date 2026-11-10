export type ThemeId = 'justora' | 'tide' | 'grove' | 'dusk' | 'ink';
export type AppLocale = 'en' | 'tr' | 'de' | 'es' | 'fr' | 'pt-BR' | 'it' | 'ja';
export type LocaleSetting = 'system' | AppLocale;
export type AmbientMix = { rain: number; brown: number };
export type AccessoryId = 'flower' | 'scarf' | 'glasses' | 'star';
export type Mood = 'heavy' | 'foggy' | 'steady' | 'bright';
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
  moodDismissedDay: string;
};

export type Task = {
  id: string;
  title: string;
  estimateMin: number;
  status: 'open' | 'done';
  createdAt: number;
  completedAt?: number;
  routineId?: string;
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
};

export type Persisted = {
  version: 1;
  settings: Settings;
  tasks: Task[];
  sessions: Session[];
  estimates: Estimate[];
  moods: MoodEntry[];
  seenBadges: BadgeId[];
  timer: TimerState | null;
};
