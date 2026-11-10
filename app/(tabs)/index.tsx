import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, useWindowDimensions, View } from 'react-native';

import { CollectibleCard } from '@/src/components/CollectibleCard';
import { AmbientGlow, Enter, FocusRing, GlassCard, HeroCompanion } from '@/src/components/chrome';
import { Field, Press, PrimaryButton, Screen, Txt } from '@/src/components/ui';
import { XpBar } from '@/src/components/XpBar';
import { FREE_PRESET_MIN, JUST_START_MIN } from '@/src/config';
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
import { computeStreak, dayKey, ROUTINES } from '@/src/domain/time';
import type { Key } from '@/src/i18n';
import { useI18n } from '@/src/i18n/useI18n';
import { haptic } from '@/src/services/haptics';
import { actions, useApp, useIsPro } from '@/src/store/store';
import { useTheme } from '@/src/theme/theme';

const QUICK = [5, 15, 25] as const;

function questKey(kind: string): Key {
  if (kind === 'session') return 'questSession';
  if (kind === 'focusMin') return 'questFocusMin';
  if (kind === 'justStart') return 'questJust';
  if (kind === 'task') return 'questTask';
  if (kind === 'mood') return 'questMood';
  return 'questGoal';
}

export default function TodayScreen() {
  const { tasks, settings, timer, moods, pendingActual, rewards, sessions } = useApp();
  const pro = useIsPro();
  const { t, locale } = useI18n();
  const { palette } = useTheme();
  const { width } = useWindowDimensions();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [guess, setGuess] = useState(15);
  const [actual, setActual] = useState(pendingActual?.estimateMin ?? 15);
  const today = dayKey();
  const open = tasks.filter((task) => task.status === 'open');
  const done = tasks.filter((task) => task.status === 'done' && task.completedAt && dayKey(task.completedAt) === today);
  const moodToday = moods.find((item) => item.day === today);
  const count = open.length + done.length;
  const plenty =
    count <= 0 ? t('plenty0') : count === 1 ? t('plenty1') : count === 2 ? t('plenty2') : count === 3 ? t('plenty3') : count === 4 ? t('plenty4') : t('plenty5');
  const hour = new Date().getHours();
  const hello = hour < 12 ? t('morning') : hour < 18 ? t('afternoon') : t('evening');
  const dateLabel = new Date().toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
  const streak = computeStreak(sessions, tasks, { frozenDays: rewards.frozenDays });
  const todayMin = focusedMinutesOnDay(sessions, today);
  const goalRatio = Math.min(1, todayMin / DAILY_GOAL_MIN);
  const heroSize = width < 360 ? 112 : width < 400 ? 126 : 140;
  const latestId = rewards.earnedCardIds[rewards.earnedCardIds.length - 1];
  const latest = latestId ? CARD_BY_ID[latestId] : null;
  const weekDays = focusedDaysInWeek(sessions, tasks);
  const compact = width < 360;

  const buzz = (kind: 'light' | 'medium' = 'light') => {
    if (settings.haptics) void haptic(kind);
  };

  const startQuick = (minutes: number) => {
    buzz('medium');
    if (minutes === JUST_START_MIN) {
      actions.startJust();
      router.push('/(tabs)/timer');
      return;
    }
    const result = actions.startPreset(minutes);
    if (result === 'locked') {
      router.push('/paywall');
      return;
    }
    router.push('/(tabs)/timer');
  };

  return (
    <Screen
      scroll
      background={<AmbientGlow />}
      footer={
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 }}>
          <Press
            label={t('addTask')}
            onPress={() => {
              buzz();
              setAdding((value) => !value);
            }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: palette.card,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: palette.shadow,
              shadowOpacity: 0.14,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 3,
            }}>
            <Txt size={28} weight="bold">
              +
            </Txt>
          </Press>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              title={t('justStart')}
              onPress={() => startQuick(JUST_START_MIN)}
            />
          </View>
        </View>
      }>
      <Enter delay={0}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1, minWidth: 0, paddingRight: 4 }}>
            <Txt size={15} color={palette.muted}>
              {hello}
            </Txt>
            <Txt size={compact ? 32 : 38} weight="extra">
              {t('today')}
            </Txt>
            <Txt color={palette.muted}>{dateLabel}</Txt>
            <Txt size={14} color={palette.muted}>
              {plenty}
            </Txt>
          </View>
          <HeroCompanion size={heroSize} accessory={settings.accessory} xp={rewards.xp} />
        </View>
      </Enter>

      <Enter delay={70}>
        <GlassCard>
          <XpBar xp={rewards.xp} onPress={() => router.push('/collection')} />
        </GlassCard>
      </Enter>

      <Enter delay={120}>
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
            <View
              style={{
                marginTop: 4,
                backgroundColor: palette.sageSoft,
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}>
              <Txt size={12} color={palette.sage} weight="bold">
                {t('streakFreezeCount', { count: rewards.freezeCount })} / {maxFreezes(pro)}
              </Txt>
            </View>
          </GlassCard>
          <GlassCard style={{ flex: 1, minWidth: 0, alignItems: 'center', gap: 2 }}>
            <Txt size={13} color={palette.muted}>
              {t('todayFocus')}
            </Txt>
            <FocusRing
              progress={goalRatio}
              size={compact ? 78 : 86}
              label={`${todayMin}`}
              detail={t('dailyGoalProgress', { current: todayMin, target: DAILY_GOAL_MIN })}
            />
            {todayMin >= DAILY_GOAL_MIN ? (
              <Txt size={11} color={palette.sage} center>
                {t('dailyGoalDone', { count: XP_DAILY_GOAL })}
              </Txt>
            ) : (
              <Txt size={11} color={palette.muted} center>
                {t('dailyGoal')}
              </Txt>
            )}
          </GlassCard>
        </View>
      </Enter>

      <Enter delay={170}>
        <View style={{ gap: 8 }}>
          <Txt weight="bold">{t('quickStart')}</Txt>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
            {QUICK.map((minutes) => {
              const locked = minutes !== FREE_PRESET_MIN && !pro;
              return (
                <Press
                  key={minutes}
                  onPress={() => startQuick(minutes)}
                  style={{
                    minHeight: 48,
                    paddingHorizontal: 16,
                    borderRadius: 18,
                    backgroundColor: minutes === FREE_PRESET_MIN ? palette.accent : palette.card,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: palette.shadow,
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 2,
                  }}>
                  <Txt weight="bold" color={minutes === FREE_PRESET_MIN ? palette.accentInk : palette.ink}>
                    {t('aboutMin', { count: minutes })}
                    {locked ? ' 🔒' : ''}
                  </Txt>
                </Press>
              );
            })}
            <Press
              onPress={() => startQuick(JUST_START_MIN)}
              style={{
                minHeight: 48,
                paddingHorizontal: 16,
                borderRadius: 18,
                backgroundColor: palette.sageSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Txt weight="bold" color={palette.sage}>
                {t('justStart')}
              </Txt>
            </Press>
          </ScrollView>
        </View>
      </Enter>

      <Enter delay={210}>
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

      <Enter delay={250}>
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt weight="bold">{t('todayPlan')}</Txt>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {ROUTINES.map((routine) => (
                <Press
                  key={routine.id}
                  onPress={() => {
                    buzz();
                    const result = actions.addRoutine(routine.id);
                    if (result === 'limit') router.push('/paywall');
                  }}
                  style={{ backgroundColor: palette.card, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Txt size={12} weight="bold">
                    {t(routine.id === 'morning' ? 'routineMorning' : routine.id === 'study' ? 'routineStudy' : 'routineCleaning')}
                  </Txt>
                </Press>
              ))}
            </View>
          </View>
          {open.length === 0 && done.length === 0 ? (
            <GlassCard>
              <Txt color={palette.muted}>{t('emptyTitle')}</Txt>
            </GlassCard>
          ) : null}
          {open.slice(0, 4).map((task) => {
            const active = timer?.taskId === task.id;
            const carried = dayKey(task.createdAt) !== today;
            return (
              <Press
                key={task.id}
                onPress={() => {
                  buzz();
                  actions.startTask(task.id);
                  router.push('/(tabs)/timer');
                }}
                onLongPress={() =>
                  Alert.alert(t('removeTitle'), t('removeBody'), [
                    { text: t('keep'), style: 'cancel' },
                    { text: t('remove'), onPress: () => actions.removeTask(task.id) },
                  ])
                }
                style={{
                  backgroundColor: palette.card,
                  borderRadius: 22,
                  padding: 16,
                  minHeight: 72,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  shadowColor: palette.shadow,
                  shadowOpacity: 0.1,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 3,
                }}>
                <Press
                  label={t('completed')}
                  onPress={() => {
                    buzz('medium');
                    actions.markDone(task.id);
                  }}
                  style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: palette.line }}
                />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Txt weight="bold">{task.title}</Txt>
                  {active ? (
                    <View style={{ alignSelf: 'flex-start', marginTop: 4, backgroundColor: '#FDE6D8', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Txt size={12} weight="bold" color={palette.accent}>
                        {t('inProgress')}
                      </Txt>
                    </View>
                  ) : carried ? (
                    <Txt size={13} color={palette.muted}>
                      {t('carried')}
                    </Txt>
                  ) : null}
                </View>
                <Txt color={palette.muted}>{t('aboutMin', { count: task.estimateMin })}</Txt>
              </Press>
            );
          })}
          {open.length > 4 ? (
            <Txt size={13} color={palette.muted}>
              +{open.length - 4}
            </Txt>
          ) : null}
          {done.map((task) => (
            <View key={task.id} style={{ opacity: 0.55, paddingHorizontal: 8 }}>
              <Txt>✓ {task.title}</Txt>
            </View>
          ))}
        </View>
      </Enter>

      <Enter delay={290}>
        <Press onPress={() => router.push('/collection')}>
          <GlassCard style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {latest ? (
              <CollectibleCard id={latest.id} owned revealed width={72} />
            ) : (
              <View style={{ width: 72, height: 92, borderRadius: 16, backgroundColor: palette.ring }} />
            )}
            <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
              <Txt weight="bold">{t('recentCard')}</Txt>
              {latest ? (
                <Txt size={14} color={palette.muted}>
                  {t(latest.nameKey)}
                </Txt>
              ) : (
                <Txt size={14} color={palette.muted}>
                  {t('recentCardEmpty')}
                </Txt>
              )}
              <Txt size={13} weight="bold" color={palette.accent}>
                {t('openCollection')}
              </Txt>
            </View>
          </GlassCard>
        </Press>
      </Enter>

      <Enter delay={320}>
        <GlassCard>
          <Txt weight="bold">{t('moodTitle')}</Txt>
          {moodToday ? (
            <Txt color={palette.muted}>
              {t(
                moodToday.mood === 'heavy'
                  ? 'moodHeavy'
                  : moodToday.mood === 'foggy'
                    ? 'moodFoggy'
                    : moodToday.mood === 'steady'
                      ? 'moodSteady'
                      : 'moodBright',
              )}
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
                    <Txt size={14}>
                      {t(mood === 'heavy' ? 'moodHeavy' : mood === 'foggy' ? 'moodFoggy' : mood === 'steady' ? 'moodSteady' : 'moodBright')}
                    </Txt>
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

      <Enter delay={350}>
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

      {adding ? (
        <GlassCard>
          <Field value={title} onChangeText={setTitle} placeholder={t('addPlaceholder')} />
          <Txt color={palette.muted} size={14}>
            {t('guessLabel')} {guess} {t('min')}
          </Txt>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Press onPress={() => setGuess((value) => Math.max(5, value - 5))} style={chip(palette.bg)}>
              <Txt>−5</Txt>
            </Press>
            <Press onPress={() => setGuess((value) => Math.min(180, value + 5))} style={chip(palette.bg)}>
              <Txt>+5</Txt>
            </Press>
          </View>
          <PrimaryButton
            title={t('addTask')}
            disabled={!title.trim()}
            onPress={() => {
              const result = actions.addTask(title, guess);
              if (result === 'limit') {
                router.push('/paywall');
                return;
              }
              setTitle('');
              setAdding(false);
            }}
          />
          {!pro && open.length >= 2 ? <Txt color={palette.muted}>{t('limitBody')}</Txt> : null}
        </GlassCard>
      ) : null}

      {pendingActual ? (
        <GlassCard>
          <Txt weight="bold">{t('actualTitle')}</Txt>
          <Txt color={palette.muted}>{t('actualHint')}</Txt>
          <Txt weight="extra" size={28}>
            {actual} {t('min')}
          </Txt>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Press onPress={() => setActual((value) => Math.max(1, value - 5))} style={chip(palette.bg)}>
              <Txt>−5</Txt>
            </Press>
            <Press onPress={() => setActual((value) => value + 5)} style={chip(palette.bg)}>
              <Txt>+5</Txt>
            </Press>
          </View>
          <PrimaryButton title={t('save')} onPress={() => actions.recordActual(actual)} />
          <Press onPress={() => actions.dismissActual()}>
            <Txt color={palette.muted}>{t('skipActual')}</Txt>
          </Press>
        </GlassCard>
      ) : null}
    </Screen>
  );
}

function chip(bg: string) {
  return { backgroundColor: bg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 } as const;
}
