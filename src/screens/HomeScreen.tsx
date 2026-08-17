import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated from 'react-native-reanimated';

import { ContentRow } from '../components/ContentRow';
import { Hero } from '../components/Hero';
import { HeroSkeleton, SkeletonRow } from '../components/SkeletonRow';
import { ShortsRow } from '../components/shorts/ShortsRow';
import { useContentBottomPadding } from '../hooks/useContentBottomPadding';
import { useHideOnScroll } from '../hooks/useHideOnScroll';
import { useMediaItemsQuery } from '../hooks/useMediaItems';
import type { RootStackParamList } from '../navigation/types';
import { useModeStore } from '../store/useModeStore';
import { usePlayerStore, type OriginRect } from '../store/usePlayerStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { MediaItem } from '../types/content';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const VIDEO_CARD = { cardWidth: 220, cardHeight: 124 }; // ~16:9

type Row =
  | { type: 'content'; title: string; items: MediaItem[]; cardWidth: number; cardHeight: number; showMeta: boolean }
  | { type: 'shorts'; title: string; items: MediaItem[] };

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const mode = useModeStore((state) => state.mode);
  const playQueue = usePlayerStore((state) => state.playQueue);
  const scrollHandler = useHideOnScroll();
  const bottomPadding = useContentBottomPadding();

  const isListen = mode === 'listen';
  const isWatch = mode === 'watch';

  // All rows are queried unconditionally (Rules of Hooks — the count of
  // hooks can't change between renders) but only the ones for the current
  // mode are actually fetched (`enabled`), so switching modes doesn't also
  // fetch the other mode's rows over the network.
  const songs = useMediaItemsQuery('song', undefined, isListen);
  const podcasts = useMediaItemsQuery('podcast', undefined, isListen);
  const nollywood = useMediaItemsQuery('movie', 'nollywood', isWatch);
  const hollywood = useMediaItemsQuery('movie', 'hollywood', isWatch);
  const bollywood = useMediaItemsQuery('movie', 'bollywood', isWatch);
  const kdrama = useMediaItemsQuery('movie', 'kdrama', isWatch);
  const musicVideos = useMediaItemsQuery('video', undefined, isWatch);
  const shorts = useMediaItemsQuery('video', 'shorts', isWatch);
  const liveSport = useMediaItemsQuery('live-sport', undefined, isWatch);

  const rows: Row[] = isListen
    ? [
        {
          type: 'content',
          title: 'Made for you',
          items: songs.data ?? [],
          cardWidth: 132,
          cardHeight: 132,
          showMeta: false,
        },
        {
          type: 'content',
          title: 'Podcasts',
          items: podcasts.data ?? [],
          cardWidth: 132,
          cardHeight: 132,
          showMeta: false,
        },
      ]
    : [
        // Nollywood films lead — Watch mode is a movie platform first.
        { type: 'content', title: 'New Nollywood 🎬', items: nollywood.data ?? [], ...VIDEO_CARD, showMeta: true },
        { type: 'content', title: 'Hollywood 🎥', items: hollywood.data ?? [], ...VIDEO_CARD, showMeta: true },
        { type: 'content', title: 'Bollywood 🎭', items: bollywood.data ?? [], ...VIDEO_CARD, showMeta: true },
        { type: 'content', title: 'K-Drama & Asian 🎌', items: kdrama.data ?? [], ...VIDEO_CARD, showMeta: true },
        // Music videos are a secondary category — buried at position 5, not the top.
        { type: 'content', title: 'Music Videos 🎵', items: musicVideos.data ?? [], ...VIDEO_CARD, showMeta: true },
        // Shorts sit between Music Videos and Live Sports, rendered with a
        // different card shape entirely (portrait, see ShortsRow) — not a
        // ContentRow variant.
        { type: 'shorts', title: 'Shorts ⚡', items: shorts.data ?? [] },
        { type: 'content', title: 'Live Sports ⚽', items: liveSport.data ?? [], ...VIDEO_CARD, showMeta: true },
      ];

  const relevantQueries = isListen
    ? [songs, podcasts]
    : [nollywood, hollywood, bollywood, kdrama, musicVideos, shorts, liveSport];
  const isLoading = relevantQueries.some((query) => query.isLoading);
  const isError = relevantQueries.some((query) => query.isError);

  // Home features the first item of the lead row — the first song for
  // Listen mode, the first Nollywood film for Watch mode.
  const heroFeature = isListen ? songs.data?.[0] : nollywood.data?.[0];

  const handlePressItem = (rowItems: MediaItem[]) => (item: MediaItem, originRect: OriginRect) => {
    const index = rowItems.findIndex((candidate) => candidate.id === item.id);
    playQueue(rowItems, index === -1 ? 0 : index, originRect);
    navigation.navigate('Player');
  };

  const handlePressShort = (rowItems: MediaItem[]) => (item: MediaItem, originRect: OriginRect) => {
    const index = rowItems.findIndex((candidate) => candidate.id === item.id);
    playQueue(rowItems, index === -1 ? 0 : index, originRect);
    navigation.navigate('ShortsPlayer');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <HeroSkeleton height={320} />
        <SkeletonRow />
        <SkeletonRow cardWidth={220} cardHeight={124} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.messageText}>Couldn't load Ariya's catalog — check your connection.</Text>
      </View>
    );
  }

  if (!heroFeature) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.messageText}>Nothing in the catalog yet — check back soon.</Text>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      style={styles.container}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
    >
      <Hero feature={heroFeature} />
      {rows
        .filter((row) => row.items.length > 0)
        .map((row) =>
          row.type === 'shorts' ? (
            <ShortsRow key={row.title} title={row.title} items={row.items} onPressItem={handlePressShort(row.items)} />
          ) : (
            <ContentRow
              key={row.title}
              title={row.title}
              items={row.items}
              cardWidth={row.cardWidth}
              cardHeight={row.cardHeight}
              showMeta={row.showMeta}
              onPressItem={handlePressItem(row.items)}
            />
          )
        )}
    </Animated.ScrollView>
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
    paddingHorizontal: 32,
  },
  messageText: {
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },
  content: {},
});
