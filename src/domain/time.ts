import type { BadgeId, Estimate, MoodEntry, Session, Task, TimerState } from '@/src/domain/types';

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function dayKey(ts = Date.now()): string {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function elapsedMs(timer: TimerState, now = Date.now()): number {
  if (timer.status === 'paused' || !timer.endsAt) {
    return clamp(timer.accumulatedMs, 0, timer.durationMs);
  }
  const remaining = Math.max(0, timer.endsAt - now);
  return clamp(timer.durationMs - remaining, 0, timer.durationMs);
}

export function remainingMs(timer: TimerState, now = Date.now()): number {
  return Math.max(0, timer.durationMs - elapsedMs(timer, now));
}

export function activeDays(sessions: Session[], tasks: Task[]): Set<string> {
  const days = new Set<string>();
  for (const session of sessions) {
    if (session.focusedMs >= 60_000 && session.kind !== 'break') days.add(dayKey(session.endedAt));
  }
  for (const task of tasks) {
    if (task.completedAt) days.add(dayKey(task.completedAt));
  }
  return days;
}

export function shiftDay(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + delta).getTime());
}

export function computeStreak(
  sessions: Session[],
  tasks: Task[],
  options?: { now?: number; frozenDays?: readonly string[] },
): number {
  const now = options?.now ?? Date.now();
  const days = activeDays(sessions, tasks);
  for (const frozen of options?.frozenDays ?? []) days.add(frozen);
  let cursor = dayKey(now);
  if (!days.has(cursor)) {
    cursor = shiftDay(cursor, -1);
    if (!days.has(cursor)) return 0;
  }
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  return streak;
}

export function focusedToday(sessions: Session[], now = Date.now()): boolean {
  const today = dayKey(now);
  return sessions.some(
    (session) => session.kind !== 'break' && session.focusedMs >= 60_000 && dayKey(session.endedAt) === today,
  );
}

export function minutesBetween(sessions: Session[], start: number, end: number): number {
  const ms = sessions
    .filter((session) => session.kind !== 'break' && session.endedAt >= start && session.endedAt < end)
    .reduce((sum, session) => sum + session.focusedMs, 0);
  return Math.round(ms / 60_000);
}

export function weekStart(now = Date.now()): number {
  const d = new Date(now);
  const mondayOffset = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - mondayOffset);
  return d.getTime();
}

export function estimateBias(estimates: Estimate[]): number | null {
  if (estimates.length === 0) return null;
  const diffs = estimates.map((item) => (item.actualMin - item.guessedMin) / Math.max(1, item.guessedMin));
  return diffs.reduce((sum, n) => sum + n, 0) / diffs.length;
}

export function companionLevel(streak: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (streak >= 30) return 5;
  if (streak >= 14) return 4;
  if (streak >= 7) return 3;
  if (streak >= 3) return 2;
  if (streak >= 1) return 1;
  return 0;
}

export const ACCESSORY_STREAK = {
  flower: 3,
  scarf: 7,
  glasses: 14,
  star: 30,
} as const;

export function unlockedBadges(input: {
  sessions: Session[];
  estimates: Estimate[];
  moods: MoodEntry[];
  tasks: Task[];
  streak: number;
}): BadgeId[] {
  const badges: BadgeId[] = [];
  const real = input.sessions.filter((session) => session.kind !== 'break' && session.focusedMs >= 60_000);
  if (real.length > 0) badges.push('first');
  if (real.some((session) => session.kind === 'just-start')) badges.push('just');
  if (input.streak >= 3) badges.push('streak3');
  if (input.streak >= 7) badges.push('streak7');
  if (input.streak >= 14) badges.push('streak14');
  if (real.length >= 10) badges.push('sessions10');
  if (input.estimates.length >= 5) badges.push('estimates5');
  if (input.tasks.some((task) => task.routineId)) badges.push('routine');
  if (input.sessions.some((session) => session.kind === 'break' && session.focusedMs >= 30_000)) badges.push('break');
  if (input.moods.length > 0) badges.push('mood');
  return badges;
}

export const ROUTINES = [
  {
    id: 'morning',
    tasks: [
      { titleKey: 'routineMorning1', min: 10 },
      { titleKey: 'routineMorning2', min: 15 },
      { titleKey: 'routineMorning3', min: 5 },
    ],
  },
  {
    id: 'study',
    tasks: [
      { titleKey: 'routineStudy1', min: 25 },
      { titleKey: 'routineStudy2', min: 10 },
      { titleKey: 'routineStudy3', min: 15 },
    ],
  },
  {
    id: 'cleaning',
    tasks: [
      { titleKey: 'routineClean1', min: 10 },
      { titleKey: 'routineClean2', min: 15 },
      { titleKey: 'routineClean3', min: 10 },
    ],
  },
] as const;

export const BREAK_KEYS = ['break1', 'break2', 'break3', 'break4'] as const;
