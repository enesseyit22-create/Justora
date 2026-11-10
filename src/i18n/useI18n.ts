import type { AppLocale } from '@/src/domain/types';
import { deviceLocale, translate, type Key } from '@/src/i18n';
import { useApp } from '@/src/store/store';

export function useI18n() {
  const setting = useApp().settings.locale;
  const locale: AppLocale = setting === 'system' ? deviceLocale() : setting;
  return {
    locale,
    t: (key: Key, vars?: Record<string, string | number>) => translate(locale, key, vars),
  };
}
