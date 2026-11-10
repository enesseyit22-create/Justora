import { useEffect } from 'react';
import { Modal, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { CollectibleCard } from '@/src/components/CollectibleCard';
import { Press, PrimaryButton, Txt } from '@/src/components/ui';
import { CARD_BY_ID } from '@/src/domain/rewards';
import { useI18n } from '@/src/i18n/useI18n';
import { haptic } from '@/src/services/haptics';
import { actions, useApp } from '@/src/store/store';
import { useTheme } from '@/src/theme/theme';

export function RewardHost() {
  const { rewardQueue, rewards, settings } = useApp();
  const current = rewardQueue[0] ?? null;
  const { t } = useI18n();
  const { palette } = useTheme();
  const scale = useSharedValue(0.7);
  const burst = useSharedValue(0);

  useEffect(() => {
    if (!current) return;
    scale.value = 0.7;
    scale.value = withSpring(1, { damping: 12, stiffness: 180 });
    burst.value = 0;
    burst.value = withSequence(withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }), withDelay(200, withTiming(0, { duration: 600 })));
    if (settings.haptics && (current.kind === 'level-up' || current.kind === 'card' || current.kind === 'chest')) {
      void haptic('success');
    }
    if (current.kind === 'card') actions.revealCard(current.cardId);
  }, [current, burst, scale, settings.haptics]);

  const pop = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const spark = useAnimatedStyle(() => ({ opacity: burst.value, transform: [{ scale: 0.8 + burst.value * 0.6 }] }));

  if (!current) return null;

  const close = () => actions.dismissReward();
  let title = '';
  let body = '';
  if (current.kind === 'level-up') {
    title = t('levelUpTitle', { level: current.level });
    body = t('levelUpBody');
  } else if (current.kind === 'card') {
    const def = CARD_BY_ID[current.cardId];
    title = t('cardNew');
    body = t(def.bodyKey);
  } else if (current.kind === 'chest') {
    title = t('weeklyChestReady');
    body = t('weeklyChestClaim', { count: current.xp });
  } else if (current.kind === 'freeze-earned') {
    title = t('streakFreezeEarned');
    body = t('streakFreezeHint', { max: 2 });
  } else if (current.kind === 'freeze-used') {
    title = t('streakFreezeUsed');
    body = t('streakFreezeHint', { max: 2 });
  } else {
    title = t('questComplete', { count: current.xp });
    body = t('quests');
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: 'rgba(28,23,20,0.46)', justifyContent: 'center', padding: 24 }}>
        <Animated.View style={[{ backgroundColor: palette.bg, borderRadius: 28, padding: 22, gap: 12, overflow: 'hidden' }, pop]}>
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: -30,
                alignSelf: 'center',
                width: 180,
                height: 180,
                borderRadius: 90,
                backgroundColor: palette.accent,
              },
              spark,
            ]}
          />
          <Txt weight="extra" size={28} center>
            {title}
          </Txt>
          <Txt color={palette.muted} center>
            {body}
          </Txt>
          {current.kind === 'card' ? (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <CollectibleCard id={current.cardId} owned revealed flipping width={168} />
            </View>
          ) : null}
          {current.kind === 'level-up' ? (
            <Txt center weight="bold">
              {t('levelShort', { level: current.level })} · {rewards.xp} {t('xp')}
            </Txt>
          ) : null}
          <PrimaryButton title={current.kind === 'card' ? t('cardReveal') : t('continue')} onPress={close} />
          <Press onPress={close}>
            <Txt center color={palette.muted}>
              {t('close')}
            </Txt>
          </Press>
        </Animated.View>
      </View>
    </Modal>
  );
}
