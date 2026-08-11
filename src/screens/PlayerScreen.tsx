import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
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

import { haptics } from '../lib/haptics';
import { usePlayerStore } from '../store/usePlayerStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { MediaItem } from '../types/content';

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 800;

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
 */
export function PlayerScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const current = usePlayerStore((state) => state.current());
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlaying = usePlayerStore((state) => state.togglePlaying);
  const next = usePlayerStore((state) => state.next);
  const previous = usePlayerStore((state) => state.previous);

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

  const handleTogglePlaying = () => {
    haptics.press();
    togglePlaying();
  };

  const handleSkip = (direction: 'next' | 'previous') => {
    haptics.tap();
    if (direction === 'next') next();
    else previous();
  };

  return (
    <Animated.View style={[styles.sheet, { marginTop: insets.top + 28 }, sheetStyle]}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.handleArea}>
          <View style={styles.grabber} />
        </View>
      </GestureDetector>

      <Pressable onPress={dismiss} style={styles.closeButton} hitSlop={12}>
        <Ionicons name="chevron-down" size={26} color={colors.text} />
      </Pressable>

      <View style={styles.container}>
        <Animated.View style={[styles.heroWrap, heroStyle]}>
          {isVideo ? <VideoSurface item={current} isPlaying={isPlaying} /> : <AudioSurface item={current} />}
        </Animated.View>

        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1}>
            {current.title}
          </Text>
          {current.subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {current.subtitle}
            </Text>
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
      </View>
    </Animated.View>
  );
}

/** Audio plays through PlaybackEngine — this just displays it, reading shared progress from the store. */
function AudioSurface({ item }: { item: MediaItem }) {
  const positionSeconds = usePlayerStore((state) => state.positionSeconds);
  const durationSeconds = usePlayerStore((state) => state.durationSeconds);

  return (
    <View style={styles.audioArt}>
      <View style={styles.artwork}>
        <Text style={styles.artworkEmoji}>{item.emoji}</Text>
      </View>
      <Text style={styles.progressText}>
        {formatSeconds(positionSeconds)} / {formatSeconds(durationSeconds)}
      </Text>
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
    top: 8,
    right: 12,
    zIndex: 10,
    padding: 8,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 4,
    justifyContent: 'space-between',
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
    flex: 1,
  },
  audioArt: {
    flex: 1,
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
  artworkEmoji: {
    fontSize: 96,
  },
  progressText: {
    fontFamily: fonts.bodyRegular,
    color: colors.textMuted,
  },
  video: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.cardSurface,
  },
  meta: {
    marginTop: 16,
    alignItems: 'center',
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
});
