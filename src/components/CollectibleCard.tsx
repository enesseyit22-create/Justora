import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { Txt } from '@/src/components/ui';
import { CARD_BY_ID, type CardDef, type CardMotif } from '@/src/domain/rewards';
import type { CardId, CardRarity } from '@/src/domain/types';
import { useI18n } from '@/src/i18n/useI18n';
import type { Key } from '@/src/i18n';
import { useTheme } from '@/src/theme/theme';

const RARITY_TINT: Record<CardRarity, string> = {
  common: '#8D8178',
  rare: '#5E8F86',
  epic: '#8E86A8',
  legendary: '#C9A44A',
};

function Motif({ motif, colors }: { motif: CardMotif; colors: [string, string, string] }) {
  const [a, b, c] = colors;
  switch (motif) {
    case 'wedge':
      return <Path d="M60 22 L108 118 L12 118 Z" fill={b} opacity={0.95} />;
    case 'companion':
      return (
        <>
          <Ellipse cx="60" cy="78" rx="28" ry="32" fill={c} />
          <Circle cx="60" cy="52" r="22" fill={b} />
          <Circle cx="52" cy="50" r="3" fill="#2C2825" />
          <Circle cx="68" cy="50" r="3" fill="#2C2825" />
        </>
      );
    case 'leaf':
      return <Path d="M60 20 C90 40 96 80 60 118 C24 80 30 40 60 20 Z" fill={b} />;
    case 'star':
      return <Path d="M60 22 L70 50 L100 52 L76 72 L84 102 L60 86 L36 102 L44 72 L20 52 L50 50 Z" fill={b} />;
    case 'rain':
      return (
        <>
          <Circle cx="40" cy="40" r="8" fill={b} opacity={0.8} />
          <Circle cx="70" cy="34" r="10" fill={c} />
          <Path d="M44 58 C44 72 36 80 36 88 C36 96 44 100 44 88 C44 80 52 72 52 58 Z" fill={b} />
          <Path d="M76 62 C76 78 68 88 68 96 C68 104 76 108 76 96 C76 88 84 78 84 62 Z" fill={b} />
        </>
      );
    case 'orbit':
      return (
        <>
          <Circle cx="60" cy="70" r="28" fill="none" stroke={c} strokeWidth={3} />
          <Circle cx="60" cy="70" r="16" fill={b} />
          <Circle cx="86" cy="52" r="6" fill={c} />
        </>
      );
    case 'flame':
      return <Path d="M60 22 C78 50 88 62 88 82 C88 102 76 114 60 114 C44 114 32 102 32 82 C32 62 48 48 60 22 Z" fill={b} />;
    default:
      return <Ellipse cx="60" cy="76" rx="32" ry="22" fill={b} />;
  }
}

export function CardArt({ def, size = 148 }: { def: CardDef; size?: number }) {
  const height = Math.round(size * 1.28);
  return (
    <Svg width={size} height={height} viewBox="0 0 120 154">
      <Defs>
        <LinearGradient id={`g-${def.id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={def.colors[0]} />
          <Stop offset="1" stopColor={def.colors[2]} />
        </LinearGradient>
      </Defs>
      <Rect x="4" y="4" width="112" height="146" rx="18" fill={`url(#g-${def.id})`} />
      <Rect x="10" y="10" width="100" height="134" rx="14" fill={def.colors[0]} opacity={0.28} />
      <Motif motif={def.motif} colors={def.colors} />
    </Svg>
  );
}

export function CollectibleCard({
  id,
  owned,
  revealed,
  lockedReason,
  flipping = false,
  width = 148,
}: {
  id: CardId;
  owned: boolean;
  revealed: boolean;
  lockedReason?: 'locked' | 'pro';
  flipping?: boolean;
  width?: number;
}) {
  const def = CARD_BY_ID[id];
  const { t } = useI18n();
  const { palette } = useTheme();
  const height = Math.round(width * 1.28);
  const spin = useSharedValue(owned && revealed && !flipping ? 0 : 180);
  useEffect(() => {
    if (flipping || (owned && revealed)) {
      spin.value = withTiming(0, { duration: 700 });
    } else {
      spin.value = 180;
    }
  }, [flipping, owned, revealed, spin]);
  const front = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${interpolate(spin.value, [0, 180], [0, 180])}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));
  const back = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${interpolate(spin.value, [0, 180], [180, 360])}deg` }],
    backfaceVisibility: 'hidden' as const,
  }));
  const rarityKey = (
    def.rarity === 'common'
      ? 'rarityCommon'
      : def.rarity === 'rare'
        ? 'rarityRare'
        : def.rarity === 'epic'
          ? 'rarityEpic'
          : 'rarityLegendary'
  ) as Key;
  return (
    <View style={{ width, height, borderRadius: 22 }}>
      <Animated.View style={[{ position: 'absolute', inset: 0, borderRadius: 22, overflow: 'hidden', alignItems: 'center' }, front]}>
        <View style={{ borderWidth: 2, borderColor: RARITY_TINT[def.rarity], borderRadius: 22, overflow: 'hidden', backgroundColor: def.colors[2] }}>
          <CardArt def={def} size={width} />
          <View style={{ position: 'absolute', left: 10, right: 10, bottom: 10, gap: 2 }}>
            <Txt size={12} weight="bold" color={def.rarity === 'legendary' ? '#FFF8F0' : palette.ink}>
              {t(def.nameKey)}
            </Txt>
            <Txt size={11} color={RARITY_TINT[def.rarity]}>
              {t(rarityKey)}
            </Txt>
          </View>
        </View>
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', inset: 0, borderRadius: 22, overflow: 'hidden' }, back]}>
        <View
          style={{
            flex: 1,
            borderRadius: 22,
            backgroundColor: palette.card,
            borderWidth: 2,
            borderColor: palette.line,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            gap: 8,
          }}>
          <View style={{ width: width * 0.42, height: width * 0.55, borderRadius: 16, backgroundColor: palette.ring }} />
          <Txt size={13} color={palette.muted} center>
            {lockedReason === 'pro' ? t('cardProLocked') : t('cardLocked')}
          </Txt>
        </View>
      </Animated.View>
    </View>
  );
}
