import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { CardArt } from '@/src/components/CompanionArt';
import { Txt } from '@/src/components/ui';
import { CARD_BY_ID, cardUnlock } from '@/src/domain/rewards';
import type { CardId, CardRarity } from '@/src/domain/types';
import type { Key } from '@/src/i18n';
import { useI18n } from '@/src/i18n/useI18n';
import { useTheme } from '@/src/theme/theme';

const RARITY_TINT: Record<CardRarity, string> = {
  common: '#8D8178',
  rare: '#5E8F86',
  epic: '#8E86A8',
  legendary: '#C9A44A',
};

export function unlockLine(id: CardId, t: (key: Key, vars?: Record<string, string | number>) => string): string {
  const hint = cardUnlock(id);
  return hint.count == null ? t(hint.key) : t(hint.key, { count: hint.count });
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
    if (!owned) return;
    if (flipping || revealed) spin.value = withTiming(0, { duration: 700 });
    else spin.value = 180;
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
    def.rarity === 'common' ? 'rarityCommon' : def.rarity === 'rare' ? 'rarityRare' : def.rarity === 'epic' ? 'rarityEpic' : 'rarityLegendary'
  ) as Key;

  if (!owned) {
    return (
      <View
        style={{
          width,
          height,
          borderRadius: 22,
          backgroundColor: palette.card,
          borderWidth: 2,
          borderColor: palette.muted,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 8,
          overflow: 'hidden',
        }}>
        <CardArt id={id} colors={def.colors} width={Math.round(width * 0.72)} framed={false} />
        <View style={{ alignSelf: 'stretch', gap: 2, backgroundColor: palette.bg, borderRadius: 12, paddingVertical: 6, paddingHorizontal: 6 }}>
          <Txt size={12} weight="bold" center>
            {lockedReason === 'pro' ? t('cardProLocked') : t('cardLocked')}
          </Txt>
          <Txt size={12} color={palette.muted} center>
            {unlockLine(id, t)}
          </Txt>
        </View>
      </View>
    );
  }

  return (
    <View style={{ width, height, borderRadius: 22 }}>
      <Animated.View style={[{ position: 'absolute', inset: 0, borderRadius: 22, overflow: 'hidden', alignItems: 'center' }, front]}>
        <View style={{ borderWidth: 2, borderColor: RARITY_TINT[def.rarity], borderRadius: 22, overflow: 'hidden', backgroundColor: def.colors[2] }}>
          <CardArt id={id} colors={def.colors} width={width} />
          <View style={{ position: 'absolute', left: 10, right: 10, bottom: 10, gap: 2 }}>
            <Txt size={12} weight="bold" color="#2C2825">
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
          <Txt size={13} weight="bold" center>
            {t('cardNew')}
          </Txt>
          <Txt size={12} color={palette.muted} center>
            {t('cardReveal')}
          </Txt>
        </View>
      </Animated.View>
    </View>
  );
}
