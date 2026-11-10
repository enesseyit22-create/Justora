import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PACKAGE_TYPE,
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';

import { ENTITLEMENT_ID, PRODUCT_MONTHLY, PRODUCT_YEARLY } from '@/src/config';
import type { ConfigureResult, PlanInfo, PurchaseOutcome } from '@/src/services/purchases';

let configured = false;
const cache: { monthly?: PurchasesPackage; yearly?: PurchasesPackage } = {};

function usable(key: string | undefined, prefix: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (!trimmed || trimmed.includes('REPLACE') || trimmed.includes('YOUR')) return false;
  return trimmed.startsWith(prefix);
}

export async function configurePurchases(): Promise<ConfigureResult> {
  if (configured) return 'ready';
  const key =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  const prefix = Platform.OS === 'ios' ? 'appl_' : 'goog_';
  if (!usable(key, prefix)) return 'missing-key';
  try {
    if (__DEV__) await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey: key!.trim() });
    configured = true;
    return 'ready';
  } catch {
    return 'unavailable';
  }
}

export function subscribePro(onChange: (active: boolean) => void): () => void {
  if (!configured) return () => undefined;
  const listener = (info: CustomerInfo) => {
    onChange(info.entitlements.active[ENTITLEMENT_ID] != null);
  };
  Purchases.addCustomerInfoUpdateListener(listener);
  Purchases.getCustomerInfo()
    .then(listener)
    .catch(() => onChange(false));
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
}

function trialDays(pkg: PurchasesPackage): number | null {
  const intro = pkg.product.introPrice;
  if (!intro || intro.price !== 0) return null;
  if (intro.periodUnit === 'DAY') return intro.periodNumberOfUnits;
  if (intro.periodUnit === 'WEEK') return intro.periodNumberOfUnits * 7;
  return null;
}

function toPlan(id: 'monthly' | 'yearly', pkg?: PurchasesPackage): PlanInfo | null {
  if (!pkg) return null;
  return {
    id,
    priceString: pkg.product.priceString,
    priceAmount: typeof pkg.product.price === 'number' ? pkg.product.price : null,
    period: id === 'yearly' ? 'year' : 'month',
    trialDays: trialDays(pkg),
  };
}

export async function loadPlans(): Promise<{ monthly: PlanInfo | null; yearly: PlanInfo | null }> {
  if (!configured) return { monthly: null, yearly: null };
  try {
    const offerings = await Purchases.getOfferings();
    const packages = offerings.current?.availablePackages ?? [];
    cache.monthly =
      packages.find((pkg) => pkg.product.identifier === PRODUCT_MONTHLY) ??
      packages.find((pkg) => pkg.packageType === PACKAGE_TYPE.MONTHLY);
    cache.yearly =
      packages.find((pkg) => pkg.product.identifier === PRODUCT_YEARLY) ??
      packages.find((pkg) => pkg.packageType === PACKAGE_TYPE.ANNUAL);
    return { monthly: toPlan('monthly', cache.monthly), yearly: toPlan('yearly', cache.yearly) };
  } catch {
    return { monthly: null, yearly: null };
  }
}

export async function buy(id: 'monthly' | 'yearly'): Promise<PurchaseOutcome> {
  try {
    if (!cache[id]) await loadPlans();
    const pkg = cache[id];
    if (!pkg) return { kind: 'failed', message: 'missing-package' };
    await Purchases.purchasePackage(pkg);
    return { kind: 'purchased' };
  } catch (error) {
    if (typeof error === 'object' && error && 'userCancelled' in error && (error as { userCancelled?: boolean | null }).userCancelled) {
      return { kind: 'cancelled' };
    }
    const message =
      typeof error === 'object' && error && 'message' in error
        ? String((error as { message?: unknown }).message ?? 'failed')
        : 'failed';
    return { kind: 'failed', message };
  }
}

export async function restorePurchases(): Promise<'restored' | 'none' | 'failed'> {
  try {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active[ENTITLEMENT_ID] ? 'restored' : 'none';
  } catch {
    return 'failed';
  }
}
