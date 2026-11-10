import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Companion } from '@/src/components/Companion';
import { TimerDisc } from '@/src/components/Wedge';
import { Press, PrimaryButton, Screen, Txt } from '@/src/components/ui';
import { useI18n } from '@/src/i18n/useI18n';
import { actions } from '@/src/store/store';
import { useTheme } from '@/src/theme/theme';

export default function OnboardingScreen() {
  const [page, setPage] = useState(0);
  const { t } = useI18n();
  const { palette } = useTheme();
  const pages = [
    { title: t('onb1Title'), body: t('onb1Body') },
    { title: t('onb2Title'), body: t('onb2Body') },
    { title: t('onb3Title'), body: t('onb3Body') },
  ];
  const last = page === pages.length - 1;
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', gap: 18 }}>
        {page === 0 ? <TimerDisc size={240} fraction={0.72} time="25" caption={t('min')} /> : <View style={{ alignItems: 'center' }}><Companion size={180} breathing /></View>}
        <Txt size={32} weight="extra" center>
          {pages[page].title}
        </Txt>
        <Txt center color={palette.muted} size={17}>
          {pages[page].body}
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
        {pages.map((_, index) => (
          <View key={index} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: index === page ? palette.accent : palette.line }} />
        ))}
      </View>
      <PrimaryButton
        title={last ? t('onbCta') : t('continue')}
        onPress={() => {
          if (!last) {
            setPage((value) => value + 1);
            return;
          }
          actions.finishOnboarding();
          actions.startJust();
          router.replace('/(tabs)/timer');
        }}
      />
      <Press
        onPress={() => {
          actions.markAha();
          actions.markPaywallSeen();
          router.replace('/(tabs)');
        }}
        style={{ padding: 14 }}>
        <Txt center color={palette.muted}>
          {t('skip')}
        </Txt>
      </Press>
    </Screen>
  );
}
