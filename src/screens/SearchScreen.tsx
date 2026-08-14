import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import { MediaRow } from '../components/MediaRow';
import { useContentBottomPadding } from '../hooks/useContentBottomPadding';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useHideOnScroll } from '../hooks/useHideOnScroll';
import { useSearchMediaItems } from '../hooks/useMediaItems';
import type { RootStackParamList } from '../navigation/types';
import { usePlayerStore, type OriginRect } from '../store/usePlayerStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { MediaItem } from '../types/content';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<MediaItem>);

export function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const playQueue = usePlayerStore((state) => state.playQueue);
  const scrollHandler = useHideOnScroll();
  const bottomPadding = useContentBottomPadding();
  const [query, setQuery] = useState('');
  // Debounced so fast typing doesn't fire a request per keystroke — kinder
  // to slow/expensive mobile connections.
  const debouncedQuery = useDebouncedValue(query, 300);
  const { data: results = [], isLoading, isError } = useSearchMediaItems(debouncedQuery);

  const handlePress = (item: MediaItem, originRect: OriginRect) => {
    const index = results.findIndex((candidate) => candidate.id === item.id);
    playQueue(results, index === -1 ? 0 : index, originRect);
    navigation.navigate('Player');
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
    marginBottom: 16,
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
