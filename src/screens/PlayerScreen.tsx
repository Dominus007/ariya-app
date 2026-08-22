import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useVideoPlayer, VideoView } from 'expo-video';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ActionSheetMenu, type ActionSheetItem } from '../components/ActionSheetMenu';
import { ArtworkImage } from '../components/ArtworkImage';
import { LyricsSheet } from '../components/LyricsSheet';
import { MarqueeText } from '../components/MarqueeText';
import { haptics } from '../lib/haptics';
import { useSavedItems, useToggleSaved } from '../hooks/useLibrary';
import type { RootStackParamList } from '../navigation/types';
import { usePlayerStore } from '../store/usePlayerStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { MediaItem } from '../types/content';

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 800;
const SHARE_URL = 'ariyastream.netlify.app';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Full-screen "Now Playing" sheet. Presented as a transparent modal sliding
 * up from the bottom (see RootNavigator), with its own drag-to-dismiss
 * gesture on the grabber handle and a scale/fade reveal on the hero surface
 * that echoes the card it was opened from, without relying on the
 * cross-navigator shared-element API (documented as unstable with modal
 * presentations in the Reanimated version this app uses).
 *
 * Audio plays through the app-wide PlaybackEngine (see that file for why) —
 * this screen just reflects usePlayerStore's shared position/duration for
 * audio. Video still owns its player locally, since it needs a mounted
 * VideoView to render into.
 *
 * Below the main transport controls, the screen scrolls to reveal secondary
 * controls (connect/shuffle/repeat/share/queue/menu) and, further down, a
 * Lyrics teaser that opens the lyrics bottom sheet — see LyricsSheet.
 */
export function PlayerScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const current = usePlayerStore((state) => state.current());
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlaying = usePlayerStore((state) => state.togglePlaying);
  const next = usePlayerStore((state) => state.next);
  const previous = usePlayerStore((state) => state.previous);
  const shuffle = usePlayerStore((state) => state.shuffle);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const cycleRepeat = usePlayerStore((state) => state.cycleRepeat);

  const { data: savedItems = [] } = useSavedItems();
  const toggleSaved = useToggleSaved();

  const [menuVisible, setMenuVisible] = useState(false);
  const [connectVisible, setConnectVisible] = useState(false);
  const [lyricsVisible, setLyricsVisible] = useState(false);
  const [outputDevice, setOutputDevice] = useState('This Device');

  const translateY = useSharedValue(0);
  const heroReveal = useSharedValue(0);

  useEffect(() => {
    heroReveal.value = withTiming(1, { duration: 380 });
  }, [heroReveal]);

  useEffect(
    () => () => {
      // Origin rect only matters for the entry reveal — drop it once we leave.
      usePlayerStore.setState({ originRect: null });
    },
    []
  );

  const dismiss = () => {
    haptics.tap();
    navigation.goBack();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (translateY.value > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY) {
        translateY.value = withTiming(screenHeight, { duration: 220 }, (finished) => {
          if (finished) runOnJS(dismiss)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroReveal.value,
    transform: [{ scale: interpolate(heroReveal.value, [0, 1], [0.94, 1]) }],
  }));

  if (!current) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Nothing queued yet — pick something to play.</Text>
        <Pressable onPress={dismiss} style={styles.emptyDismiss}>
          <Text style={styles.emptyDismissText}>Close</Text>
        </Pressable>
      </View>
    );
  }

  const isVideo = current.kind === 'video' || current.kind === 'movie' || current.kind === 'live-sport';
  const artistName = current.subtitle;
  const isSaved = savedItems.some((saved) => saved.id === current.id);

  const handleTogglePlaying = () => {
    haptics.press();
    togglePlaying();
  };

  const handleSkip = (direction: 'next' | 'previous') => {
    haptics.tap();
    if (direction === 'next') next();
    else previous();
  };

  const handleToggleSaved = () => {
    haptics.tap();
    toggleSaved.mutate({ item: current, isSaved });
  };

  const handleGoToArtist = () => {
    haptics.tap();
    navigation.navigate('Artist', { name: artistName ?? 'Unknown Artist' });
  };

  const handleShuffle = () => {
    haptics.tap();
    toggleShuffle();
  };

  const handleRepeat = () => {
    haptics.tap();
    cycleRepeat();
  };

  const handleShareTrack = () => {
    haptics.tap();
    const byArtist = artistName ? ` by ${artistName}` : '';
    Share.share({ message: `Listen to ${current.title}${byArtist} on Ariya — ${SHARE_URL}` }).catch(() => {
      // Share sheet dismissal/cancellation throws on some platforms — not an error worth surfacing.
    });
  };

  const handleOpenQueue = () => {
    haptics.tap();
    navigation.navigate('Queue');
  };

  const connectItems: ActionSheetItem[] = [
    {
      key: 'this-device',
      label: 'This Device',
      icon: 'phone-portrait-outline',
      selected: outputDevice === 'This Device',
      onPress: () => {
        setOutputDevice('This Device');
        setConnectVisible(false);
      },
    },
  ];

  const menuItems: ActionSheetItem[] = [
    {
      key: 'add-to-playlist',
      label: 'Add to playlist',
      icon: 'add-circle-outline',
      onPress: () => {
        setMenuVisible(false);
        Alert.alert('Add to playlist', 'Playlists are coming soon.');
      },
    },
    {
      key: 'go-to-artist',
      label: 'Go to artist',
      icon: 'person-outline',
      onPress: () => {
        setMenuVisible(false);
        handleGoToArtist();
      },
    },
    {
      key: 'go-to-album',
      label: 'Go to album',
      icon: 'albums-outline',
      onPress: () => {
        setMenuVisible(false);
        Alert.alert('Album', 'Album pages are coming soon.');
      },
    },
    {
      key: 'report',
      label: 'Report',
      icon: 'flag-outline',
      destructive: true,
      onPress: () => {
        setMenuVisible(false);
        Alert.alert('Reported', "Thanks for letting us know — we'll take a look.");
      },
    },
  ];

  return (
    <Animated.View style={[styles.sheet, { marginTop: insets.top + 28 }, sheetStyle]}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.handleArea}>
          <View style={styles.grabber} />
        </View>
      </GestureDetector>

      <Pressable onPress={dismiss} style={styles.closeButton} hitSlop={8}>
        <Ionicons name="chevron-down" size={26} color={colors.gold} />
      </Pressable>

      <Pressable onPress={handleToggleSaved} style={styles.heartButton} hitSlop={8}>
        <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={24} color={isSaved ? colors.gold : colors.text} />
      </Pressable>

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.heroWrap, heroStyle]}>
            {isVideo ? <VideoSurface item={current} isPlaying={isPlaying} /> : <AudioSurface item={current} />}
          </Animated.View>

          <View style={styles.meta}>
            <View style={styles.titleRow}>
              <View style={styles.titleMarqueeWrap}>
                <MarqueeText text={current.title} style={styles.title} />
              </View>
              <Pressable onPress={handleToggleSaved} hitSlop={10} style={styles.addButton}>
                <Ionicons
                  name={isSaved ? 'checkmark-circle' : 'add-circle-outline'}
                  size={26}
                  color={isSaved ? colors.gold : colors.text}
                />
              </Pressable>
            </View>
            {artistName ? (
              <Pressable onPress={handleGoToArtist} hitSlop={6}>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {artistName}
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.controls}>
            <Pressable onPress={() => handleSkip('previous')} hitSlop={12}>
              <Ionicons name="play-skip-back" size={26} color={colors.text} />
            </Pressable>
            <Pressable onPress={handleTogglePlaying} style={styles.playButton} hitSlop={12}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={28}
                color={colors.background}
                style={!isPlaying ? styles.playIconOffset : undefined}
              />
            </Pressable>
            <Pressable onPress={() => handleSkip('next')} hitSlop={12}>
              <Ionicons name="play-skip-forward" size={26} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.secondaryRow}>
            <Pressable onPress={handleShuffle} hitSlop={10}>
              <Ionicons name={shuffle ? 'shuffle' : 'shuffle-outline'} size={22} color={shuffle ? colors.gold : colors.textMuted} />
            </Pressable>
            <Pressable onPress={handleRepeat} hitSlop={10} style={styles.repeatWrap}>
              <Ionicons
                name={repeatMode !== 'off' ? 'repeat' : 'repeat-outline'}
                size={22}
                color={repeatMode !== 'off' ? colors.gold : colors.textMuted}
              />
              {repeatMode === 'one' ? (
                <View style={styles.repeatBadge}>
                  <Text style={styles.repeatBadgeText}>1</Text>
                </View>
              ) : null}
            </Pressable>
            <Pressable onPress={handleShareTrack} hitSlop={10}>
              <Ionicons name="share-social-outline" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.bottomRow}>
            <Pressable
              onPress={() => {
                haptics.tap();
                setConnectVisible(true);
              }}
              hitSlop={10}
              style={styles.connectButton}
            >
              <Ionicons name="volume-high-outline" size={22} color={colors.textMuted} />
              <Text style={styles.connectLabel} numberOfLines={1}>
                {outputDevice}
              </Text>
            </Pressable>

            <View style={styles.bottomRowRight}>
              <Pressable onPress={handleOpenQueue} hitSlop={10}>
                <Ionicons name="list-outline" size={22} color={colors.textMuted} />
              </Pressable>
              <Pressable
                onPress={() => {
                  haptics.tap();
                  setMenuVisible(true);
                }}
                hitSlop={10}
              >
                <Ionicons name="ellipsis-horizontal" size={22} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={styles.lyricsRow}
            onPress={() => {
              haptics.tap();
              setLyricsVisible(true);
            }}
          >
            <Text style={styles.lyricsLabel}>Lyrics</Text>
            <Ionicons name="expand-outline" size={18} color={colors.textMuted} />
          </Pressable>
        </ScrollView>
      </View>

      <ActionSheetMenu
        visible={connectVisible}
        title="Connect to a device"
        subtitle={`Playing on: ${outputDevice}`}
        items={connectItems}
        onClose={() => setConnectVisible(false)}
      />
      <ActionSheetMenu visible={menuVisible} items={menuItems} onClose={() => setMenuVisible(false)} />
      <LyricsSheet visible={lyricsVisible} onClose={() => setLyricsVisible(false)} artist={artistName} title={current.title} />
    </Animated.View>
  );
}

/** Audio plays through PlaybackEngine — this just displays it, reading shared progress from the store. */
function AudioSurface({ item }: { item: MediaItem }) {
  const positionSeconds = usePlayerStore((state) => state.positionSeconds);
  const durationSeconds = usePlayerStore((state) => state.durationSeconds);
  const requestSeek = usePlayerStore((state) => state.requestSeek);

  // While actively dragging, show the drag position instead of the (now
  // stale) real playback position — avoids the thumb fighting the finger.
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const displayPosition = isScrubbing ? scrubValue : positionSeconds;

  return (
    <View style={styles.audioArt}>
      <ArtworkImage uri={item.artworkUrl} emoji={item.emoji} style={styles.artwork} emojiFontSize={96} />

      <View style={styles.seekBarWrap}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={Math.max(durationSeconds, 0.1)}
          value={displayPosition}
          minimumTrackTintColor={colors.gold}
          maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
          thumbTintColor={colors.text}
          onSlidingStart={() => {
            haptics.tap();
            setScrubValue(positionSeconds);
            setIsScrubbing(true);
          }}
          onValueChange={setScrubValue}
          onSlidingComplete={(value) => {
            setIsScrubbing(false);
            haptics.press();
            requestSeek(value);
          }}
        />
        <View style={styles.timeRow}>
          <Text style={styles.progressText}>{formatSeconds(displayPosition)}</Text>
          <Text style={styles.progressText}>{formatSeconds(durationSeconds)}</Text>
        </View>
      </View>
    </View>
  );
}

function VideoSurface({ item, isPlaying }: { item: MediaItem; isPlaying: boolean }) {
  const setProgress = usePlayerStore((state) => state.setProgress);
  // BEFORE_LAUNCH_TODO: streamUrl is a public storage URL for now (see
  // supabase/migrations/20260810120100_storage_buckets.sql). Once buckets
  // go private, resolve a short-lived signed URL here instead of playing
  // this field directly.
  const player = useVideoPlayer(item.streamUrl, (playerInstance) => {
    playerInstance.loop = false;
  });

  useEffect(() => {
    if (isPlaying) player.play();
    else player.pause();
  }, [isPlaying, player]);

  // Video's player is local to this screen (it needs a mounted VideoView),
  // so this is the only place that can report its live position — polled
  // rather than assuming a specific status-event name across expo-video
  // versions. Dismissing the sheet unmounts this and playback pauses.
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(player.currentTime ?? 0, player.duration ?? 0);
    }, 500);
    return () => clearInterval(interval);
  }, [player, setProgress]);

  return <VideoView player={player} style={styles.video} nativeControls contentFit="contain" />;
}

function formatSeconds(totalSeconds: number | undefined) {
  if (!totalSeconds || Number.isNaN(totalSeconds)) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  emptyText: {
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyDismiss: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: colors.card,
  },
  emptyDismissText: {
    fontFamily: fonts.bodySemiBold,
    color: colors.text,
  },
  heroWrap: {
    width: '100%',
    alignItems: 'center',
  },
  audioArt: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 16,
    backgroundColor: colors.cardSurface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekBarWrap: {
    width: '100%',
    paddingHorizontal: 4,
  },
  slider: {
    width: '100%',
    height: 24,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  progressText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    backgroundColor: colors.cardSurface,
  },
  meta: {
    marginTop: 20,
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleMarqueeWrap: {
    flex: 1,
  },
  addButton: {
    padding: 2,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginTop: 24,
    marginBottom: 8,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconOffset: {
    marginLeft: 3, // optically center the play glyph, which has more weight on its right
  },
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginTop: 8,
    marginBottom: 24,
  },
  repeatWrap: {
    position: 'relative',
  },
  repeatBadge: {
    position: 'absolute',
    bottom: -4,
    right: -6,
    minWidth: 12,
    height: 12,
    borderRadius: 6,
    paddingHorizontal: 2,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 8,
    color: colors.background,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.settingsBorder,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  connectLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    flexShrink: 1,
  },
  bottomRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
  },
  lyricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lyricsLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.text,
  },
});
