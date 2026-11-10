import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import type { AccessoryId } from '@/src/domain/types';
import { useTheme } from '@/src/theme/theme';

export function Companion({
  size = 140,
  breathing = false,
  accessory = 'none',
}: {
  size?: number;
  breathing?: boolean;
  accessory?: AccessoryId | 'none';
}) {
  const { palette } = useTheme();
  const scale = useSharedValue(1);
  useEffect(() => {
    if (!breathing) {
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(withTiming(1.045, { duration: 3600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [breathing, scale]);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[{ width: size, height: size }, animated]}>
      <View style={[styles.shadow, { backgroundColor: palette.shadow, width: size * 0.46, top: size * 0.78 }]} />
      <Animated.Image
        accessibilityIgnoresInvertColors
        source={require('../../assets/images/companion.png')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
      {accessory === 'flower' ? <View style={[styles.flower, { backgroundColor: palette.sage, right: size * 0.18, top: size * 0.22 }]} /> : null}
      {accessory === 'star' ? <View style={[styles.star, { backgroundColor: palette.accent, left: size * 0.42, top: size * 0.08 }]} /> : null}
      {accessory === 'glasses' ? (
        <View style={[styles.glasses, { top: size * 0.4, borderColor: palette.ink }]}>
          <View style={[styles.lens, { borderColor: palette.ink }]} />
          <View style={[styles.lens, { borderColor: palette.ink }]} />
        </View>
      ) : null}
      {accessory === 'scarf' ? (
        <View style={[styles.scarf, { backgroundColor: palette.sage, top: size * 0.62, width: size * 0.42 }]} />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    position: 'absolute',
    alignSelf: 'center',
    height: 14,
    borderRadius: 20,
    opacity: 0.18,
  },
  flower: { position: 'absolute', width: 16, height: 16, borderRadius: 8 },
  star: { position: 'absolute', width: 12, height: 12, borderRadius: 3, transform: [{ rotate: '20deg' }] },
  glasses: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  lens: { width: 22, height: 14, borderRadius: 8, borderWidth: 2 },
  scarf: { position: 'absolute', alignSelf: 'center', height: 14, borderRadius: 10 },
});
