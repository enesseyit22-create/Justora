import { router } from 'expo-router';
import { useRef } from 'react';
import { Share, View } from 'react-native';

import { CollectibleCard } from '@/src/components/CollectibleCard';
import { AmbientGlow, Enter, FocusRing, GlassCard } from '@/src/components/chrome';
import { Press, PrimaryButton, Screen, Txt } from '@/src/components/ui';
import {
  CARD_BY_ID,
  DAILY_GOAL_MIN,
  WEEKLY_CHEST_DAYS,
  WEEKLY_CHEST_XP,
  XP_DAILY_GOAL,
  focusedDaysInWeek,
  focusedMinutesOnDay,
  maxFreezes,
} from '@/src/domain/rewards';
import { ACCESSORY_STREAK, computeStreak, dayKey, weekStart } from '@/src/domain/time';
import type { AccessoryId, BadgeId, Session } from '@/src/domain/types';
import type { Key } from '@/src/i18n';
import { useI18n } from '@/src/i18n/useI18n';
import { haptic } from '@/src/services/haptics';
import { actions, useApp, useIsPro } from '@/src/store/store';
import { useTheme } from '@/src/theme/theme';

const BADGES: BadgeId[] = ['first', 'just', 'streak3', 'streak7', 'streak14', 'sessions10', 'estimates5', 'routine', 'break', 'mood'];

function questKey(kind: string): Key {
  if (kind === 'session') return 'questSession';
  if (kind === 'focusMin') return 'questFocusMin';
  if (kind === 'justStart') return 'questJust';
  if (kind === 'task') return 'questTask';
  if (kind === 'mood') return 'questMood';
  return 'questGoal';
}

export default function ProgressScreen() {
  const { tasks, settings, moods, rewards, sessions, seenBadges } = useApp();
  const pro = useIsPro();
  const { t } = useI18n();
  const { palette } = useTheme();
  const today = dayKey();
  const moodToday = moods.find((item) => item.day === today);
  const streak = computeStreak(sessions, tasks, { frozenDays: rewards.frozenDays });
  const todayMin = focusedMinutesOnDay(sessions, today);
  const goalRatio = Math.min(1, todayMin / DAILY_GOAL_MIN);
  const latestId = rewards.earnedCardIds[rewards.earnedCardIds.length - 1];
  const latest = latestId ? CARD_BY_ID[latestId] : null;
  const weekDays = focusedDaysInWeek(sessions, tasks);
  const unlocked = new Set(seenBadges);
  const names: Record<BadgeId, string> = {
    first: t('badgeFirst'),
    just: t('badgeJust'),
    streak3: t('badgeStreak3'),
    streak7: t('badgeStreak7'),
    streak14: t('badgeStreak14'),
    sessions10: t('badgeSessions'),
    estimates5: t('badgeEstimates'),
    routine: t('badgeRoutine'),
    break: t('badgeBreak'),
    mood: t('badgeMood'),
  };

  const buzz = () => {
    if (settings.haptics) void haptic('light');
  };

  return (
    <Screen scroll bottomInset={false} background={<AmbientGlow />}>
      <Enter>
        <Txt size={34} weight="extra">
          {t('progress')}
        </Txt>
      </Enter>
      {!pro ? (
        <Press onPress={() => router.push('/paywall')}>
          <GlassCard style={{ gap: 4 }}>
            <Txt weight="extra" size={20}>
              {t('proCardTitle')}
            </Txt>
            <Txt color={palette.muted}>{t('proCardBody')}</Txt>
            <Txt weight="bold" color={palette.accent}>
              {t('unlock')}
            </Txt>
          </GlassCard>
        </Press>
      ) : null}

      <Enter delay={40}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <GlassCard style={{ flex: 1, minWidth: 0, alignItems: 'flex-start', gap: 4 }}>
            <Txt size={13} color={palette.muted}>
              {t('streakTitle')}
            </Txt>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
              <Txt size={13}>🔥</Txt>
              <Txt size={32} weight="extra">
                {streak}
              </Txt>
            </View>
            <Txt size={13} color={palette.muted}>
              {streak === 0 ? t('streakZero') : t('streakDays', { count: streak })}
            </Txt>
            <Txt size={12} color={palette.sage} weight="bold">
              {t('streakFreezeCount', { count: rewards.freezeCount })} / {maxFreezes(pro)}
            </Txt>
          </GlassCard>
          <GlassCard style={{ flex: 1, minWidth: 0, alignItems: 'center', gap: 2 }}>
            <Txt size={13} color={palette.muted}>
              {t('todayFocus')}
            </Txt>
            <FocusRing progress={goalRatio} size={86} label={`${todayMin}`} detail={t('dailyGoalProgress', { current: todayMin, target: DAILY_GOAL_MIN })} />
            <Txt size={11} color={todayMin >= DAILY_GOAL_MIN ? palette.sage : palette.muted} center>
              {todayMin >= DAILY_GOAL_MIN ? t('dailyGoalDone', { count: XP_DAILY_GOAL }) : t('dailyGoal')}
            </Txt>
          </GlassCard>
        </View>
      </Enter>

      <WeekShare sessions={sessions} streak={streak} />

      <Enter delay={80}>
        <GlassCard style={{ gap: 8 }}>
          <Txt weight="bold">{t('quests')}</Txt>
          {rewards.quests.map((quest) => {
            const ratio = quest.target > 0 ? Math.min(1, quest.progress / quest.target) : 0;
            return (
              <View key={quest.kind} style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <Txt style={{ flex: 1 }} size={14} color={quest.claimed ? palette.sage : palette.ink}>
                    {quest.claimed ? '✓ ' : ''}
                    {t(questKey(quest.kind), { count: quest.target })}
                  </Txt>
                  <Txt size={12} color={palette.muted}>
                    {quest.progress}/{quest.target}
                  </Txt>
                </View>
                <View style={{ height: 6, borderRadius: 6, backgroundColor: palette.ring, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.round(ratio * 100)}%`, height: '100%', backgroundColor: quest.claimed ? palette.sage : palette.accent }} />
                </View>
              </View>
            );
          })}
        </GlassCard>
      </Enter>

      <Enter delay={110}>
        <GlassCard style={{ gap: 6 }}>
          <Txt weight="bold">{t('weeklyChest')}</Txt>
          <Txt size={14} color={palette.muted}>
            {t('weeklyChestProgress', { current: weekDays, target: WEEKLY_CHEST_DAYS })}
          </Txt>
          <View style={{ height: 8, borderRadius: 8, backgroundColor: palette.ring, overflow: 'hidden' }}>
            <View style={{ width: `${Math.min(100, Math.round((weekDays / WEEKLY_CHEST_DAYS) * 100))}%`, height: '100%', backgroundColor: palette.sage }} />
          </View>
          {rewards.weekChestClaimed ? (
            <Txt color={palette.sage}>{t('weeklyChestClaimed')}</Txt>
          ) : weekDays >= WEEKLY_CHEST_DAYS ? (
            <PrimaryButton title={t('weeklyChestClaim', { count: WEEKLY_CHEST_XP })} onPress={() => actions.claimWeeklyChest()} />
          ) : (
            <Txt size={13} color={palette.muted}>
              {t('weeklyChestBody', { target: WEEKLY_CHEST_DAYS })}
            </Txt>
          )}
        </GlassCard>
      </Enter>

      <Enter delay={140}>
        <GlassCard>
          <Txt weight="bold">{t('moodTitle')}</Txt>
          {moodToday ? (
            <Txt color={palette.muted}>
              {t(moodToday.mood === 'heavy' ? 'moodHeavy' : moodToday.mood === 'foggy' ? 'moodFoggy' : moodToday.mood === 'steady' ? 'moodSteady' : 'moodBright')}
            </Txt>
          ) : (
            <>
              <Txt color={palette.muted} size={14}>
                {t('moodHint')}
              </Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                {(['heavy', 'foggy', 'steady', 'bright'] as const).map((mood) => (
                  <Press
                    key={mood}
                    onPress={() => {
                      buzz();
                      actions.setMood(mood);
                    }}
                    style={{ backgroundColor: palette.sageSoft, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 }}>
                    <Txt size={14}>{t(mood === 'heavy' ? 'moodHeavy' : mood === 'foggy' ? 'moodFoggy' : mood === 'steady' ? 'moodSteady' : 'moodBright')}</Txt>
                  </Press>
                ))}
              </View>
              {settings.moodDismissedDay !== today ? (
                <Press onPress={() => actions.dismissMood(today)} style={{ marginTop: 8 }}>
                  <Txt color={palette.muted} size={14}>
                    {t('notNow')}
                  </Txt>
                </Press>
              ) : null}
            </>
          )}
        </GlassCard>
      </Enter>

      <Enter delay={170}>
        <Press onPress={() => router.push('/collection')}>
          <GlassCard style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {latest ? (
              <CollectibleCard id={latest.id} owned revealed width={72} />
            ) : (
              <View style={{ width: 72, height: 92, borderRadius: 16, backgroundColor: palette.ring }} />
            )}
            <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
              <Txt weight="bold">{t('recentCard')}</Txt>
              <Txt size={14} color={palette.muted}>
                {latest ? t(latest.nameKey) : t('recentCardEmpty')}
              </Txt>
              <Txt size={13} weight="bold" color={palette.accent}>
                {t('openCollection')}
              </Txt>
            </View>
          </GlassCard>
        </Press>
      </Enter>

      <Enter delay={200}>
        <Txt weight="bold">{t('badges')}</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {BADGES.map((id) => (
            <View key={id} style={{ backgroundColor: unlocked.has(id) ? palette.sageSoft : palette.card, borderRadius: 16, padding: 10, opacity: unlocked.has(id) ? 1 : 0.4 }}>
              <Txt size={13}>{names[id]}</Txt>
            </View>
          ))}
        </View>
      </Enter>

      <Enter delay={230}>
        <Txt weight="bold">{t('accessory')}</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(['none', 'flower', 'scarf', 'glasses', 'star'] as const).map((id) => {
            const need = id === 'none' ? 0 : ACCESSORY_STREAK[id as AccessoryId];
            const locked = streak < need;
            const on = settings.accessory === id;
            return (
              <Press
                key={id}
                onPress={() => {
                  if (!locked) actions.setSettings({ accessory: id });
                }}
                style={{
                  backgroundColor: on ? palette.accent : palette.card,
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  opacity: locked ? 0.45 : 1,
                }}>
                <View>
                  <Txt color={on ? palette.accentInk : palette.ink} size={14}>
                    {id === 'none'
                      ? t('accessoryNone')
                      : id === 'flower'
                        ? t('accessoryFlower')
                        : id === 'scarf'
                          ? t('accessoryScarf')
                          : id === 'glasses'
                            ? t('accessoryGlasses')
                            : t('accessoryStar')}
                  </Txt>
                  {locked ? (
                    <Txt size={11} color={on ? palette.accentInk : palette.muted}>
                      {t('accessoryLocked', { count: need })}
                    </Txt>
                  ) : null}
                </View>
              </Press>
            );
          })}
        </View>
      </Enter>
    </Screen>
  );
}

function WeekShare({ sessions, streak }: { sessions: Session[]; streak: number }) {
  const card = useRef(null);
  const { t, locale } = useI18n();
  const { palette } = useTheme();
  const start = weekStart();
  const end = start + 7 * 86_400_000;
  const focus = sessions.filter((session) => session.kind !== 'break' && session.endedAt >= start && session.endedAt < end);
  const minutes = Math.round(focus.reduce((sum, session) => sum + session.focusedMs, 0) / 60_000);
  const byDay = new Map<string, number>();
  for (const session of focus) {
    const key = dayKey(session.endedAt);
    byDay.set(key, (byDay.get(key) ?? 0) + session.focusedMs);
  }
  let bestKey = '';
  let bestMs = 0;
  for (const [key, ms] of byDay) {
    if (ms > bestMs) {
      bestKey = key;
      bestMs = ms;
    }
  }
  const bestLabel = bestKey
    ? new Date(Number(bestKey.slice(0, 4)), Number(bestKey.slice(5, 7)) - 1, Number(bestKey.slice(8, 10))).toLocaleDateString(locale, { weekday: 'long' })
    : '';
  const window = bestFocusWindow(sessions);
  const message = t('shareWeekMessage', { minutes, sessions: focus.length, streak });

  return (
    <GlassCard style={{ gap: 8 }}>
      <View ref={card as never} collapsable={false} style={{ gap: 6 }}>
        <Txt weight="extra" size={20}>
          {t('weekTitle')}
        </Txt>
        <Txt>{t('weekMinutes', { count: minutes })}</Txt>
        <Txt>{t('weekSessions', { count: focus.length })}</Txt>
        <Txt>{bestLabel ? t('weekBest', { day: bestLabel }) : t('weekBestEmpty')}</Txt>
        <Txt>
          {streak === 0 ? t('streakZero') : t('streakDays', { count: streak })}
        </Txt>
        <Txt color={palette.muted}>{window ? t('bestTime', { when: t(window === 'morning' ? 'bestMorning' : window === 'afternoon' ? 'bestAfternoon' : window === 'evening' ? 'bestEvening' : 'bestNight') }) : t('bestTimeEmpty')}</Txt>
      </View>
      <Press
        onPress={() => {
          void (async () => {
            try {
              const { captureRef } = await import('react-native-view-shot');
              const uri = await captureRef(card as never, { format: 'png', quality: 1 });
              const Sharing = await import('expo-sharing');
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, { mimeType: 'image/png' });
                return;
              }
            } catch {
              // Text share still works when the capture module is missing.
            }
            await Share.share({ message });
          })();
        }}>
        <Txt weight="bold" color={palette.accent} center>
          {t('share')}
        </Txt>
      </Press>
    </GlassCard>
  );
}

function bestFocusWindow(sessions: Session[]): 'morning' | 'afternoon' | 'evening' | 'night' | null {
  const totals = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  for (const session of sessions) {
    if (session.kind === 'break' || session.focusedMs < 60_000) continue;
    const hour = new Date(session.startedAt).getHours();
    const key = hour < 5 ? 'night' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
    totals[key] += session.focusedMs;
  }
  let best: keyof typeof totals | null = null;
  let max = 0;
  for (const key of Object.keys(totals) as (keyof typeof totals)[]) {
    if (totals[key] > max) {
      max = totals[key];
      best = key;
    }
  }
  return best;
}
