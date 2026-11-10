import { ReactNode, useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Companion } from '@/src/components/Companion';
import { Txt } from '@/src/components/ui';
import { levelFromXp } from '@/src/domain/rewards';
import type { AccessoryId } from '@/src/domain/types';
import { useI18n } from '@/src/i18n/useI18n';
import { useTheme } from '@/src/theme/theme';

function withAlpha(color: string, alpha: string): string {
  if (color.startsWith('#') && color.length === 7) return `${color}${alpha}`;
  return color;
}

export function AmbientGlow() {
  const { palette } = useTheme();
  const shift = useSharedValue(0);
  useEffect(() => {
    shift.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [shift]);
  const peach = useAnimatedStyle(() => ({
    transform: [
      { translateY: shift.value * 16 },
      { translateX: (1 - shift.value) * 12 },
      { scale: 1 + shift.value * 0.08 },
    ],
    opacity: 0.42 + shift.value * 0.16,
  }));
  const sage = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - shift.value) * 14 },
      { translateX: shift.value * -10 },
      { scale: 1.05 - shift.value * 0.06 },
    ],
    opacity: 0.28 + (1 - shift.value) * 0.12,
  }));
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[palette.bg, withAlpha(palette.accent, '33'), withAlpha(palette.sageSoft, '88'), palette.bg]}
        locations={[0, 0.28, 0.68, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.blob, { top: -30, right: -50, width: 230, height: 230 }, peach]}>
        <LinearGradient colors={[withAlpha(palette.accent, 'AA'), withAlpha(palette.accent, '00')]} style={styles.fill} />
      </Animated.View>
      <Animated.View style={[styles.blob, { bottom: 80, left: -70, width: 260, height: 260 }, sage]}>
        <LinearGradient colors={[withAlpha(palette.sage, '66'), withAlpha(palette.sage, '00')]} style={styles.fill} />
      </Animated.View>
    </View>
  );
}

export function Enter({ delay = 0, children, style }: { delay?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const y = useSharedValue(18);
  const opacity = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 170 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 420 }));
  }, [delay, opacity, y]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: y.value }] }));
  return <Animated.View style={[animated, style]}>{children}</Animated.View>;
}

export function GlassCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { palette, scheme } = useTheme();
  return (
    <View
      style={[
        styles.glass,
        {
          backgroundColor: scheme === 'dark' ? 'rgba(42,35,32,0.78)' : 'rgba(255,255,255,0.78)',
          borderColor: scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.88)',
          shadowColor: palette.shadow,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function HeroCompanion({
  size,
  accessory,
  xp,
  float = true,
}: {
  size: number;
  accessory: AccessoryId | 'none';
  xp: number;
  float?: boolean;
}) {
  const { t } = useI18n();
  const { palette } = useTheme();
  const level = levelFromXp(xp);
  return (
    <View style={{ width: size, height: size + 18, alignItems: 'center' }}>
      <Companion size={size} accessory={accessory} float={float} hero breathing={false} />
      <View
        style={[
          styles.levelPill,
          { backgroundColor: palette.accent, shadowColor: palette.shadow, bottom: 2 },
        ]}>
        <Txt size={12} weight="extra" color={palette.accentInk}>
          {t('levelShort', { level })}
        </Txt>
      </View>
    </View>
  );
}

export function FocusRing({
  progress,
  size = 86,
  label,
  detail,
}: {
  progress: number;
  size?: number;
  label: string;
  detail: string;
}) {
  const { palette } = useTheme();
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={palette.ring} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={palette.accent}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - clamped)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Txt size={16} weight="extra" center>
        {label}
      </Txt>
      <Txt size={10} color={palette.muted} center>
        {detail}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute', borderRadius: 999, overflow: 'hidden' },
  fill: { flex: 1 },
  glass: {
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  levelPill: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
});
