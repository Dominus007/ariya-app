import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '../../lib/haptics';
import type { DownloadedItem } from '../../store/useDownloadsStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

function formatFileSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb < 1000) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

/** A downloaded track row — matches MediaRow's styling, with file size instead of duration. Long-press to delete. */
export function DownloadedTrackRow({ download, onDelete }: { download: DownloadedItem; onDelete: () => void }) {
  const { item, fileSizeBytes } = download;

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
        {item.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}
      </View>
      <Text style={styles.size}>{formatFileSize(fileSizeBytes)}</Text>
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
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  size: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
