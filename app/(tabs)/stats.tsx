import { router } from 'expo-router';
import { useRef } from 'react';
import { Share, View } from 'react-native';

import { Companion } from '@/src/components/Companion';
import { AmbientGlow, Enter, GlassCard } from '@/src/components/chrome';
import { Press, Screen, Txt } from '@/src/components/ui';
import { XpBar } from '@/src/components/XpBar';
import { maxFreezes } from '@/src/domain/rewards';
import { companionLevel, computeStreak, estimateBias, minutesBetween, weekStart } from '@/src/domain/time';
import { useI18n } from '@/src/i18n/useI18n';
import { useApp, useIsPro } from '@/src/store/store';
import { useTheme } from '@/src/theme/theme';

export default function StatsScreen() {
  const app = useApp();
  const pro = useIsPro();
  const { t } = useI18n();
  const { palette } = useTheme();
  const card = useRef(null);
  const streak = computeStreak(app.sessions, app.tasks, { frozenDays: app.rewards.frozenDays });
  const start = weekStart();
  const thisWeek = minutesBetween(app.sessions, start, Date.now() + 1);
  const lastWeek = minutesBetween(app.sessions, start - 7 * 86400000, start);
  const total = Math.round(app.sessions.filter((s) => s.kind !== 'break').reduce((sum, s) => sum + s.focusedMs, 0) / 60000);
  const today = minutesBetween(app.sessions, new Date().setHours(0, 0, 0, 0), Date.now() + 1);
  const bias = estimateBias(app.estimates);
  const levelKey = `level${companionLevel(streak)}` as const;

  return (
    <Screen scroll background={<AmbientGlow />}>
      <Enter>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt size={34} weight="extra">
          {t('stats')}
        </Txt>
        <Press onPress={() => router.push('/settings')} label={t('settings')}>
          <Txt weight="bold">{t('settings')}</Txt>
        </Press>
      </View>
      </Enter>
      <GlassCard>
        <View ref={card as never} collapsable={false} style={{ alignItems: 'center', gap: 6, padding: 8 }}>
          <Companion size={128} accessory={app.settings.accessory} float hero={false} />
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Txt size={22}>🔥</Txt>
            <Txt size={42} weight="extra">
              {streak}
            </Txt>
          </View>
          <Txt>{streak === 0 ? t('streakZero') : t('streakDays', { count: streak })}</Txt>
          <Txt color={palette.muted}>{t('streakFreezeCount', { count: app.rewards.freezeCount })} · {t('streakFreezeHint', { max: maxFreezes(pro) })}</Txt>
          <Txt color={palette.muted}>{t(levelKey)}</Txt>
          <View style={{ width: '100%', paddingHorizontal: 8 }}>
            <XpBar xp={app.rewards.xp} onPress={() => router.push('/collection')} />
          </View>
          <Press onPress={() => router.push('/collection')}>
            <Txt weight="bold" color={palette.accent}>
              {t('collection')}
            </Txt>
          </Press>
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
      </GlassCard>
      <GlassCard>
        <Txt weight="bold">{t('weekTitle')}</Txt>
        <Txt>{t('weekBody', { count: thisWeek, previous: lastWeek })}</Txt>
        <Txt color={palette.muted}>{t('weekMood', { count: app.moods.length })}</Txt>
      </GlassCard>
      <Txt weight="bold">{t('trainer')}</Txt>
      <Txt>{bias == null ? t('trainerEmpty') : bias > 0.15 ? t('biasLong') : bias < -0.15 ? t('biasShort') : t('biasClose')}</Txt>
      {pro
        ? app.estimates.slice(-8).reverse().map((item) => (
            <GlassCard key={item.id}>
              <Txt weight="bold">{item.label}</Txt>
              <Txt color={palette.muted}>
                {t('guess', { count: item.guessedMin })} · {t('actual', { count: item.actualMin })}
              </Txt>
            </GlassCard>
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
            <GlassCard key={session.id}>
              <Txt weight="bold">{session.label}</Txt>
              <Txt color={palette.muted}>
                {t('minutesValue', { count: Math.max(1, Math.round(session.focusedMs / 60000)) })} · {session.completed ? t('completed') : t('partial')}
              </Txt>
            </GlassCard>
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
