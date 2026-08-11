import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { haptics } from '../lib/haptics';
import { CARD_GAP, ParallaxCard } from './ParallaxCard';
import type { OriginRect } from '../store/usePlayerStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { MediaItem } from '../types/content';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<MediaItem>);

interface ContentRowProps {
  title: string;
  items: MediaItem[];
  cardWidth?: number;
  cardHeight?: number;
  onPressItem: (item: MediaItem, originRect: OriginRect) => void;
  onSeeAll?: () => void;
  /** Shows duration/LIVE badges on each card — pass for video & movie rows. */
  showMeta?: boolean;
}

/**
 * A horizontal, edge-to-edge row of cards (no outer padding, so the first
 * and last cards bleed to the screen edges) with per-card parallax. Rows sit
 * back-to-back with a tight negative offset so there's no hard boundary
 * between sections, Netflix-row style.
 */
export function ContentRow({
  title,
  items,
  cardWidth = 132,
  cardHeight = 132,
  onPressItem,
  onSeeAll,
  showMeta = false,
}: ContentRowProps) {
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable
          style={styles.seeAll}
          onPress={() => {
            haptics.tap();
            onSeeAll?.();
          }}
          hitSlop={8}
        >
          <Text style={styles.seeAllLabel}>See all</Text>
          <Text style={styles.seeAllArrow}>→</Text>
        </Pressable>
      </View>
      <AnimatedFlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item: MediaItem) => item.id}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }: { item: MediaItem; index: number }) => (
          <ParallaxCard
            item={item}
            index={index}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            scrollX={scrollX}
            onPress={onPressItem}
            showMeta={showMeta}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: -14,
    paddingTop: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.text,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.gold,
  },
  seeAllArrow: {
    fontSize: 12,
    color: colors.gold,
  },
  list: {
    paddingHorizontal: 16,
    gap: CARD_GAP,
  },
});
