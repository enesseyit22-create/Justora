import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { font, type Palette } from '@/src/theme/themes';
import { useTheme } from '@/src/theme/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Screen({
  children,
  scroll = false,
  grow = false,
  footer,
  background,
}: {
  children: ReactNode;
  scroll?: boolean;
  grow?: boolean;
  footer?: ReactNode;
  background?: ReactNode;
}) {
  const { palette } = useTheme();
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
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg }]} edges={['top', 'left', 'right']}>
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
}: {
  children: ReactNode;
  size?: number;
  weight?: 'body' | 'bold' | 'extra';
  color?: string;
  style?: StyleProp<ViewStyle> | object;
  center?: boolean;
}) {
  const { palette, fontsReady } = useTheme();
  const family = fontsReady ? (weight === 'extra' ? font.extra : weight === 'bold' ? font.bold : font.body) : undefined;
  return (
    <Text
      style={[
        {
          color: color ?? palette.ink,
          fontSize: size,
          lineHeight: Math.round(size * 1.35),
          fontFamily: family,
          textAlign: center ? 'center' : 'left',
        },
        style as object,
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
    <Press
      label={title}
      disabled={disabled}
      onPress={onPress}
      style={[styles.primary, { backgroundColor: palette.cta, shadowColor: palette.cta }]}>
      <Txt size={18} weight="extra" color={palette.ctaInk} center>
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
  primary: {
    minHeight: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
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
