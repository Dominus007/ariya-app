import { Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '../../lib/haptics';
import type { ActiveDownload } from '../../store/useDownloadsStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

/** Banner shown at the top of DownloadsScreen while something is actively downloading. */
export function DownloadProgressBanner({
  download,
  onCancel,
}: {
  download: ActiveDownload;
  onCancel: () => void;
}) {
  const percent = Math.round(download.progress * 100);

  return (
    <View style={styles.banner}>
      <View style={styles.ring}>
        <Text style={styles.ringPercent}>{percent}%</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {download.item.title}
        </Text>
        {download.item.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {download.item.subtitle}
          </Text>
        ) : null}
      </View>
      <Pressable
        hitSlop={8}
        onPress={() => {
          haptics.tap();
          onCancel();
        }}
        style={styles.cancelButton}
      >
        <Text style={styles.cancelLabel}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cardActive,
    borderWidth: 1,
    borderColor: colors.borderActive,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  ring: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercent: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.gold,
  },
  info: {
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
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.settingsBorder,
  },
  cancelLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
});
