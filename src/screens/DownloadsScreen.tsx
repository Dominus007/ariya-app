import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { DownloadProgressBanner } from '../components/downloads/DownloadProgressBanner';
import { DownloadedTrackRow } from '../components/downloads/DownloadedTrackRow';
import { DownloadedVideoRow } from '../components/downloads/DownloadedVideoRow';
import { StorageUsageBar } from '../components/downloads/StorageUsageBar';
import { haptics } from '../lib/haptics';
import { useDownloadsStore } from '../store/useDownloadsStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export function DownloadsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const audioDownloads = useDownloadsStore((state) => state.audioDownloads);
  const videoDownloads = useDownloadsStore((state) => state.videoDownloads);
  const activeDownload = useDownloadsStore((state) => state.activeDownload);
  const storageLimitBytes = useDownloadsStore((state) => state.storageLimitBytes);
  const removeDownload = useDownloadsStore((state) => state.removeDownload);
  const cancelActiveDownload = useDownloadsStore((state) => state.cancelActiveDownload);

  const usedBytes = [...audioDownloads, ...videoDownloads].reduce((sum, d) => sum + d.fileSizeBytes, 0);
  const hasDownloads = audioDownloads.length > 0 || videoDownloads.length > 0;

  const handleBrowse = () => {
    haptics.press();
    // Best-effort: works when this screen sits inside the mobile tab
    // navigator. In the tablet/web sidebar layout there's no shared route
    // table to jump tabs through, so this is a harmless no-op there.
    try {
      (navigation as { navigate: (name: string) => void }).navigate('Home');
    } catch {
      // ignore — see note above
    }
  };

  return (
    <View style={styles.container}>
      {activeDownload ? (
        <View style={[styles.bannerWrap, { top: insets.top + 76 }]}>
          <DownloadProgressBanner download={activeDownload} onCancel={cancelActiveDownload} />
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 76 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Downloads</Text>
        <Text style={styles.subheading}>Your offline library</Text>
        <StorageUsageBar usedBytes={usedBytes} limitBytes={storageLimitBytes} />

        {!hasDownloads ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="download" size={40} color={colors.gold} />
            </View>
            <Text style={styles.emptyTitle}>No downloads yet</Text>
            <Text style={styles.emptySubtitle}>
              Download music and videos to listen and watch offline — even without internet
            </Text>
            <Pressable style={styles.browseButton} onPress={handleBrowse}>
              <Text style={styles.browseButtonText}>Browse content to download</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {audioDownloads.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>MUSIC</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{audioDownloads.length}</Text>
                  </View>
                </View>
                <View style={styles.card}>
                  {audioDownloads.map((download, index) => (
                    <View key={download.item.id}>
                      <DownloadedTrackRow download={download} onDelete={() => removeDownload(download.item.id)} />
                      {index < audioDownloads.length - 1 ? <View style={styles.rowDivider} /> : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {videoDownloads.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>VIDEOS</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{videoDownloads.length}</Text>
                  </View>
                </View>
                <View style={styles.card}>
                  {videoDownloads.map((download, index) => (
                    <View key={download.item.id}>
                      <DownloadedVideoRow download={download} onDelete={() => removeDownload(download.item.id)} />
                      {index < videoDownloads.length - 1 ? <View style={styles.rowDivider} /> : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bannerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 220,
  },
  heading: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 28,
    color: colors.text,
  },
  subheading: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.goldTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  browseButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.background,
  },

  // Populated state
  section: {
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.96, // 0.08em at 12px
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: colors.cardActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.settingsBorder,
    borderRadius: 16,
    padding: 12,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.settingsBorder,
    marginVertical: 4,
  },
});
