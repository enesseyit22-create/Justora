import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { Platform, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/src/i18n/useI18n';
import { useTheme } from '@/src/theme/theme';
import { font } from '@/src/theme/themes';

const TAB_BODY = 62;

export default function TabLayout() {
  const { palette, fontsReady } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.cta,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: palette.card,
          borderTopWidth: 0,
          height: TAB_BODY + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          paddingHorizontal: 8,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: palette.shadow,
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -6 },
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontFamily: fontsReady ? font.bold : undefined,
          fontSize: 11,
          marginTop: 2,
        },
        tabBarItemStyle: { borderRadius: 16, marginHorizontal: 2, paddingVertical: 4 },
        tabBarButton: ({ children, onPress, onLongPress, accessibilityState, accessibilityLabel, style }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={accessibilityState}
            accessibilityLabel={accessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress ?? undefined}
            style={[style, styles.item, accessibilityState?.selected ? { backgroundColor: palette.sageSoft } : null]}>
            {children}
          </Pressable>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('today'),
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'book.closed', android: 'menu_book', web: 'menu_book' }} tintColor={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: t('timer'),
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'timer', android: 'timer', web: 'timer' }} tintColor={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('progress'),
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'trophy', android: 'emoji_events', web: 'emoji_events' }} tintColor={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t('stats'),
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' }} tintColor={color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  item: {
    borderRadius: 16,
    marginHorizontal: 4,
    marginTop: Platform.OS === 'ios' ? 0 : 2,
  },
});
