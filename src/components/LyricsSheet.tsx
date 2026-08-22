import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { haptics } from '../lib/haptics';
import { useLyrics } from '../hooks/useLyrics';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

/**
 * Lyrics bottom sheet — slides up over the full-screen player. Fetches from
 * the free Lyrics.ovh API (no licensed lyrics source yet — see useLyrics),
 * keyed on the current track's artist/title, and only mounts (so only
 * fetches) once the player screen actually renders it.
 */
export function LyricsSheet({
  visible,
  onClose,
  artist,
  title,
}: {
  visible: boolean;
  onClose: () => void;
  artist: string | undefined;
  title: string;
}) {
  const insets = useSafeAreaInsets();
  const { data: lyrics, isLoading, isError } = useLyrics(artist, title);

  const handleShare = () => {
    haptics.tap();
    Share.share({
      message: `${title}${artist ? ` — ${artist}` : ''}\n\n${lyrics ?? ''}`,
    }).catch(() => {
      // Share sheet dismissal/cancellation throws on some platforms — not an error worth surfacing.
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.grabber} />

        <View style={styles.header}>
          <Pressable style={styles.headerLabel} onPress={onClose} hitSlop={8}>
            <Text style={styles.headerTitle}>Lyrics</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
          </Pressable>
          <View style={styles.headerActions}>
            {lyrics ? (
              <Pressable onPress={handleShare} hitSlop={10} style={styles.headerButton}>
                <Ionicons name="share-outline" size={20} color={colors.text} />
              </Pressable>
            ) : null}
            <Pressable onPress={onClose} hitSlop={10} style={styles.headerButton}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {isLoading ? (
            <Text style={styles.statusText}>Finding lyrics...</Text>
          ) : isError || !lyrics ? (
            <Text style={styles.statusText}>Lyrics not available for this track</Text>
          ) : (
            <Text style={styles.lyricsText}>{lyrics}</Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    height: '72%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.settingsBorder,
  },
  headerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  headerButton: {
    padding: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    flexGrow: 1,
  },
  statusText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    lineHeight: 29,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
  lyricsText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    lineHeight: 29,
    color: colors.text,
    textAlign: 'center',
  },
});
