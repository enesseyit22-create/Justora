import { Image, Text, VStack } from '@expo/ui/swift-ui';
import { font, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity } from 'expo-widgets';

import type { FocusProps } from '@/widgets/FocusWidget';

const FocusActivity = (props: FocusProps) => {
  'widget';
  return {
    banner: (
      <VStack modifiers={[padding({ all: 12 })]}>
        <Text modifiers={[font({ weight: 'bold', design: 'rounded', size: 16 })]}>{props.title}</Text>
        <Text modifiers={[font({ weight: 'bold', design: 'rounded', size: 28 })]}>{props.minutes}</Text>
        <Text modifiers={[font({ size: 13 })]}>{props.detail}</Text>
      </VStack>
    ),
    compactLeading: <Image systemName="timer" color="#E7A08A" />,
    compactTrailing: (
      <Text modifiers={[font({ weight: 'bold', design: 'rounded', size: 16 })]}>{props.minutes}</Text>
    ),
    minimal: <Image systemName="timer" color="#E7A08A" />,
    expandedLeading: (
      <VStack modifiers={[padding({ all: 8 })]}>
        <Image systemName="timer" color="#E7A08A" />
      </VStack>
    ),
    expandedTrailing: (
      <VStack modifiers={[padding({ all: 8 })]}>
        <Text modifiers={[font({ weight: 'bold', design: 'rounded', size: 22 })]}>{props.minutes}</Text>
      </VStack>
    ),
    expandedBottom: (
      <VStack modifiers={[padding({ horizontal: 12, bottom: 10 })]}>
        <Text>{props.detail}</Text>
      </VStack>
    ),
  };
};

export default createLiveActivity('FocusActivity', FocusActivity);
