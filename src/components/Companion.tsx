import { useEffect, useState } from 'react';
import { AccessibilityInfo, Image, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import type { AccessoryId } from '@/src/domain/types';
import { useTheme } from '@/src/theme/theme';

export type CompanionPose = 'idle' | 'focus' | 'happy' | 'sleepy';

export function Companion({
  size = 140,
  breathing = false,
  float = false,
  accessory = 'none',
  hero = false,
  pose = 'idle',
}: {
  size?: number;
  breathing?: boolean;
  float?: boolean;
  accessory?: AccessoryId | 'none';
  hero?: boolean;
  pose?: CompanionPose;
}) {
  const { palette } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);
  const sway = useSharedValue(0);
  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduceMotion(value);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  useEffect(() => {
    if (reduceMotion) {
      scale.value = withTiming(pose === 'sleepy' ? 0.96 : 1, { duration: 180 });
      lift.value = withTiming(pose === 'sleepy' ? 4 : 0, { duration: 180 });
      sway.value = withTiming(pose === 'sleepy' ? -4 : 0, { duration: 180 });
      return;
    }
    if (pose === 'happy') {
      scale.value = withSequence(withTiming(1.12, { duration: 260 }), withTiming(1, { duration: 280 }));
      lift.value = withSequence(withTiming(-12, { duration: 260 }), withTiming(0, { duration: 280 }));
      sway.value = withTiming(0, { duration: 200 });
      return;
    }
    if (pose === 'focus') {
      scale.value = withRepeat(withTiming(1.03, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true);
      sway.value = withRepeat(withTiming(6, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
      lift.value = withTiming(0, { duration: 200 });
      return;
    }
    if (pose === 'sleepy' || (!breathing && !float && pose === 'idle')) {
      scale.value = withRepeat(withTiming(0.985, { duration: 4200, easing: Easing.inOut(Easing.sin) }), -1, true);
      lift.value = withTiming(pose === 'sleepy' ? 6 : 0, { duration: 400 });
      sway.value = withTiming(pose === 'sleepy' ? -6 : 0, { duration: 400 });
      return;
    }
    if (breathing) {
      scale.value = withRepeat(withTiming(1.045, { duration: 3600, easing: Easing.inOut(Easing.sin) }), -1, true);
    } else {
      scale.value = withTiming(1, { duration: 180 });
    }
    if (float) {
      lift.value = withRepeat(withTiming(-7, { duration: 2800, easing: Easing.inOut(Easing.sin) }), -1, true);
    } else {
      lift.value = withTiming(0, { duration: 180 });
    }
    sway.value = withTiming(0, { duration: 180 });
  }, [breathing, float, lift, pose, reduceMotion, scale, sway]);
  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }, { translateX: sway.value }, { rotate: `${sway.value * 0.4}deg` }, { scale: scale.value }],
    opacity: pose === 'sleepy' ? 0.88 : 1,
  }));
  const shadow = useAnimatedStyle(() => ({
    transform: [{ scaleX: 1 + (-lift.value) * 0.012 }, { scaleY: 1 }],
    opacity: 0.16 + (7 + lift.value) * 0.012,
  }));
  const source = hero
    ? require('../../assets/images/companion-hero.png')
    : require('../../assets/images/companion.png');
  return (
    <Animated.View style={[{ width: size, height: size }, animated]}>
      <Animated.View
        style={[
          styles.shadow,
          { backgroundColor: palette.shadow, width: size * (hero ? 0.58 : 0.46), top: size * (hero ? 0.84 : 0.78) },
          shadow,
        ]}
      />
      <Image
        accessibilityIgnoresInvertColors
        source={source}
        style={{ width: size, height: size, borderRadius: hero ? size * 0.22 : 0 }}
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
    height: 16,
    borderRadius: 20,
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
