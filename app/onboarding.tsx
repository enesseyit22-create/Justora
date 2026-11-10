import { router } from 'expo-router';

import { Guide } from '@/src/components/Guide';
import { actions } from '@/src/store/store';

function enterApp() {
  actions.markAha();
  router.replace('/(tabs)');
}

export default function OnboardingScreen() {
  return <Guide onDone={enterApp} onSkip={enterApp} />;
}
