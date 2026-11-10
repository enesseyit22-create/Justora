export const APP_NAME_FALLBACK = 'Justora';
export const PLACEHOLDER_EAS_PROJECT_ID = '4c2cc818-a80b-4f5f-b88a-2ef69d8ac75b';
export const ENTITLEMENT_ID = 'pro';
export const PRODUCT_MONTHLY = 'focus_pro_monthly';
export const PRODUCT_YEARLY = 'focus_pro_yearly';
export const FREE_PRESET_MIN = 25;
export const JUST_START_MIN = 2;
export const FREE_TASK_LIMIT = 3;
export const KIND_LIST_NUDGE = 5;
export const PRESETS = [5, 10, 15, 25, 45] as const;

/** Native App Intents stay off until a dev build registers them. URL shortcuts work without this. */
export const APP_INTENTS_ENABLED = process.env.EXPO_PUBLIC_ENABLE_APP_INTENTS === '1';
