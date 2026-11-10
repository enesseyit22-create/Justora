import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Companion } from '@/src/components/Companion';
import { Press, PrimaryButton, Screen, Txt } from '@/src/components/ui';
import { useI18n } from '@/src/i18n/useI18n';
import { actions, useApp, useIsPro } from '@/src/store/store';
import { useTheme } from '@/src/theme/theme';

export default function PaywallScreen() {
  const { plans, purchaseState, purchaseMessage } = useApp();
  const pro = useIsPro();
  const { t } = useI18n();
  const { palette } = useTheme();
  const [plan, setPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [busy, setBusy] = useState(false);
  const selected = plan === 'yearly' ? plans.yearly : plans.monthly;
  const trialDays = selected?.trialDays ?? null;
  const price = selected?.priceString ?? t('priceUnavailable');
  const period = plan === 'yearly' ? t('periodYear') : t('periodMonth');
  const disclosure =
    trialDays && selected
      ? t('disclosureTrial', { name: t('appName'), period, price: selected.priceString, days: trialDays })
      : selected
        ? t('disclosurePaid', { name: t('appName'), period, price: selected.priceString })
        : t('paySubtitle');

  const close = () => {
    actions.markPaywallSeen();
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Press onPress={close} label={t('close')}>
          <Txt size={22}>×</Txt>
        </Press>
        <Press
          onPress={() => {
            void actions.restore();
          }}>
          <Txt>{t('restore')}</Txt>
        </Press>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Companion size={140} />
      </View>
      <Txt size={32} weight="extra" center>
        {pro ? t('alreadyPro') : t('payTitle')}
      </Txt>
      <Txt center color={palette.muted}>
        {t('paySubtitle')}
      </Txt>
      {[t('feature1'), t('feature2'), t('feature3'), t('feature4'), t('feature5'), t('feature6')].map((line) => (
        <Txt key={line}>· {line}</Txt>
      ))}
      <PlanCard
        title={t('payYearly')}
        price={plans.yearly?.priceString ?? t('priceUnavailable')}
        period={t('perYear')}
        badge={t('bestValue')}
        trial={plans.yearly?.trialDays ? t('trialLine', { days: plans.yearly.trialDays }) : null}
        selected={plan === 'yearly'}
        onPress={() => setPlan('yearly')}
      />
      <PlanCard
        title={t('payMonthly')}
        price={plans.monthly?.priceString ?? t('priceUnavailable')}
        period={t('perMonth')}
        trial={plans.monthly?.trialDays ? t('trialLine', { days: plans.monthly.trialDays }) : null}
        selected={plan === 'monthly'}
        onPress={() => setPlan('monthly')}
      />
      <Txt size={13} color={palette.muted}>
        {disclosure}
      </Txt>
      {purchaseState !== 'ready' ? (
        <Txt size={13} color={palette.sage}>
          {purchaseState === 'unavailable' ? t('devUnavailable') : t('devMissing')}
        </Txt>
      ) : !plans.yearly && !plans.monthly ? (
        <Txt size={13}>{t('devEmpty')}</Txt>
      ) : null}
      <PrimaryButton
        title={pro ? t('continue') : trialDays ? t('startTrial') : t('continuePlan')}
        disabled={busy || (!pro && purchaseState !== 'ready')}
        onPress={() => {
          if (pro) {
            close();
            return;
          }
          setBusy(true);
          void actions.purchase(plan).then((kind) => {
            setBusy(false);
            if (kind === 'purchased') close();
          });
        }}
      />
      {purchaseMessage === 'fail' ? <Txt>{t('purchaseFail')}</Txt> : null}
      <Txt center color={palette.muted}>
        {t('cancelAnytime')}
      </Txt>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
        <Press onPress={() => router.push('/terms')}>
          <Txt color={palette.accent}>{t('terms')}</Txt>
        </Press>
        <Press onPress={() => router.push('/privacy')}>
          <Txt color={palette.accent}>{t('privacy')}</Txt>
        </Press>
      </View>
      <Press onPress={close}>
        <Txt center color={palette.muted}>
          {t('later')}
        </Txt>
      </Press>
    </Screen>
  );
}

function PlanCard({
  title,
  price,
  period,
  badge,
  trial,
  selected,
  onPress,
}: {
  title: string;
  price: string;
  period: string;
  badge?: string;
  trial: string | null;
  selected: boolean;
  onPress: () => void;
}) {
  const { palette } = useTheme();
  return (
    <Press
      onPress={onPress}
      style={{
        borderRadius: 24,
        padding: 16,
        backgroundColor: selected ? '#FFF1E8' : palette.card,
        borderWidth: selected ? 2 : 0,
        borderColor: palette.accent,
        gap: 4,
      }}>
      {badge ? (
        <Txt size={12} weight="bold" color={palette.accentInk} style={{ backgroundColor: palette.accent, alignSelf: 'flex-start', overflow: 'hidden', borderRadius: 10, paddingHorizontal: 8 }}>
          {badge}
        </Txt>
      ) : null}
      <Txt weight="extra" size={20}>
        {title}
      </Txt>
      <Txt>
        {price} {period}
      </Txt>
      {trial ? <Txt color={palette.muted}>{trial}</Txt> : null}
    </Press>
  );
}
