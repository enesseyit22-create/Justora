import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Companion } from '@/src/components/Companion';
import { Card, Field, Press, PrimaryButton, Screen, Txt } from '@/src/components/ui';
import { dayKey, ROUTINES } from '@/src/domain/time';
import { useI18n } from '@/src/i18n/useI18n';
import { actions, useApp, useIsPro } from '@/src/store/store';
import { useTheme } from '@/src/theme/theme';

export default function TodayScreen() {
  const { tasks, settings, timer, moods, pendingActual } = useApp();
  const pro = useIsPro();
  const { t } = useI18n();
  const { palette } = useTheme();
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

  return (
    <Screen
      scroll
      footer={
        <View style={{ flexDirection: 'row', gap: 10, padding: 16, paddingTop: 0 }}>
          <Press
            label={t('addTask')}
            onPress={() => setAdding((value) => !value)}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: palette.card,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Txt size={28} weight="bold">
              +
            </Txt>
          </Press>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              title={t('justStart')}
              onPress={() => {
                actions.startJust();
                router.push('/(tabs)/timer');
              }}
            />
          </View>
        </View>
      }>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Txt size={40} weight="extra">
            {t('today')}
          </Txt>
          <Txt color={palette.muted}>{hello}</Txt>
        </View>
        <Companion size={92} accessory={settings.accessory} breathing={timer?.status === 'running'} />
      </View>
      <Txt color={palette.muted}>{plenty}</Txt>
      {!moodToday && settings.moodDismissedDay !== today ? (
        <Card>
          <Txt weight="bold">{t('moodTitle')}</Txt>
          <Txt color={palette.muted} size={14}>
            {t('moodHint')}
          </Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {(['heavy', 'foggy', 'steady', 'bright'] as const).map((mood) => (
              <Press key={mood} onPress={() => actions.setMood(mood)} style={{ backgroundColor: palette.sageSoft, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 }}>
                <Txt size={14}>{t(mood === 'heavy' ? 'moodHeavy' : mood === 'foggy' ? 'moodFoggy' : mood === 'steady' ? 'moodSteady' : 'moodBright')}</Txt>
              </Press>
            ))}
          </View>
          <Press onPress={() => actions.dismissMood(today)} style={{ marginTop: 8 }}>
            <Txt color={palette.muted} size={14}>
              {t('notNow')}
            </Txt>
          </Press>
        </Card>
      ) : null}
      <Txt weight="bold">{t('routines')}</Txt>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {ROUTINES.map((routine) => (
          <Press
            key={routine.id}
            onPress={() => {
              const result = actions.addRoutine(routine.id);
              if (result === 'limit') router.push('/paywall');
            }}
            style={{ backgroundColor: palette.card, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 }}>
            <Txt size={14} weight="bold">
              {t(routine.id === 'morning' ? 'routineMorning' : routine.id === 'study' ? 'routineStudy' : 'routineCleaning')}
            </Txt>
          </Press>
        ))}
      </View>
      {open.map((task) => {
        const active = timer?.taskId === task.id;
        const carried = dayKey(task.createdAt) !== today;
        return (
          <Press
            key={task.id}
            onPress={() => {
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
              minHeight: 76,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}>
            <Press
              label={t('completed')}
              onPress={() => actions.markDone(task.id)}
              style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: palette.line }}
            />
            <View style={{ flex: 1 }}>
              <Txt weight="bold">{task.title}</Txt>
              {active ? (
                <Txt size={13} color={palette.accent}>
                  {t('inProgress')}
                </Txt>
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
      {done.map((task) => (
        <View key={task.id} style={{ opacity: 0.55, paddingHorizontal: 8 }}>
          <Txt>
            ✓ {task.title}
          </Txt>
        </View>
      ))}
      {adding ? (
        <Card>
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
        </Card>
      ) : null}
      {pendingActual ? (
        <Card>
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
        </Card>
      ) : null}
    </Screen>
  );
}

function chip(bg: string) {
  return { backgroundColor: bg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 } as const;
}
