import { View } from 'react-native';

import { Press, Txt } from '@/src/components/ui';
import { useI18n } from '@/src/i18n/useI18n';
import { useUpdates } from '@/src/services/updates';
import { useApp } from '@/src/store/store';
import { useTheme } from '@/src/theme/theme';

export function UpdateBanner() {
  const { phase, reload, dismiss, dismissed } = useUpdates();
  const timer = useApp().timer;
  const { t } = useI18n();
  const { palette } = useTheme();
  if (phase !== 'ready' || dismissed) return null;
  const running = timer?.status === 'running';
  return (
    <View
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: 28,
        backgroundColor: palette.card,
        borderRadius: 22,
        padding: 16,
        gap: 8,
        shadowColor: palette.shadow,
        shadowOpacity: 0.16,
        shadowRadius: 16,
        elevation: 6,
      }}>
      <Txt weight="bold">{t('updatesReady')}</Txt>
      <Txt color={palette.muted}>{running ? t('updatesWait') : t('updatesNone')}</Txt>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Press onPress={dismiss} label={t('notNow')}>
          <Txt color={palette.muted}>{t('notNow')}</Txt>
        </Press>
        {!running ? (
          <Press onPress={() => void reload()} label={t('reload')}>
            <Txt weight="bold" color={palette.accent}>
              {t('reload')}
            </Txt>
          </Press>
        ) : null}
      </View>
    </View>
  );
}
