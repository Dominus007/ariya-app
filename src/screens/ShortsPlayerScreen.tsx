import { useEffect } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useVideoPlayer, VideoView } from 'expo-video';
import { runOnJS } from 'react-native-reanimated';

import { haptics } from '../lib/haptics';
import { useSavedItems, useToggleSaved } from '../hooks/useLibrary';
import { usePlayerStore } from '../store/usePlayerStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { MediaItem } from '../types/content';

const SWIPE_THRESHOLD = 60;

/**
 * Full-screen vertical Shorts player — Reels/TikTok-style, deliberately
 * styled nothing like PlayerScreen: edge-to-edge portrait video, dark
 * bottom scrim, title/artist bottom-left, a vertical like/share/save icon
 * stack on the right, a thin gold progress line at the very bottom, tap
 * anywhere to play/pause, swipe up/down to move through the queue.
 *
 * Reuses usePlayerStore's queue (the same store the main Player sheet
 * reads) rather than a separate shorts-only queue — tapping a ShortsCard
 * calls playQueue() exactly like any other row, and next()/previous()
 * already have the bounds-checking this screen's swipe needs.
 */
export function ShortsPlayerScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const current = usePlayerStore((state) => state.current());
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlaying = usePlayerStore((state) => state.togglePlaying);
  const next = usePlayerStore((state) => state.next);
  const previous = usePlayerStore((state) => state.previous);

  const { data: savedItems = [] } = useSavedItems();
  const toggleSaved = useToggleSaved();

  const dismiss = () => {
    haptics.tap();
    navigation.goBack();
  };

  const handleTogglePlay = () => {
    haptics.tap();
    togglePlaying();
  };

  const handleSwipeUp = () => {
    haptics.tap();
    next();
  };

  const handleSwipeDown = () => {
    haptics.tap();
    previous();
  };

  const panGesture = Gesture.Pan().onEnd((event) => {
    if (event.translationY < -SWIPE_THRESHOLD) {
      runOnJS(handleSwipeUp)();
    } else if (event.translationY > SWIPE_THRESHOLD) {
      runOnJS(handleSwipeDown)();
    }
  });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleTogglePlay)();
  });

  // Race, not Simultaneous — a real drag should win over the tap, and vice
  // versa, not fire both.
  const composedGesture = Gesture.Race(panGesture, tapGesture);

  if (!current) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Nothing queued yet.</Text>
        <Pressable onPress={dismiss} style={styles.emptyDismiss}>
          <Text style={styles.emptyDismissText}>Close</Text>
        </Pressable>
      </View>
    );
  }

  const isSaved = savedItems.some((saved) => saved.id === current.id);

  const handleToggleSave = () => {
    haptics.tap();
    toggleSaved.mutate({ item: current, isSaved });
  };

  const handleShare = () => {
    haptics.tap();
    Share.share({ message: `${current.title} on Ariya`, url: current.streamUrl }).catch(() => {
      // Share sheet dismissal/cancellation throws on some platforms — not an error worth surfacing.
    });
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <View style={styles.videoLayer}>
          <ShortVideoSurface key={current.id} item={current} isPlaying={isPlaying} />
        </View>
      </GestureDetector>

      {!isPlaying ? (
        <View style={styles.pauseOverlay} pointerEvents="none">
          <Ionicons name="play" size={64} color="rgba(255, 255, 255, 0.85)" style={styles.pauseIconOffset} />
        </View>
      ) : null}

      <Pressable onPress={dismiss} style={[styles.closeButton, { top: insets.top + 12 }]} hitSlop={8}>
        <Ionicons name="chevron-down" size={26} color={colors.text} />
      </Pressable>

      <View style={[styles.actionStack, { bottom: insets.bottom + 88 }]} pointerEvents="box-none">
        <Pressable onPress={handleToggleSave} style={styles.actionButton} hitSlop={10}>
          <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={30} color={isSaved ? colors.gold : colors.text} />
          <Text style={styles.actionLabel}>Like</Text>
        </Pressable>
        <Pressable onPress={handleShare} style={styles.actionButton} hitSlop={10}>
          <Ionicons name="paper-plane-outline" size={28} color={colors.text} />
          <Text style={styles.actionLabel}>Share</Text>
        </Pressable>
        <Pressable onPress={handleToggleSave} style={styles.actionButton} hitSlop={10}>
          <Ionicons name={isSaved ? 'bookmark' : 'bookmark-outline'} size={28} color={isSaved ? colors.gold : colors.text} />
          <Text style={styles.actionLabel}>Save</Text>
        </Pressable>
      </View>

      <View style={[styles.metaBlock, { bottom: insets.bottom + 24 }]} pointerEvents="none">
        <Text style={styles.title} numberOfLines={1}>
          {current.title}
        </Text>
        {current.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {current.subtitle}
          </Text>
        ) : null}
      </View>

      <ProgressLine />
    </View>
  );
}

function ShortVideoSurface({ item, isPlaying }: { item: MediaItem; isPlaying: boolean }) {
  const setProgress = usePlayerStore((state) => state.setProgress);
  // BEFORE_LAUNCH_TODO: streamUrl is a public storage URL for now (see
  // supabase/migrations/20260810120100_storage_buckets.sql). Once buckets
  // go private, resolve a short-lived signed URL here instead.
  const player = useVideoPlayer(item.streamUrl, (playerInstance) => {
    // Shorts loop until the viewer swipes away — matches real short-form apps.
    playerInstance.loop = true;
  });

  useEffect(() => {
    if (isPlaying) player.play();
    else player.pause();
  }, [isPlaying, player]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(player.currentTime ?? 0, player.duration ?? 0);
    }, 300);
    return () => clearInterval(interval);
  }, [player, setProgress]);

  return <VideoView player={player} style={styles.video} contentFit="cover" nativeControls={false} />;
}

function ProgressLine() {
  const positionSeconds = usePlayerStore((state) => state.positionSeconds);
  const durationSeconds = usePlayerStore((state) => state.durationSeconds);
  const progress = durationSeconds > 0 ? Math.min(positionSeconds / durationSeconds, 1) : 0;

  return (
    <View style={styles.progressTrack} pointerEvents="none">
      <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoLayer: {
    ...StyleSheet.absoluteFill,
  },
  video: {
    flex: 1,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIconOffset: {
    marginLeft: 6, // optically center the play glyph
  },
  center: {
    flex: 1,
    backgroundColor: '#000',
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
  closeButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 22,
  },
  actionStack: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
    gap: 22,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.text,
  },
  metaBlock: {
    position: 'absolute',
    left: 20,
    right: 96,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.gold,
  },
});
