import { View } from 'react-native';

import { Press, Txt } from '@/src/components/ui';
import { levelProgress } from '@/src/domain/rewards';
import { useI18n } from '@/src/i18n/useI18n';
import { useTheme } from '@/src/theme/theme';

export function XpBar({
  xp,
  onPress,
}: {
  xp: number;
  onPress?: () => void;
}) {
  const { t } = useI18n();
  const { palette } = useTheme();
  const progress = levelProgress(xp);
  const bar = (
    <View
      accessible
      accessibilityRole={onPress ? 'button' : 'progressbar'}
      accessibilityLabel={t('xpBarA11y', { level: progress.level, current: progress.current, needed: progress.needed })}
      style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Txt weight="bold">{t('levelShort', { level: progress.level })}</Txt>
        <Txt size={13} color={palette.muted}>
          {progress.current} / {progress.needed} {t('xp')}
        </Txt>
      </View>
      <View style={{ height: 10, borderRadius: 8, backgroundColor: palette.ring, overflow: 'hidden' }}>
        <View style={{ width: `${Math.round(progress.ratio * 100)}%`, height: '100%', backgroundColor: palette.accent, borderRadius: 8 }} />
      </View>
    </View>
  );
  if (!onPress) return bar;
  return <Press onPress={onPress}>{bar}</Press>;
}
