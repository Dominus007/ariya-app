import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import { MediaRow } from '../components/MediaRow';
import { haptics } from '../lib/haptics';
import { useContentBottomPadding } from '../hooks/useContentBottomPadding';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useHideOnScroll } from '../hooks/useHideOnScroll';
import { useSearchMediaItems } from '../hooks/useMediaItems';
import type { RootStackParamList } from '../navigation/types';
import type { SearchFilter } from '../services/mediaItems';
import { usePlayerStore, type OriginRect } from '../store/usePlayerStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { MediaItem } from '../types/content';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<MediaItem>);

const FILTERS: { key: SearchFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'music', label: 'Music' },
  { key: 'videos', label: 'Videos' },
  { key: 'podcasts', label: 'Podcasts' },
  { key: 'sports', label: 'Sports' },
  { key: 'shorts', label: 'Shorts ⚡' },
];

export function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const playQueue = usePlayerStore((state) => state.playQueue);
  const scrollHandler = useHideOnScroll();
  const bottomPadding = useContentBottomPadding();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('all');
  // Debounced so fast typing doesn't fire a request per keystroke — kinder
  // to slow/expensive mobile connections.
  const debouncedQuery = useDebouncedValue(query, 300);
  const { data: results = [], isLoading, isError } = useSearchMediaItems(debouncedQuery, filter);

  const handlePress = (item: MediaItem, originRect: OriginRect) => {
    const index = results.findIndex((candidate) => candidate.id === item.id);
    playQueue(results, index === -1 ? 0 : index, originRect);
    // Shorts can surface even under "All"/"Videos" — route those to the
    // dedicated vertical player instead of the regular landscape sheet.
    const isShort = item.kind === 'video' && item.category === 'shorts';
    navigation.navigate(isShort ? 'ShortsPlayer' : 'Player');
  };

  const handleSelectFilter = (next: SearchFilter) => {
    haptics.tap();
    setFilter(next);
  };

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        data={results}
        keyExtractor={(item: MediaItem) => item.id}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 76, paddingBottom: bottomPadding }]}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <Text style={styles.heading}>Search</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Songs, podcasts, videos, live sport..."
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            <FlatList
              data={FILTERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.key}
              contentContainerStyle={styles.filterList}
              renderItem={({ item }) => {
                const active = item.key === filter;
                return (
                  <Pressable
                    onPress={() => handleSelectFilter(item.key)}
                    style={[styles.filterPill, active && styles.filterPillActive]}
                  >
                    <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{item.label}</Text>
                  </Pressable>
                );
              }}
            />
          </View>
        }
        renderItem={({ item, index }: { item: MediaItem; index: number }) => (
          <MediaRow item={item} index={index} onPress={handlePress} />
        )}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.gold} style={styles.spinner} />
          ) : (
            <Text style={styles.emptyText}>
              {isError
                ? "Couldn't search right now — check your connection."
                : query
                  ? `No results for "${query}"`
                  : 'Nothing in the catalog yet — check back soon.'}
            </Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBlock: {
    marginBottom: 4,
  },
  heading: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 28,
    color: colors.text,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    marginBottom: 14,
  },
  filterList: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  filterLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterLabelActive: {
    color: colors.background,
    fontFamily: fonts.bodySemiBold,
  },
  list: {
    paddingHorizontal: 20,
  },
  spinner: {
    marginTop: 24,
  },
  emptyText: {
    fontFamily: fonts.bodyRegular,
    color: colors.textMuted,
    marginTop: 24,
    textAlign: 'center',
  },
});
