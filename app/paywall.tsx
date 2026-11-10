import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Linking, View } from 'react-native';

import { Companion } from '@/src/components/Companion';
import { Press, PrimaryButton, Screen, Txt } from '@/src/components/ui';
import { PRIVACY_URL, TERMS_URL, APPLE_EULA_URL } from '@/src/config';
import type { PlanInfo } from '@/src/services/purchases';
import { useI18n } from '@/src/i18n/useI18n';
import { actions, useApp, useIsPro } from '@/src/store/store';
import { useTheme } from '@/src/theme/theme';

function savingsPercent(monthly: PlanInfo | null, yearly: PlanInfo | null): number | null {
  const month = monthly?.priceAmount;
  const year = yearly?.priceAmount;
  if (month == null || year == null || month <= 0 || year <= 0) return null;
  const full = month * 12;
  if (year >= full) return null;
  const percent = Math.round((1 - year / full) * 100);
  return percent >= 5 ? percent : null;
}

export default function PaywallScreen() {
  const { plans, purchaseState, purchaseMessage } = useApp();
  const pro = useIsPro();
  const { t } = useI18n();
  const { palette } = useTheme();
  const [plan, setPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [busy, setBusy] = useState(false);
  const [restoreNote, setRestoreNote] = useState<'restored' | 'none' | 'failed' | null>(null);
  const selected = plan === 'yearly' ? plans.yearly : plans.monthly;
  const trialDays = selected?.trialDays ?? null;
  const storeReady = purchaseState === 'ready' && Boolean(plans.yearly || plans.monthly);
  const account = Platform.OS === 'android' ? t('accountGoogle') : t('accountApple');
  const store = Platform.OS === 'android' ? t('storeGoogle') : t('storeApple');
  const period = plan === 'yearly' ? t('periodYear') : t('periodMonth');
  const disclosure =
    trialDays && selected?.priceString
      ? t('disclosureTrial', { name: t('appName'), period, price: selected.priceString, days: trialDays, account, store })
      : selected?.priceString
        ? t('disclosurePaid', { name: t('appName'), period, price: selected.priceString, account, store })
        : t('disclosureCheckout', { name: t('appName'), store, account });
  const save = savingsPercent(plans.monthly, plans.yearly);
  const features = [t('feature1'), t('feature2'), t('feature3'), t('feature4'), t('feature5'), t('feature6')];
  const cta = pro
    ? t('continue')
    : trialDays
      ? t('startTrialDays', { days: trialDays })
      : plan === 'yearly'
        ? t('continueYearly')
        : t('continueMonthly');

  const close = () => {
    actions.markPaywallSeen();
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Press onPress={close} label={t('close')} style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}>
          <Txt size={22}>×</Txt>
        </Press>
        <Press
          onPress={() => {
            void actions.restore().then((result) => setRestoreNote(result));
          }}
          style={{ minHeight: 44, justifyContent: 'center' }}>
          <Txt weight="bold" color={palette.accent}>
            {t('restore')}
          </Txt>
        </Press>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Companion size={96} />
        <Txt size={32} weight="extra" center>
          {pro ? t('alreadyPro') : t('payTitle')}
        </Txt>
        {!pro ? (
          <Txt center color={palette.muted}>
            {t('paySubtitle')}
          </Txt>
        ) : null}
      </View>
      <View style={{ backgroundColor: palette.card, borderRadius: 22, padding: 16, gap: 10 }}>
        {features.map((line) => (
          <View key={line} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Txt weight="bold" color={palette.sage}>
              ✓
            </Txt>
            <Txt style={{ flex: 1 }}>{line}</Txt>
          </View>
        ))}
      </View>
      <PlanCard
        title={plans.yearly?.priceString ? t('payYearly') : t('yearlyPlan')}
        price={plans.yearly?.priceString ?? null}
        period={plans.yearly?.priceString ? t('perYear') : null}
        fallback={t('priceAtCheckout')}
        badge={t('bestValue')}
        save={save != null ? t('savePercent', { count: save }) : null}
        trial={plans.yearly?.trialDays ? t('trialLine', { days: plans.yearly.trialDays }) : null}
        selected={plan === 'yearly'}
        onPress={() => setPlan('yearly')}
      />
      <PlanCard
        title={plans.monthly?.priceString ? t('payMonthly') : t('monthlyPlan')}
        price={plans.monthly?.priceString ?? null}
        period={plans.monthly?.priceString ? t('perMonth') : null}
        fallback={t('priceAtCheckout')}
        trial={plans.monthly?.trialDays ? t('trialLine', { days: plans.monthly.trialDays }) : null}
        selected={plan === 'monthly'}
        onPress={() => setPlan('monthly')}
      />
      <Txt size={13} color={palette.muted}>
        {disclosure}
      </Txt>
      {storeReady || pro ? null : __DEV__ ? (
        <Txt size={13} color={palette.sage}>
          {purchaseState === 'unavailable' ? t('devUnavailable') : purchaseState === 'ready' ? t('devEmpty') : t('devMissing')}
        </Txt>
      ) : (
        <Txt size={13} color={palette.muted}>
          {t('purchasesOff')}
        </Txt>
      )}
      <PrimaryButton
        title={cta}
        disabled={busy || (!pro && !storeReady)}
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
      {restoreNote === 'restored' ? <Txt>{t('restored')}</Txt> : null}
      {restoreNote === 'none' ? <Txt>{t('restoreNone', { account })}</Txt> : null}
      {restoreNote === 'failed' ? <Txt>{t('restoreFail')}</Txt> : null}
      <Txt center color={palette.muted}>
        {t('cancelAnytime')}
      </Txt>
      <Txt size={12} color={palette.muted} center>
        {t('payMedical')}
      </Txt>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        <Press onPress={() => void Linking.openURL(TERMS_URL)} style={{ minHeight: 44, justifyContent: 'center' }}>
          <Txt color={palette.accent}>{t('terms')}</Txt>
        </Press>
        {Platform.OS === 'ios' ? (
          <Press onPress={() => void Linking.openURL(APPLE_EULA_URL)} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Txt color={palette.accent}>{t('termsEula')}</Txt>
          </Press>
        ) : null}
        <Press onPress={() => void Linking.openURL(PRIVACY_URL)} style={{ minHeight: 44, justifyContent: 'center' }}>
          <Txt color={palette.accent}>{t('privacy')}</Txt>
        </Press>
      </View>
      <Press onPress={close} style={{ minHeight: 44, justifyContent: 'center' }}>
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
  fallback,
  badge,
  save,
  trial,
  selected,
  onPress,
}: {
  title: string;
  price: string | null;
  period: string | null;
  fallback: string;
  badge?: string;
  save?: string | null;
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
        backgroundColor: selected ? palette.sageSoft : palette.card,
        borderWidth: 2,
        borderColor: selected ? palette.accent : palette.line,
        gap: 4,
      }}>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {badge ? (
          <Txt size={12} weight="bold" color={palette.accentInk} style={{ backgroundColor: palette.accent, borderRadius: 10, paddingHorizontal: 8, overflow: 'hidden' }}>
            {badge}
          </Txt>
        ) : null}
        {save ? (
          <Txt size={12} weight="bold" color={palette.sage} style={{ backgroundColor: palette.card, borderRadius: 10, paddingHorizontal: 8, overflow: 'hidden' }}>
            {save}
          </Txt>
        ) : null}
      </View>
      <Txt weight="extra" size={22}>
        {title}
      </Txt>
      {price && period ? (
        <Txt weight="bold" size={18}>
          {price} {period}
        </Txt>
      ) : (
        <Txt color={palette.muted}>{fallback}</Txt>
      )}
      {trial ? (
        <Txt color={palette.sage} weight="bold">
          {trial}
        </Txt>
      ) : null}
    </Press>
  );
}
