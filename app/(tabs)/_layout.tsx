import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

import { useI18n } from '@/src/i18n/useI18n';
import { useTheme } from '@/src/theme/theme';
import { font } from '@/src/theme/themes';

export default function TabLayout() {
  const { palette, fontsReady } = useTheme();
  const { t } = useI18n();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: palette.bg,
          borderTopColor: palette.line,
          height: 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: fontsReady ? font.bold : undefined, fontSize: 11 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('today'),
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'book.closed', android: 'menu_book', web: 'menu_book' }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: t('timer'),
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'timer', android: 'timer', web: 'timer' }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('progress'),
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'trophy', android: 'emoji_events', web: 'emoji_events' }} tintColor={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t('stats'),
          tabBarIcon: ({ color }) => (
            <SymbolView name={{ ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' }} tintColor={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
