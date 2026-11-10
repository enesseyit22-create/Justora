import { useState } from 'react';
import { View } from 'react-native';

import { CardArt } from '@/src/components/CompanionArt';
import { Companion } from '@/src/components/Companion';
import { Press, PrimaryButton, Screen, Txt } from '@/src/components/ui';
import { CARD_BY_ID } from '@/src/domain/rewards';
import { useI18n } from '@/src/i18n/useI18n';
import { useTheme } from '@/src/theme/theme';

export function Guide({ onDone, onSkip }: { onDone: () => void; onSkip: () => void }) {
  const [page, setPage] = useState(0);
  const { t } = useI18n();
  const { palette } = useTheme();
  const pages = [
    { title: t('guide1Title'), body: t('guide1Body') },
    { title: t('guide2Title'), body: t('guide2Body') },
    { title: t('guide3Title'), body: t('guide3Body') },
  ];
  const last = page === pages.length - 1;
  const bloom = CARD_BY_ID.weekBloom;
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 18 }}>
        {page === 0 ? <Companion size={180} breathing /> : null}
        {page === 1 ? (
          <View style={{ alignItems: 'center', gap: 18 }}>
            <Companion size={140} breathing />
            <View style={{ backgroundColor: palette.accent, borderRadius: 28, paddingHorizontal: 36, paddingVertical: 14, minWidth: 180 }}>
              <Txt size={18} weight="extra" color={palette.accentInk} center>
                {t('start')}
              </Txt>
            </View>
          </View>
        ) : null}
        {page === 2 ? <CardArt id="weekBloom" colors={bloom.colors} width={168} /> : null}
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
        title={last ? t('guideDone') : t('continue')}
        onPress={() => {
          if (!last) {
            setPage((value) => value + 1);
            return;
          }
          onDone();
        }}
      />
      <Press onPress={onSkip} style={{ padding: 14 }}>
        <Txt center color={palette.muted}>
          {t('skip')}
        </Txt>
      </Press>
    </Screen>
  );
}
