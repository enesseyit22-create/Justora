import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_500Medium } from '@expo-google-fonts/nunito/500Medium';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { RewardHost } from '@/src/components/RewardHost';
import { UpdateBanner } from '@/src/components/UpdateBanner';
import { SoundHost } from '@/src/services/audio';
import { UpdateProvider } from '@/src/services/updates';
import { StoreProvider, useApp } from '@/src/store/store';
import { ThemeBridge, useTheme } from '@/src/theme/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <StoreProvider>
      <Boot />
    </StoreProvider>
  );
}

function Boot() {
  const ready = useApp().ready;
  const [fontsReady, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  useEffect(() => {
    if ((fontsReady || fontError) && ready) void SplashScreen.hideAsync();
  }, [fontsReady, fontError, ready]);
  if ((!fontsReady && !fontError) || !ready) return null;
  return (
    <ThemeBridge fontsReady={!!fontsReady}>
      <UpdateProvider>
        <SoundHost />
        <Nav />
        <RewardHost />
        <UpdateBanner />
      </UpdateProvider>
    </ThemeBridge>
  );
}

function Nav() {
  const { palette, scheme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.bg },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        <Stack.Screen name="collection" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="privacy" options={{ presentation: 'modal' }} />
        <Stack.Screen name="terms" options={{ presentation: 'modal' }} />
      </Stack>
    </View>
  );
}
