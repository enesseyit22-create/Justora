import { ProgressView, Text, VStack } from '@expo/ui/swift-ui';
import {
  containerBackground,
  font,
  foregroundStyle,
  padding,
  progressViewStyle,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import { PlatformColor } from 'react-native';

export type FocusProps = {
  title: string;
  minutes: string;
  detail: string;
  fraction: number;
};

const FocusWidget = (props: FocusProps, environment: WidgetEnvironment) => {
  'widget';
  const compact =
    environment.widgetFamily === 'systemSmall' || environment.widgetFamily === 'accessoryRectangular';
  return (
    <VStack
      modifiers={[
        containerBackground(PlatformColor('systemBackground'), 'widget'),
        padding({ all: compact ? 8 : 12 }),
      ]}>
      <Text modifiers={[font({ weight: 'bold', design: 'rounded', size: compact ? 13 : 15 })]}>{props.title}</Text>
      <Text modifiers={[font({ weight: 'bold', design: 'rounded', size: compact ? 28 : 34 })]}>{props.minutes}</Text>
      {compact ? null : (
        <Text modifiers={[font({ size: 12 }), foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
          {props.detail}
        </Text>
      )}
      <ProgressView
        value={Math.max(0, Math.min(1, props.fraction))}
        modifiers={[progressViewStyle('linear'), tint('#E7A08A')]}
      />
    </VStack>
  );
};

export default createWidget('FocusWidget', FocusWidget, {
  title: 'Justora',
  minutes: '2',
  detail: 'Just start',
  fraction: 1,
});
