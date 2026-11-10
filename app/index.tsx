import { Redirect } from 'expo-router';

import { useApp } from '@/src/store/store';

export default function Index() {
  const { settings } = useApp();
  if (!settings.onboardingDone) return <Redirect href="/onboarding" />;
  if (!settings.ahaStarted) return <Redirect href="/(tabs)/timer?aha=1" />;
  return <Redirect href="/(tabs)" />;
}
