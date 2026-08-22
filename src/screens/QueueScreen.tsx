import { Pressable, StyleSheet, Text, View, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { ArtworkImage } from '../components/ArtworkImage';
import { EqualizerBars } from '../components/EqualizerBars';
import { haptics } from '../lib/haptics';
import { usePlayerStore } from '../store/usePlayerStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { MediaItem } from '../types/content';

/**
 * "Up next" queue sheet, opened from PlayerScreen's queue icon. Reads
 * usePlayerStore's existing queue/currentIndex directly (there's no separate
 * queue-screen state) — tapping an upcoming track jumps straight to it via
 * playAt(), tapping the now-playing row just closes back to the player.
 */
export function QueueScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playAt = usePlayerStore((state) => state.playAt);

  const dismiss = () => {
    haptics.tap();
    navigation.goBack();
  };

  const upcoming = queue.map((item, index) => ({ item, index })).slice(currentIndex + 1);
  const current = queue[currentIndex] ?? null;

  const renderRow = (item: MediaItem, index: number) => {
    const isCurrent = index === currentIndex;
    return (
      <Pressable
        style={[styles.row, isCurrent && styles.rowActive]}
        onPress={() => {
          haptics.tap();
          if (!isCurrent) playAt(index);
        }}
      >
        <ArtworkImage uri={item.artworkUrl} emoji={item.emoji} style={styles.thumb} emojiFontSize={18} />
        <View style={styles.textBlock}>
          <Text style={[styles.title, isCurrent && styles.titleActive]} numberOfLines={1}>
            {item.title}
          </Text>
          {item.subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          ) : null}
        </View>
        {isCurrent && isPlaying ? <EqualizerBars /> : null}
      </Pressable>
    );
  };

  return (
    <View style={[styles.sheet, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Queue</Text>
        <Pressable onPress={dismiss} hitSlop={10} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
      </View>

      <FlatList
        data={upcoming}
        keyExtractor={({ item, index }) => `${item.id}-${index}`}
        renderItem={({ item: row }) => renderRow(row.item, row.index)}
        ListHeaderComponent={
          current ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Now Playing</Text>
              {renderRow(current, currentIndex)}
              {upcoming.length > 0 ? <Text style={[styles.sectionLabel, styles.nextLabel]}>Next Up</Text> : null}
            </View>
          ) : null
        }
        ListEmptyComponent={current ? null : <Text style={styles.emptyText}>Nothing queued.</Text>}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 4,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  nextLabel: {
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  rowActive: {
    backgroundColor: colors.nowPlayingTint,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.text,
  },
  titleActive: {
    color: colors.gold,
  },
  subtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyText: {
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
});
