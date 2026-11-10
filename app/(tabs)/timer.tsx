import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Linking, View, useWindowDimensions } from 'react-native';

import { AmbientGlow, GlassCard } from '@/src/components/chrome';
import { FinishBurst } from '@/src/components/FinishBurst';
import { TimerDisc } from '@/src/components/Wedge';
import { Field, Press, PrimaryButton, Screen, SecondaryButton, Txt } from '@/src/components/ui';
import { FREE_PRESET_MIN, JUST_START_MIN, PRESETS } from '@/src/config';
import { remainingMs } from '@/src/domain/time';
import { useI18n } from '@/src/i18n/useI18n';
import { requestNotificationPermission } from '@/src/services/notifications';
import { actions, useApp, useIsPro } from '@/src/store/store';
import { useTheme } from '@/src/theme/theme';
import { router } from 'expo-router';

export default function TimerScreen() {
  const params = useLocalSearchParams<{ aha?: string; just?: string; minutes?: string }>();
  const { timer, settings, celebration, sessions, routineRun } = useApp();
  const pro = useIsPro();
  const { t } = useI18n();
  const { palette } = useTheme();
  const { width } = useWindowDimensions();
  const [now, setNow] = useState(Date.now());
  const [minutes, setMinutes] = useState(FREE_PRESET_MIN);
  const [custom, setCustom] = useState(20);
  const [label, setLabel] = useState('');
  const [mixOpen, setMixOpen] = useState(false);
  const [breath, setBreath] = useState(t('inhale'));
  const [alongside, setAlongside] = useState(false);
  const [encourage, setEncourage] = useState(0);
  const [showBurst, setShowBurst] = useState(false);
  const [feelHidden, setFeelHidden] = useState(false);
  const fired = useRef(false);
  const bucket = useRef(0);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setBreath((value) => (value === t('inhale') ? t('exhale') : t('inhale'))), 4000);
    return () => clearInterval(id);
  }, [t]);

  useEffect(() => {
    if (!alongside) return;
    const id = setInterval(() => setEncourage((value) => (value + 1) % 3), 22000);
    return () => clearInterval(id);
  }, [alongside]);

  useEffect(() => {
    if (celebration?.code === 'finished') setShowBurst(true);
    setFeelHidden(false);
  }, [celebration?.id, celebration?.code]);

  useEffect(() => {
    if (fired.current || timer) return;
    if (params.just === '1' || params.aha === '1') {
      fired.current = true;
      if (params.aha === '1') actions.markAha();
      actions.startJust();
      return;
    }
    const requested = Number(params.minutes);
    if (!Number.isFinite(requested)) return;
    fired.current = true;
    if (requested === JUST_START_MIN) actions.startJust();
    else if ((PRESETS as readonly number[]).includes(requested)) {
      const result = actions.startPreset(requested);
      if (result === 'locked') router.push('/paywall');
    }
  }, [params.aha, params.just, params.minutes, timer]);

  useEffect(() => {
    if (!timer || timer.status !== 'running' || !settings.metronome || !settings.haptics) return;
    const elapsed = timer.durationMs - remainingMs(timer, now);
    const next = Math.floor(elapsed / (settings.metronomeSec * 1000));
    if (next > bucket.current) {
      bucket.current = next;
      void import('@/src/services/haptics').then((mod) => mod.haptic('light'));
    }
  }, [now, settings.haptics, settings.metronome, settings.metronomeSec, timer]);

  const running = timer?.status === 'running';
  const paused = timer?.status === 'paused';
  const remaining = timer ? remainingMs(timer, now) : minutes * 60_000;
  const duration = timer?.durationMs ?? minutes * 60_000;
  const fraction = duration > 0 ? remaining / duration : 0;
  const mm = String(Math.floor(remaining / 60_000)).padStart(2, '0');
  const ss = String(Math.floor((remaining % 60_000) / 1000)).padStart(2, '0');
  const size = Math.min(width - 48, 340);

  return (
    <Screen scroll bottomInset={false} background={<AmbientGlow />}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt size={22} weight="extra">
          {t('appName')}
        </Txt>
        <Press
          onPress={() => {
            if (settings.rain > 0) actions.setSettings({ rain: 0 });
            else actions.setSettings({ rain: 0.55 });
            setMixOpen(true);
          }}
          style={{
            backgroundColor: settings.rain > 0 ? palette.sageSoft : palette.card,
            borderRadius: 18,
            paddingHorizontal: 14,
            paddingVertical: 8,
          }}>
          <Txt weight="bold" color={settings.rain > 0 ? palette.sage : palette.ink}>
            {t('rain')}
          </Txt>
        </Press>
        <Press
          onPress={() => setAlongside((value) => !value)}
          style={{
            backgroundColor: alongside ? palette.sageSoft : palette.card,
            borderRadius: 18,
            paddingHorizontal: 14,
            paddingVertical: 8,
          }}>
          <Txt weight="bold" color={alongside ? palette.sage : palette.ink}>
            {t('alongside')}
          </Txt>
        </Press>
      </View>
      <TimerDisc
        size={size}
        fraction={timer ? fraction : 1}
        time={timer ? `${mm}:${ss}` : String(minutes)}
        caption={timer ? (running ? breath : t('paused')) : minutes === JUST_START_MIN ? t('ahaHint') : t('lengthHint', { count: minutes })}
        breathing={running}
        accessory={settings.accessory}
        backdrop={settings.backdrop}
        breakMode={timer?.kind === 'break'}
        pose={running || alongside ? 'focus' : timer ? 'idle' : 'sleepy'}
      />
      {timer ? <Txt center weight="bold">{timer.label}</Txt> : null}
      {routineRun ? (
        <GlassCard style={{ gap: 8 }}>
          <Txt size={13} color={palette.muted}>
            {t('guideStep', { current: routineRun.index + 1, total: routineRun.steps.length })}
          </Txt>
          <Txt size={20} weight="extra">
            {routineRun.steps[routineRun.index]?.title}
          </Txt>
          <SecondaryButton
            title={routineRun.index + 1 >= routineRun.steps.length ? t('guideFinish') : t('guideNext')}
            onPress={() => actions.nextGuide()}
          />
        </GlassCard>
      ) : null}
      {alongside ? (
        <Txt center color={palette.muted}>
          {t(encourage === 0 ? 'encourage1' : encourage === 1 ? 'encourage2' : 'encourage3')}
        </Txt>
      ) : null}
      {mixOpen ? (
        <View style={{ gap: 8 }}>
          <Txt>
            {t('rainVol')} {Math.round(settings.rain * 100)}
          </Txt>
          <Stepper onMinus={() => actions.setSettings({ rain: Math.max(0, settings.rain - 0.1) })} onPlus={() => actions.setSettings({ rain: Math.min(1, settings.rain + 0.1) })} />
          <Txt>
            {t('brownVol')} {Math.round(settings.brown * 100)}
          </Txt>
          <Stepper onMinus={() => actions.setSettings({ brown: Math.max(0, settings.brown - 0.1) })} onPlus={() => actions.setSettings({ brown: Math.min(1, settings.brown + 0.1) })} />
        </View>
      ) : null}
      {!timer ? (
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {PRESETS.map((preset) => {
              const locked = preset !== FREE_PRESET_MIN && !pro;
              const selected = minutes === preset;
              return (
                <Press
                  key={preset}
                  onPress={() => {
                    if (locked) {
                      router.push('/paywall');
                      return;
                    }
                    setMinutes(preset);
                  }}
                  style={{
                    minWidth: 64,
                    minHeight: 52,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selected ? palette.accent : palette.card,
                  }}>
              <Txt weight="bold" color={selected ? palette.accentInk : palette.ink}>
                {preset}
              </Txt>
              {locked ? (
                <Txt size={11} color={selected ? palette.accentInk : palette.muted}>
                  {t('themeLocked')}
                </Txt>
              ) : null}
                </Press>
              );
            })}
            <Press
              onPress={() => {
                if (!pro) router.push('/paywall');
                else setMinutes(custom);
              }}
              style={{ minHeight: 52, borderRadius: 18, paddingHorizontal: 16, justifyContent: 'center', backgroundColor: palette.card }}>
              <Txt weight="bold">{t('custom')}</Txt>
              {!pro ? (
                <Txt size={11} color={palette.muted}>
                  {t('themeLocked')}
                </Txt>
              ) : null}
            </Press>
          </View>
          {pro && minutes === custom ? (
            <Stepper
              onMinus={() => {
                const next = Math.max(1, custom - 1);
                setCustom(next);
                setMinutes(next);
              }}
              onPlus={() => {
                const next = Math.min(180, custom + 1);
                setCustom(next);
                setMinutes(next);
              }}
              label={`${custom} ${t('min')}`}
            />
          ) : null}
          <Field value={label} onChangeText={setLabel} placeholder={t('taskName')} />
          <PrimaryButton
            title={t('start')}
            onPress={() => {
              if (!pro && minutes !== FREE_PRESET_MIN && minutes !== JUST_START_MIN) {
                router.push('/paywall');
                return;
              }
              if (minutes === JUST_START_MIN) actions.startJust();
              else if ((PRESETS as readonly number[]).includes(minutes)) actions.startPreset(minutes, label);
              else actions.startCustom(minutes, label);
            }}
          />
        </View>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 28 }}>
          <Circle icon={running ? 'pause' : 'play'} label={running ? t('pause') : t('resume')} onPress={() => (running ? actions.pause() : actions.resume())} />
          <Circle icon="stop" label={t('stop')} onPress={() => actions.stop()} />
        </View>
      )}
      {celebration ? (
        <GlassCard style={{ gap: 8 }}>
          {showBurst && celebration.code === 'finished' ? (
            <FinishBurst haptics={settings.haptics} onDone={() => setShowBurst(false)} />
          ) : null}
          <Txt weight="extra" size={24}>
            {celebration.code === 'stopped' ? t('stoppedTitle') : t('doneTitle')}
          </Txt>
          <Txt>{celebration.code === 'stopped' ? t('stoppedBody') : t('doneBody')}</Txt>
          {celebration.code === 'finished' && celebration.sessionId && !feelHidden && !sessions.find((item) => item.id === celebration.sessionId)?.feel ? (
            <View style={{ gap: 8 }}>
              <Txt weight="bold">{t('feelTitle')}</Txt>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {(['rough', 'low', 'ok', 'good', 'great'] as const).map((feel) => (
                  <Press
                    key={feel}
                    label={t(feel === 'rough' ? 'feelRough' : feel === 'low' ? 'feelLow' : feel === 'ok' ? 'feelOk' : feel === 'good' ? 'feelGood' : 'feelGreat')}
                    onPress={() => actions.setFeel(celebration.sessionId!, feel)}
                    style={{ padding: 6 }}>
                    <Txt size={28}>{feel === 'rough' ? '😣' : feel === 'low' ? '😕' : feel === 'ok' ? '😐' : feel === 'good' ? '🙂' : '😄'}</Txt>
                  </Press>
                ))}
              </View>
              <Press onPress={() => setFeelHidden(true)}>
                <Txt color={palette.muted}>{t('feelSkip')}</Txt>
              </Press>
            </View>
          ) : null}
          {celebration.xpGained ? <Txt color={palette.sage}>{t('xpGained', { count: celebration.xpGained })}</Txt> : null}
          {celebration.badgeId ? <Txt color={palette.sage}>{t('badgeNew', { name: badgeLabel(celebration.badgeId, t) })}</Txt> : null}
          {celebration.offerBreak ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <SecondaryButton title={t('breakFor3')} onPress={() => actions.startBreak(3)} />
              </View>
              <View style={{ flex: 1 }}>
                <SecondaryButton title={t('breakFor5')} onPress={() => actions.startBreak(5)} />
              </View>
            </View>
          ) : null}
          {!pro && !settings.paywallSeen ? (
            <Press onPress={() => router.push('/paywall')} style={{ minHeight: 44, justifyContent: 'center' }}>
              <Txt center weight="bold" color={palette.accent}>
                {t('unlock')}
              </Txt>
            </Press>
          ) : null}
          {celebration.canExtend ? (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Press onPress={() => actions.startPreset(10, celebration.label)} style={{ flex: 1, backgroundColor: palette.sageSoft, borderRadius: 16, padding: 12 }}>
                <Txt center>{t('extend10')}</Txt>
              </Press>
              <Press onPress={() => actions.startPreset(25, celebration.label)} style={{ flex: 1, backgroundColor: palette.sageSoft, borderRadius: 16, padding: 12 }}>
                <Txt center>{t('extend25')}</Txt>
              </Press>
            </View>
          ) : null}
          <Press onPress={() => actions.dismissCelebration()}>
            <Txt color={palette.muted}>{t('imDone')}</Txt>
          </Press>
        </GlassCard>
      ) : null}
      {!settings.notifPrompted && timer ? (
        <View style={{ backgroundColor: palette.sageSoft, borderRadius: 24, padding: 16, gap: 8 }}>
          <Txt weight="bold">{t('notifTitle')}</Txt>
          <Txt>{t('notifBody')}</Txt>
          <PrimaryButton
            title={t('notifAllow')}
            onPress={() => {
              void (async () => {
                const ok = await requestNotificationPermission();
                actions.markNotifPrompted();
                if (!ok) void Linking.openSettings();
              })();
            }}
          />
          <Press onPress={() => actions.markNotifPrompted()}>
            <Txt color={palette.muted}>{t('notNow')}</Txt>
          </Press>
        </View>
      ) : null}
      </Screen>
  );
}

function Stepper({ onMinus, onPlus, label }: { onMinus: () => void; onPlus: () => void; label?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Press onPress={onMinus} style={{ padding: 10 }}>
        <Txt size={22}>−</Txt>
      </Press>
      {label ? <Txt weight="bold">{label}</Txt> : null}
      <Press onPress={onPlus} style={{ padding: 10 }}>
        <Txt size={22}>+</Txt>
      </Press>
    </View>
  );
}

function Circle({ label, onPress, icon }: { label: string; onPress: () => void; icon: 'pause' | 'play' | 'stop' }) {
  const { palette } = useTheme();
  return (
    <Press onPress={onPress} label={label} style={{ alignItems: 'center', gap: 6 }}>
      <View
        style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          backgroundColor: palette.card,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: palette.shadow,
          shadowOpacity: 0.16,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 4,
        }}>
        {icon === 'pause' ? (
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <View style={{ width: 7, height: 22, borderRadius: 2, backgroundColor: palette.ink }} />
            <View style={{ width: 7, height: 22, borderRadius: 2, backgroundColor: palette.ink }} />
          </View>
        ) : icon === 'stop' ? (
          <View style={{ width: 18, height: 18, borderRadius: 3, backgroundColor: palette.ink }} />
        ) : (
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 16,
              borderTopWidth: 10,
              borderBottomWidth: 10,
              borderLeftColor: palette.ink,
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              marginLeft: 4,
            }}
          />
        )}
      </View>
      <Txt size={13} color={palette.muted}>
        {label}
      </Txt>
    </Press>
  );
}

function badgeLabel(id: string, t: (key: 'badgeFirst' | 'badgeJust' | 'badgeStreak3' | 'badgeStreak7' | 'badgeStreak14' | 'badgeSessions' | 'badgeEstimates' | 'badgeRoutine' | 'badgeBreak' | 'badgeMood') => string) {
  const map = {
    first: 'badgeFirst',
    just: 'badgeJust',
    streak3: 'badgeStreak3',
    streak7: 'badgeStreak7',
    streak14: 'badgeStreak14',
    sessions10: 'badgeSessions',
    estimates5: 'badgeEstimates',
    routine: 'badgeRoutine',
    break: 'badgeBreak',
    mood: 'badgeMood',
  } as const;
  const key = map[id as keyof typeof map];
  return key ? t(key) : id;
}
