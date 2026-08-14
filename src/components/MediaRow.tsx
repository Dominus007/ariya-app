import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ArtworkImage } from './ArtworkImage';
import { EqualizerBars } from './EqualizerBars';
import { haptics } from '../lib/haptics';
import { useSavedItems, useToggleSaved } from '../hooks/useLibrary';
import { usePlayerStore, type OriginRect } from '../store/usePlayerStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { MediaItem } from '../types/content';

interface MediaRowProps {
  item: MediaItem;
  index?: number;
  onPress: (item: MediaItem, originRect: OriginRect) => void;
}

function formatDuration(totalSeconds: number | undefined) {
  if (!totalSeconds) return '';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

/** One row in a track/video/podcast list — used by Search and Library. */
export function MediaRow({ item, index, onPress }: MediaRowProps) {
  const rowRef = useRef<View>(null);
  const current = usePlayerStore((state) => state.current());
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const { data: savedItems = [] } = useSavedItems();
  const toggleSaved = useToggleSaved();
  const isSaved = savedItems.some((saved) => saved.id === item.id);

  const isCurrentTrack = current?.id === item.id;
  const isRowPlaying = isCurrentTrack && isPlaying;

  const handlePress = () => {
    haptics.tap();
    rowRef.current?.measureInWindow((x, y, width, height) => {
      onPress(item, { x, y, width, height });
    });
  };

  const handleToggleLike = () => {
    haptics.tap();
    toggleSaved.mutate({ item, isSaved });
  };

  return (
    <Pressable
      ref={rowRef}
      collapsable={false}
      style={[styles.row, isCurrentTrack && styles.rowActive]}
      onPress={handlePress}
    >
      <View style={styles.indexSlot}>
        {isRowPlaying ? (
          <EqualizerBars />
        ) : (
          <Text style={styles.index}>{index != null ? index + 1 : ''}</Text>
        )}
      </View>

      <ArtworkImage uri={item.artworkUrl} emoji={item.emoji} style={styles.thumb} emojiFontSize={20} />

      <View style={styles.textBlock}>
        <Text style={[styles.title, isCurrentTrack && styles.titleActive]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.isLive ? '🔴 LIVE · ' : ''}
            {item.subtitle}
          </Text>
        ) : null}
      </View>

      <Pressable hitSlop={10} onPress={handleToggleLike} style={styles.heartButton}>
        <Ionicons
          name={isSaved ? 'heart' : 'heart-outline'}
          size={16}
          color={isSaved ? colors.gold : colors.textMuted}
        />
      </Pressable>

      {item.durationSeconds ? (
        <Text style={styles.duration}>{formatDuration(item.durationSeconds)}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  indexSlot: {
    width: 20,
    alignItems: 'center',
  },
  index: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  thumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
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
  heartButton: {
    padding: 4,
  },
  duration: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
    minWidth: 36,
    textAlign: 'right',
  },
});
