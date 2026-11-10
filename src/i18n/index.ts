import { getLocales } from 'expo-localization';

import type { AppLocale } from '@/src/domain/types';
import { de } from '@/src/i18n/locales/de';
import { es } from '@/src/i18n/locales/es';
import { fr } from '@/src/i18n/locales/fr';
import { it } from '@/src/i18n/locales/it';
import { ja } from '@/src/i18n/locales/ja';
import { ptBR } from '@/src/i18n/locales/pt-BR';
import { en, tr, type Key } from '@/src/i18n/strings';

export type { Key };

/** Add a locale: translate en.ts keys, register it here, add languages/{code}.json, and an APP_STORE.md section. */
export const messages: Record<AppLocale, Record<Key, string>> = {
  en,
  tr,
  de,
  es,
  fr,
  'pt-BR': ptBR,
  it,
  ja,
};

export const localeChoices: { id: AppLocale; nativeName: string }[] = [
  { id: 'en', nativeName: 'English' },
  { id: 'tr', nativeName: 'Türkçe' },
  { id: 'de', nativeName: 'Deutsch' },
  { id: 'es', nativeName: 'Español' },
  { id: 'fr', nativeName: 'Français' },
  { id: 'pt-BR', nativeName: 'Português (Brasil)' },
  { id: 'it', nativeName: 'Italiano' },
  { id: 'ja', nativeName: '日本語' },
];

export function deviceLocale(): AppLocale {
  try {
    const current = getLocales()[0];
    const tag = (current?.languageTag ?? '').toLowerCase();
    const code = (current?.languageCode ?? '').toLowerCase();
    if (tag.startsWith('pt') || code === 'pt') return 'pt-BR';
    const known = localeChoices.find((item) => item.id.toLowerCase() === code || item.id.toLowerCase() === tag);
    return known?.id ?? 'en';
  } catch {
    return 'en';
  }
}

export function translate(locale: AppLocale, key: Key, vars?: Record<string, string | number>): string {
  let text = messages[locale][key] ?? messages.en[key];
  if (!vars) return text;
  for (const [name, value] of Object.entries(vars)) {
    text = text.replaceAll(`{{${name}}}`, String(value));
  }
  return text;
}
