import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '../../lib/haptics';
import { ShortsCard } from './ShortsCard';
import type { OriginRect } from '../../store/usePlayerStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import type { MediaItem } from '../../types/content';

const SHORTS_GAP = 8;
const ROW_PADDING = 16;
// Fixed portrait 9:16 size — ~120 wide fits 3 fully visible in the row with
// a peek of a 4th on most phone widths.
const CARD_WIDTH = 120;
const CARD_HEIGHT = Math.round(CARD_WIDTH * (16 / 9)); // ≈213

interface ShortsRowProps {
  title: string;
  items: MediaItem[];
  onPressItem: (item: MediaItem, originRect: OriginRect) => void;
}

/**
 * The Shorts row on the Watch home screen — visually distinct from
 * ContentRow: smaller portrait cards instead of landscape/square ones, no
 * per-card parallax. Kept as its own component (rather than a prop on
 * ContentRow) since the card shape, not just its size, is different.
 */
export function ShortsRow({ title, items, onPressItem }: ShortsRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable style={styles.seeAll} onPress={() => haptics.tap()} hitSlop={8}>
          <Text style={styles.seeAllLabel}>See all</Text>
          <Text style={styles.seeAllArrow}>→</Text>
        </Pressable>
      </View>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ShortsCard item={item} cardWidth={CARD_WIDTH} cardHeight={CARD_HEIGHT} onPress={onPressItem} />
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
    paddingHorizontal: ROW_PADDING,
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
    paddingHorizontal: ROW_PADDING,
    gap: SHORTS_GAP,
  },
});
