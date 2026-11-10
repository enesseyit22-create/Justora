import { router } from 'expo-router';

import { Press, Screen, Txt } from '@/src/components/ui';
import { useI18n } from '@/src/i18n/useI18n';

export default function TermsScreen() {
  const { t } = useI18n();
  return (
    <Screen scroll>
      <Press onPress={() => router.back()}>
        <Txt>{t('close')}</Txt>
      </Press>
      <Txt size={32} weight="extra">
        {t('legalTermsTitle')}
      </Txt>
      {t('legalTermsBody').split('\n\n').map((paragraph) => (
        <Txt key={paragraph.slice(0, 24)}>{paragraph}</Txt>
      ))}
      <Txt>{t('termsStores')}</Txt>
    </Screen>
  );
}
