import type { Key } from '@/src/i18n';
import type { AccessoryId, BackdropId } from '@/src/domain/types';

export type LookRule = {
  pro: boolean;
  sessions: number;
  streak: number;
  nameKey: Key;
};

export const WEARS: Record<AccessoryId, LookRule> = {
  flower: { pro: false, sessions: 1, streak: 0, nameKey: 'accessoryFlower' },
  cap: { pro: false, sessions: 3, streak: 0, nameKey: 'accessoryCap' },
  scarf: { pro: false, sessions: 0, streak: 3, nameKey: 'accessoryScarf' },
  glasses: { pro: false, sessions: 0, streak: 7, nameKey: 'accessoryGlasses' },
  beret: { pro: true, sessions: 8, streak: 0, nameKey: 'accessoryBeret' },
  ribbon: { pro: true, sessions: 0, streak: 10, nameKey: 'accessoryRibbon' },
  rounds: { pro: true, sessions: 12, streak: 0, nameKey: 'accessoryRounds' },
  star: { pro: false, sessions: 0, streak: 14, nameKey: 'accessoryStar' },
};

export const SCENES: Record<Exclude<BackdropId, 'none'>, LookRule> = {
  sunset: { pro: false, sessions: 5, streak: 0, nameKey: 'accessorySunset' },
  meadow: { pro: true, sessions: 0, streak: 7, nameKey: 'accessoryMeadow' },
  night: { pro: true, sessions: 15, streak: 0, nameKey: 'accessoryNight' },
};

export function focusSessionCount(sessions: { kind: string; focusedMs: number }[]): number {
  return sessions.filter((session) => session.kind !== 'break' && session.focusedMs >= 60_000).length;
}

export function lookEarned(rule: LookRule, stats: { sessions: number; streak: number }): boolean {
  if (rule.sessions > 0 && stats.sessions < rule.sessions) return false;
  if (rule.streak > 0 && stats.streak < rule.streak) return false;
  return true;
}
