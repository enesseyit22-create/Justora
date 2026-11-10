import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Companion } from '@/src/components/Companion';
import { Txt } from '@/src/components/ui';
import type { AccessoryId } from '@/src/domain/types';
import { useTheme } from '@/src/theme/theme';

function wedgePath(cx: number, cy: number, r: number, fraction: number) {
  const frac = Math.min(1, Math.max(0, fraction));
  if (frac <= 0.001) return '';
  if (frac >= 0.999) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
  }
  const start = -Math.PI / 2 + (1 - frac) * Math.PI * 2;
  const end = -Math.PI / 2 + Math.PI * 2;
  const large = frac > 0.5 ? 1 : 0;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

export function TimerDisc({
  fraction,
  time,
  caption,
  size,
  breathing,
  accessory,
  breakMode,
}: {
  fraction: number;
  time: string;
  caption: string;
  size: number;
  breathing?: boolean;
  accessory?: AccessoryId | 'none';
  breakMode?: boolean;
}) {
  const { palette } = useTheme();
  const ring = Math.max(16, size * 0.07);
  const inner = size - ring * 2;
  const fill = breakMode ? palette.break : palette.wedge;
  return (
    <View style={{ width: size, height: size + 24, alignSelf: 'center' }}>
      <View
        style={[
          styles.disc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: palette.ring,
            shadowColor: palette.shadow,
          },
        ]}>
        <View
          style={{
            width: inner,
            height: inner,
            borderRadius: inner / 2,
            overflow: 'hidden',
            backgroundColor: palette.wedgeTrack,
          }}>
          <Svg width={inner} height={inner}>
            <Path d={wedgePath(inner / 2, inner / 2, inner / 2, fraction)} fill={fill} />
          </Svg>
          <View style={styles.center} pointerEvents="none">
            <Txt size={Math.round(size * 0.16)} weight="extra" center>
              {time}
            </Txt>
            <Txt size={15} color={palette.muted} center>
              {caption}
            </Txt>
          </View>
        </View>
      </View>
      <View style={[styles.buddy, { right: size * 0.02, bottom: 0 }]}>
        <Companion size={size * 0.38} breathing={breathing} accessory={accessory} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  buddy: { position: 'absolute' },
});
