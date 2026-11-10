import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, useWindowDimensions, View } from 'react-native';

import { AmbientGlow, Enter, GlassCard } from '@/src/components/chrome';
import { Companion } from '@/src/components/Companion';
import { Guide } from '@/src/components/Guide';
import { Field, Press, PrimaryButton, Screen, Txt } from '@/src/components/ui';
import { XpBar } from '@/src/components/XpBar';
import { dayKey, ROUTINES } from '@/src/domain/time';
import { useI18n } from '@/src/i18n/useI18n';
import { haptic } from '@/src/services/haptics';
import { actions, useApp, useIsPro } from '@/src/store/store';
import { useTheme } from '@/src/theme/theme';

export default function TodayScreen() {
  const { tasks, settings, timer, pendingActual, rewards } = useApp();
  const pro = useIsPro();
  const { t } = useI18n();
  const { palette } = useTheme();
  const { height } = useWindowDimensions();
  const companionSize = Math.round(Math.min(248, Math.max(196, height * 0.3)));
  const [adding, setAdding] = useState(false);
  const [listsOpen, setListsOpen] = useState(false);
  const [help, setHelp] = useState(false);
  const [title, setTitle] = useState('');
  const [guess, setGuess] = useState(15);
  const [actual, setActual] = useState(pendingActual?.estimateMin ?? 15);
  const today = dayKey();
  const open = tasks.filter((task) => task.status === 'open');
  const done = tasks.filter((task) => task.status === 'done' && task.completedAt && dayKey(task.completedAt) === today);

  const buzz = (kind: 'light' | 'medium' = 'light') => {
    if (settings.haptics) void haptic(kind);
  };

  const onStart = () => {
    buzz('medium');
    if (timer) {
      router.push('/(tabs)/timer');
      return;
    }
    const next = open[0];
    if (next) {
      actions.startTask(next.id);
      router.push('/(tabs)/timer');
      return;
    }
    actions.startJust();
    router.push('/(tabs)/timer');
  };

  return (
    <Screen
      scroll
      grow
      bottomInset={false}
      background={<AmbientGlow />}
      footer={
        <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8 }}>
          <PrimaryButton title={timer ? t('inProgress') : t('start')} onPress={onStart} />
        </View>
      }>
      <Enter>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View style={{ alignSelf: 'stretch', alignItems: 'flex-end' }}>
            <Press
              label={t('help')}
              onPress={() => setHelp(true)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: palette.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Txt size={20} weight="extra">
                ?
              </Txt>
            </Press>
          </View>
          <Companion size={companionSize} accessory={settings.accessory} hero breathing float />
          <Txt size={18} weight="bold" center>
            {t('homePurpose')}
          </Txt>
        </View>
      </Enter>

      <Enter delay={60}>
        <GlassCard>
          <XpBar xp={rewards.xp} onPress={() => router.push('/collection')} />
        </GlassCard>
      </Enter>

      <Enter delay={110}>
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt weight="bold">{t('todayPlan')}</Txt>
            <Press
              onPress={() => {
                buzz();
                setAdding((value) => !value);
              }}>
              <Txt weight="bold" color={palette.accent}>
                {t('addTask')}
              </Txt>
            </Press>
          </View>
          {open.length === 0 && done.length === 0 ? (
            <GlassCard>
              <Txt color={palette.muted}>{t('emptyTitle')}</Txt>
            </GlassCard>
          ) : null}
          {open.map((task) => {
            const active = timer?.taskId === task.id;
            const carried = dayKey(task.createdAt) !== today;
            return (
              <View
                key={task.id}
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
                <Press
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
                  style={{ flex: 1, minWidth: 0 }}>
                  <Txt weight="bold">{task.title}</Txt>
                  {active ? (
                    <Txt size={12} weight="bold" color={palette.accent}>
                      {t('inProgress')}
                    </Txt>
                  ) : carried ? (
                    <Txt size={13} color={palette.muted}>
                      {t('carried')}
                    </Txt>
                  ) : null}
                </Press>
                <Txt color={palette.muted}>{t('aboutMin', { count: task.estimateMin })}</Txt>
              </View>
            );
          })}
          {done.map((task) => (
            <View key={task.id} style={{ opacity: 0.55, paddingHorizontal: 8 }}>
              <Txt>✓ {task.title}</Txt>
            </View>
          ))}
          <Press
            onPress={() => {
              buzz();
              setListsOpen((value) => !value);
            }}
            style={{
              minHeight: 48,
              borderRadius: 18,
              backgroundColor: palette.card,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 16,
            }}>
            <Txt weight="bold">{t('routines')}</Txt>
          </Press>
          {listsOpen
            ? ROUTINES.map((routine) => (
                <Press
                  key={routine.id}
                  onPress={() => {
                    buzz();
                    const result = actions.addRoutine(routine.id);
                    if (result === 'limit') {
                      router.push('/paywall');
                      return;
                    }
                    setListsOpen(false);
                  }}
                  style={{ backgroundColor: palette.card, borderRadius: 18, padding: 14, gap: 4 }}>
                  <Txt weight="bold">
                    {t(routine.id === 'morning' ? 'routineMorning' : routine.id === 'study' ? 'routineStudy' : 'routineCleaning')}
                  </Txt>
                  {routine.tasks.map((item) => (
                    <Txt key={item.titleKey} size={14} color={palette.muted}>
                      {t(item.titleKey)}
                    </Txt>
                  ))}
                </Press>
              ))
            : null}
        </View>
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

      <Modal visible={help} animationType="slide" onRequestClose={() => setHelp(false)}>
        <Guide onDone={() => setHelp(false)} onSkip={() => setHelp(false)} />
      </Modal>
    </Screen>
  );
}

function chip(bg: string) {
  return { backgroundColor: bg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 } as const;
}
