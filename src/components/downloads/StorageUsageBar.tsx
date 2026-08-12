import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

function formatGB(bytes: number) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(1);
}

export function StorageUsageBar({ usedBytes, limitBytes }: { usedBytes: number; limitBytes: number }) {
  const ratio = limitBytes > 0 ? Math.min(usedBytes / limitBytes, 1) : 0;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>
        {formatGB(usedBytes)} GB of {formatGB(limitBytes)} GB used
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    marginBottom: 28,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.gold,
  },
});
