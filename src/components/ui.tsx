import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { font, type Palette } from '@/src/theme/themes';
import { useTheme } from '@/src/theme/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Screen({
  children,
  scroll = false,
  grow = false,
  bottomInset = true,
  footer,
  background,
}: {
  children: ReactNode;
  scroll?: boolean;
  grow?: boolean;
  /** Pad the bottom for the system navigation bar. Turn off on tab screens; the tab bar already includes that inset. */
  bottomInset?: boolean;
  footer?: ReactNode;
  background?: ReactNode;
}) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const bottom = bottomInset ? insets.bottom : 0;
  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scroll, grow && styles.grow]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={styles.fill}>{children}</View>
  );
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg, paddingBottom: bottom }]} edges={['top', 'left', 'right']}>
      {background ? <View pointerEvents="none" style={StyleSheet.absoluteFill}>{background}</View> : null}
      {body}
      {footer}
    </SafeAreaView>
  );
}

export function Txt({
  children,
  size = 16,
  weight = 'body',
  color,
  style,
  center,
  lines,
}: {
  children: ReactNode;
  size?: number;
  weight?: 'regular' | 'body' | 'bold' | 'extra';
  color?: string;
  style?: StyleProp<TextStyle>;
  center?: boolean;
  lines?: number;
}) {
  const { palette, fontsReady } = useTheme();
  const family = !fontsReady
    ? undefined
    : weight === 'extra'
      ? font.extra
      : weight === 'bold'
        ? font.bold
        : weight === 'regular'
          ? font.regular
          : font.body;
  const title = size >= 28;
  return (
    <Text
      numberOfLines={lines}
      style={[
        {
          color: color ?? palette.ink,
          fontSize: size,
          lineHeight: Math.round(size * (title ? 1.15 : 1.35)),
          fontFamily: family,
          textAlign: center ? 'center' : 'left',
        },
        style,
      ]}>
      {children}
    </Text>
  );
}

export function Press({
  children,
  onPress,
  onLongPress,
  disabled,
  style,
  label,
}: {
  children?: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 90 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 140 });
      }}
      style={[animated, disabled && { opacity: 0.45 }, style]}>
      {children}
    </AnimatedPressable>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const { palette } = useTheme();
  return (
    <Press label={title} disabled={disabled} onPress={onPress} style={[styles.primaryShadow, { shadowColor: palette.cta }]}>
      <LinearGradient
        colors={[palette.cta, palette.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primary}>
        <Txt size={18} weight="extra" color={palette.ctaInk} center>
          {title}
        </Txt>
      </LinearGradient>
    </Press>
  );
}

export function SecondaryButton({ title, onPress, disabled }: { title: string; onPress?: () => void; disabled?: boolean }) {
  const { palette } = useTheme();
  return (
    <Press
      label={title}
      disabled={disabled}
      onPress={onPress}
      style={[styles.secondary, { backgroundColor: palette.card, borderColor: palette.line, shadowColor: palette.shadow }]}>
      <Txt size={16} weight="bold" center lines={2}>
        {title}
      </Txt>
    </Press>
  );
}

export function GhostButton({ title, onPress }: { title: string; onPress?: () => void }) {
  const { palette } = useTheme();
  return (
    <Press label={title} onPress={onPress} style={styles.ghost}>
      <Txt size={16} weight="bold" color={palette.accent} center lines={2}>
        {title}
      </Txt>
    </Press>
  );
}

export function Chip({
  title,
  onPress,
  selected,
}: {
  title: string;
  onPress?: () => void;
  selected?: boolean;
}) {
  const { palette } = useTheme();
  return (
    <Press
      label={title}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? palette.sageSoft : palette.card,
          borderColor: selected ? palette.sage : palette.line,
        },
      ]}>
      <Txt size={14} weight="bold" color={selected ? palette.sage : palette.ink} lines={1}>
        {title}
      </Txt>
    </Press>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { palette } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: palette.card, shadowColor: palette.shadow }, style]}>{children}</View>
  );
}

export function Field({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  const { palette, fontsReady } = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={palette.muted}
      style={[
        styles.field,
        {
          color: palette.ink,
          backgroundColor: palette.card,
          fontFamily: fontsReady ? font.bold : undefined,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  fill: { flex: 1, paddingHorizontal: 20 },
  scroll: { paddingHorizontal: 20, paddingBottom: 28, gap: 14 },
  grow: { flexGrow: 1, justifyContent: 'space-evenly' },
  primaryShadow: {
    borderRadius: 29,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  primary: {
    minHeight: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondary: {
    minHeight: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  ghost: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  chip: {
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  field: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});

export function usePalette(): Palette {
  return useTheme().palette;
}
