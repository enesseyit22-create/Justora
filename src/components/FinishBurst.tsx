import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { Companion } from '@/src/components/Companion';
import { Txt } from '@/src/components/ui';
import { useI18n } from '@/src/i18n/useI18n';
import { haptic } from '@/src/services/haptics';
import { useTheme } from '@/src/theme/theme';

export function FinishBurst({ haptics, onDone }: { haptics: boolean; onDone: () => void }) {
  const { t } = useI18n();
  const { palette } = useTheme();
  const scale = useSharedValue(0.72);
  const turn = useSharedValue(-10);
  const [gone, setGone] = useState(false);
  const finish = () => {
    setGone(true);
    onDone();
  };
  useEffect(() => {
    scale.value = withSequence(withTiming(1.12, { duration: 280 }), withTiming(0.96, { duration: 180 }), withTiming(1, { duration: 220 }));
    turn.value = withSequence(withTiming(8, { duration: 220 }), withTiming(-6, { duration: 220 }), withTiming(0, { duration: 260 }));
    if (haptics) void haptic('light');
    const timer = setTimeout(finish, 1600);
    return () => clearTimeout(timer);
  }, [haptics, scale, turn]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { rotate: `${turn.value}deg` }] }));
  if (gone) return null;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={t('celebrateSkip')} onPress={finish} style={{ alignItems: 'center', gap: 6, paddingVertical: 8 }}>
      <Animated.View style={style}>
        <Companion size={112} hero pose="happy" />
      </Animated.View>
      <Txt size={13} color={palette.muted} center>
        {t('celebrateSkip')}
      </Txt>
    </Pressable>
  );
}
