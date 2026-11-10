import { Link } from 'expo-router';

import { Screen, Txt } from '@/src/components/ui';

export default function NotFound() {
  return (
    <Screen>
      <Txt size={28} weight="extra">
        Justora
      </Txt>
      <Link href="/(tabs)">
        <Txt>Today</Txt>
      </Link>
    </Screen>
  );
}
