import { useEffect, useState } from 'react';
import { AccessibilityInfo, Image, StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import type { AccessoryId, BackdropId } from '@/src/domain/types';
import { SceneArt, WearArt } from '@/src/components/AccessoryArt';
import { useTheme } from '@/src/theme/theme';

export type CompanionPose = 'idle' | 'focus' | 'happy' | 'sleepy';

export function Companion({
  size = 140,
  breathing = false,
  float = false,
  accessory = 'none',
  backdrop = 'none',
  hero = false,
  pose = 'idle',
}: {
  size?: number;
  breathing?: boolean;
  float?: boolean;
  accessory?: AccessoryId | 'none';
  backdrop?: BackdropId;
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
  const framed = hero && backdrop === 'none';
  const source = framed
    ? require('../../assets/images/companion-hero.png')
    : require('../../assets/images/companion.png');
  return (
    <Animated.View style={[{ width: size, height: size }, animated]}>
      <Animated.View
        style={[
          styles.shadow,
          { backgroundColor: palette.shadow, width: size * (framed ? 0.58 : 0.46), top: size * (framed ? 0.84 : 0.78) },
          shadow,
        ]}
      />
      {backdrop !== 'none' ? <SceneArt id={backdrop} size={size} /> : null}
      <Image
        accessibilityIgnoresInvertColors
        source={source}
        style={{ width: size, height: size, borderRadius: framed ? size * 0.22 : 0 }}
        resizeMode="contain"
      />
      {accessory !== 'none' ? <WearArt id={accessory} size={size} hero={framed} /> : null}
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
});
