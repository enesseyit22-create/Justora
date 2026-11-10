export const APP_NAME_FALLBACK = 'Justora';
export const CONTACT_EMAIL = 'fishmapss@gmail.com';
export const PRIVACY_URL = 'https://enesseyit22-create.github.io/Justora/privacy.html';
export const TERMS_URL = 'https://enesseyit22-create.github.io/Justora/terms.html';
export const APPLE_EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
export const PLACEHOLDER_EAS_PROJECT_ID = '00000000-0000-4000-8000-000000000000';
export const ENTITLEMENT_ID = 'pro';
export const PRODUCT_MONTHLY = 'focus_pro_monthly';
export const PRODUCT_YEARLY = 'focus_pro_yearly';
export const FREE_PRESET_MIN = 25;
export const JUST_START_MIN = 2;
export const FREE_TASK_LIMIT = 3;
export const FREE_BREAKDOWNS_PER_DAY = 3;
export const KIND_LIST_NUDGE = 5;
export const PRESETS = [5, 10, 15, 25, 45] as const;

/** Native App Intents stay off until a dev build registers them. URL shortcuts work without this. */
export const APP_INTENTS_ENABLED = process.env.EXPO_PUBLIC_ENABLE_APP_INTENTS === '1';
