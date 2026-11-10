import { router } from 'expo-router';
import { useWindowDimensions, View } from 'react-native';

import { CollectibleCard } from '@/src/components/CollectibleCard';
import { Press, Screen, Txt } from '@/src/components/ui';
import { XpBar } from '@/src/components/XpBar';
import { CARDS, canEarnCard } from '@/src/domain/rewards';
import { useI18n } from '@/src/i18n/useI18n';
import { useApp, useIsPro } from '@/src/store/store';
import { useTheme } from '@/src/theme/theme';

export default function CollectionScreen() {
  const { rewards } = useApp();
  const pro = useIsPro();
  const { t } = useI18n();
  const { palette } = useTheme();
  const { width } = useWindowDimensions();
  const owned = new Set(rewards.earnedCardIds);
  const revealed = new Set(rewards.revealedCardIds);
  const visible = CARDS.filter((card) => !card.proOnly || pro || owned.has(card.id));
  const total = CARDS.filter((card) => canEarnCard(card.id, pro) || owned.has(card.id)).length;
  const gap = 12;
  const columns = width >= 900 ? 4 : width >= 640 ? 3 : 2;
  const contentWidth = Math.max(0, width - 40);
  const cardWidth = Math.floor((contentWidth - gap * (columns - 1)) / columns);

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt size={32} weight="extra">
          {t('collection')}
        </Txt>
        <Press onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/stats'))} label={t('close')}>
          <Txt size={22}>×</Txt>
        </Press>
      </View>
      <Txt color={palette.muted}>{t('collectionSubtitle')}</Txt>
      <XpBar xp={rewards.xp} />
      <Txt color={palette.muted}>{t('cardsOwned', { owned: owned.size, total })}</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, justifyContent: 'flex-start' }}>
        {visible.map((card) => (
          <Press
            key={card.id}
            onPress={() => {
              if (card.proOnly && !owned.has(card.id) && !pro) router.push('/paywall');
            }}
            style={{ width: cardWidth }}>
            <CollectibleCard
              id={card.id}
              owned={owned.has(card.id)}
              revealed={revealed.has(card.id)}
              lockedReason={owned.has(card.id) ? undefined : card.proOnly && !pro ? 'pro' : 'locked'}
              width={cardWidth}
            />
          </Press>
        ))}
      </View>
    </Screen>
  );
}
