import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated from 'react-native-reanimated';

import { MediaRow } from '../components/MediaRow';
import { useHideOnScroll } from '../hooks/useHideOnScroll';
import { useSavedItems } from '../hooks/useLibrary';
import type { RootStackParamList } from '../navigation/types';
import { usePlayerStore, type OriginRect } from '../store/usePlayerStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { MediaItem } from '../types/content';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<MediaItem>);

export function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { data: savedItems = [], isLoading, isError } = useSavedItems();
  const playQueue = usePlayerStore((state) => state.playQueue);
  const scrollHandler = useHideOnScroll();

  const handlePress = (item: MediaItem, originRect: OriginRect) => {
    const index = savedItems.findIndex((candidate) => candidate.id === item.id);
    playQueue(savedItems, index === -1 ? 0 : index, originRect);
    navigation.navigate('Player');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        data={savedItems}
        keyExtractor={(item: MediaItem) => item.id}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 76 }]}
        ListHeaderComponent={<Text style={styles.heading}>Your Library</Text>}
        renderItem={({ item, index }: { item: MediaItem; index: number }) => (
          <MediaRow item={item} index={index} onPress={handlePress} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isError
              ? "Couldn't load your library — check your connection and try again."
              : 'Nothing saved yet. Tap the heart on a track, podcast, or video to see it here.'}
          </Text>
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 28,
    color: colors.text,
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 220,
  },
  emptyText: {
    fontFamily: fonts.bodyRegular,
    color: colors.textMuted,
    marginTop: 24,
    textAlign: 'center',
  },
});
