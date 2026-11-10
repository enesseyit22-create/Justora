export type PlanInfo = {
  id: 'monthly' | 'yearly';
  priceString: string;
  period: 'month' | 'year';
  trialDays: number | null;
};

export type PurchaseOutcome =
  | { kind: 'purchased' }
  | { kind: 'cancelled' }
  | { kind: 'failed'; message: string };

export type ConfigureResult = 'ready' | 'missing-key' | 'unavailable';

export async function configurePurchases(): Promise<ConfigureResult> {
  return 'missing-key';
}

export function subscribePro(_onChange: (active: boolean) => void): () => void {
  return () => undefined;
}

export async function loadPlans(): Promise<{ monthly: PlanInfo | null; yearly: PlanInfo | null }> {
  return { monthly: null, yearly: null };
}

export async function buy(_id: 'monthly' | 'yearly'): Promise<PurchaseOutcome> {
  return { kind: 'failed', message: 'web' };
}

export async function restorePurchases(): Promise<'restored' | 'none' | 'failed'> {
  return 'failed';
}
