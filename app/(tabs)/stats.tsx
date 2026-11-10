import { router } from 'expo-router';
import { useRef } from 'react';
import { Share, View } from 'react-native';

import { Companion } from '@/src/components/Companion';
import { Card, Press, Screen, Txt } from '@/src/components/ui';
import { ACCESSORY_STREAK, companionLevel, computeStreak, estimateBias, minutesBetween, weekStart } from '@/src/domain/time';
import type { AccessoryId, BadgeId } from '@/src/domain/types';
import { useI18n } from '@/src/i18n/useI18n';
import { actions, useApp, useIsPro } from '@/src/store/store';
import { useTheme } from '@/src/theme/theme';

const BADGES: BadgeId[] = ['first', 'just', 'streak3', 'streak7', 'streak14', 'sessions10', 'estimates5', 'routine', 'break', 'mood'];

export default function StatsScreen() {
  const app = useApp();
  const pro = useIsPro();
  const { t } = useI18n();
  const { palette } = useTheme();
  const card = useRef(null);
  const streak = computeStreak(app.sessions, app.tasks);
  const start = weekStart();
  const thisWeek = minutesBetween(app.sessions, start, Date.now() + 1);
  const lastWeek = minutesBetween(app.sessions, start - 7 * 86400000, start);
  const total = Math.round(app.sessions.filter((s) => s.kind !== 'break').reduce((sum, s) => sum + s.focusedMs, 0) / 60000);
  const today = minutesBetween(app.sessions, new Date().setHours(0, 0, 0, 0), Date.now() + 1);
  const bias = estimateBias(app.estimates);
  const unlocked = new Set(app.seenBadges);
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
  const levelKey = `level${companionLevel(streak)}` as const;

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt size={34} weight="extra">
          {t('stats')}
        </Txt>
        <Press onPress={() => router.push('/settings')} label={t('settings')}>
          <Txt weight="bold">{t('settings')}</Txt>
        </Press>
      </View>
      <Card>
        <View ref={card as never} collapsable={false} style={{ alignItems: 'center', gap: 6, padding: 8 }}>
          <Companion size={120} accessory={app.settings.accessory} />
          <Txt size={42} weight="extra">
            {streak}
          </Txt>
          <Txt>{streak === 0 ? t('streakZero') : t('streakDays', { count: streak })}</Txt>
          <Txt color={palette.muted}>{t(levelKey)}</Txt>
          <Txt color={palette.muted}>
            {t('todayMin')} {t('minutesValue', { count: today })} · {t('totalMin')} {t('minutesValue', { count: total })}
          </Txt>
          <Txt size={13}>{t('madeVisible')}</Txt>
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
                // Fall back to text when the capture module is missing.
              }
              await Share.share({ message: t('shareMessage', { count: streak }) });
            })();
          }}>
          <Txt weight="bold" color={palette.accent} center>
            {t('share')}
          </Txt>
        </Press>
      </Card>
      <Card>
        <Txt weight="bold">{t('weekTitle')}</Txt>
        <Txt>{t('weekBody', { count: thisWeek, previous: lastWeek })}</Txt>
        <Txt color={palette.muted}>{t('weekMood', { count: app.moods.length })}</Txt>
      </Card>
      <Txt weight="bold">{t('accessory')}</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(['none', 'flower', 'scarf', 'glasses', 'star'] as const).map((id) => {
          const need = id === 'none' ? 0 : ACCESSORY_STREAK[id as AccessoryId];
          const locked = streak < need;
          const on = app.settings.accessory === id;
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
              <Txt color={on ? palette.accentInk : palette.ink} size={14}>
                {id === 'none' ? t('accessoryNone') : id === 'flower' ? t('accessoryFlower') : id === 'scarf' ? t('accessoryScarf') : id === 'glasses' ? t('accessoryGlasses') : t('accessoryStar')}
              </Txt>
            </Press>
          );
        })}
      </View>
      <Txt weight="bold">{t('badges')}</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {BADGES.map((id) => (
          <View key={id} style={{ backgroundColor: unlocked.has(id) ? palette.sageSoft : palette.card, borderRadius: 16, padding: 10, opacity: unlocked.has(id) ? 1 : 0.4 }}>
            <Txt size={13}>{names[id]}</Txt>
          </View>
        ))}
      </View>
      <Txt weight="bold">{t('trainer')}</Txt>
      <Txt>{bias == null ? t('trainerEmpty') : bias > 0.15 ? t('biasLong') : bias < -0.15 ? t('biasShort') : t('biasClose')}</Txt>
      {pro
        ? app.estimates.slice(-8).reverse().map((item) => (
            <Card key={item.id}>
              <Txt weight="bold">{item.label}</Txt>
              <Txt color={palette.muted}>
                {t('guess', { count: item.guessedMin })} · {t('actual', { count: item.actualMin })}
              </Txt>
            </Card>
          ))
        : (
          <Press onPress={() => router.push('/paywall')}>
            <Txt color={palette.accent}>{t('trainerLocked')}</Txt>
          </Press>
        )}
      <Txt weight="bold">{t('history')}</Txt>
      {pro ? (
        app.sessions.length === 0 ? (
          <Txt color={palette.muted}>{t('historyEmpty')}</Txt>
        ) : (
          app.sessions.slice(-12).reverse().map((session) => (
            <Card key={session.id}>
              <Txt weight="bold">{session.label}</Txt>
              <Txt color={palette.muted}>
                {t('minutesValue', { count: Math.max(1, Math.round(session.focusedMs / 60000)) })} · {session.completed ? t('completed') : t('partial')}
              </Txt>
            </Card>
          ))
        )
      ) : (
        <Press onPress={() => router.push('/paywall')}>
          <Txt color={palette.accent}>{t('historyLocked')}</Txt>
        </Press>
      )}
    </Screen>
  );
}
