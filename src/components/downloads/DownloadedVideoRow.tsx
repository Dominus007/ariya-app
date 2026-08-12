import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '../../lib/haptics';
import type { DownloadedItem } from '../../store/useDownloadsStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

function formatFileSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb < 1000) return `${mb.toFixed(0)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

function formatDuration(totalSeconds: number | undefined) {
  if (!totalSeconds) return null;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

/** A downloaded video/movie row — 16:9 thumbnail, category pill, size + duration. Long-press to delete. */
export function DownloadedVideoRow({ download, onDelete }: { download: DownloadedItem; onDelete: () => void }) {
  const { item, fileSizeBytes } = download;
  const category = item.genreBadge?.split('·')[0]?.trim();
  const duration = formatDuration(item.durationSeconds);

  const handleLongPress = () => {
    haptics.tap();
    Alert.alert(item.title, 'Remove this download?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <Pressable style={styles.row} onLongPress={handleLongPress}>
      <View style={styles.thumb}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        {category ? (
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.meta}>
        <Text style={styles.size}>{formatFileSize(fileSizeBytes)}</Text>
        {duration ? <Text style={styles.duration}>{duration}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  thumb: {
    width: 60,
    height: 34,
    borderRadius: 6,
    backgroundColor: colors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 16,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.text,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.goldTint,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.gold,
  },
  meta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  size: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
  },
  duration: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: colors.textMuted,
  },
});
