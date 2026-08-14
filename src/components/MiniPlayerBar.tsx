import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { ArtworkImage } from './ArtworkImage';
import { haptics } from '../lib/haptics';
import type { RootStackParamList } from '../navigation/types';
import { usePlayerStore } from '../store/usePlayerStore';
import { colors } from '../theme/colors';
import { MINI_PLAYER_HEIGHT } from '../theme/layout';
import { fonts } from '../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Persistent bottom player bar — sits directly above the tab bar (or flush
 * with the bottom, in sidebar layout) whenever something is queued, and
 * stays mounted (state lives in usePlayerStore) across the Now Playing
 * sheet opening and closing. Tapping the track info reopens the full sheet;
 * transport controls work without leaving the tab.
 *
 * `bottomOffset` is the full distance from the screen bottom to this bar's
 * bottom edge — the caller (TabNavigator) already knows whether that's the
 * mobile tab bar's height + safe area, or 0 in the sidebar layout.
 */
export function MiniPlayerBar({ bottomOffset }: { bottomOffset: number }) {
  const navigation = useNavigation<Nav>();
  const current = usePlayerStore((state) => state.current());
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlaying = usePlayerStore((state) => state.togglePlaying);
  const next = usePlayerStore((state) => state.next);
  const previous = usePlayerStore((state) => state.previous);
  const positionSeconds = usePlayerStore((state) => state.positionSeconds);
  const durationSeconds = usePlayerStore((state) => state.durationSeconds);
  const [progressPressed, setProgressPressed] = useState(false);

  if (!current) return null;

  const progress = durationSeconds > 0 ? Math.min(positionSeconds / durationSeconds, 1) : 0;

  const openSheet = () => {
    haptics.tap();
    navigation.navigate('Player');
  };

  return (
    <View style={[styles.wrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tint} pointerEvents="none" />

      <View style={styles.progressTrack}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPressIn={() => setProgressPressed(true)}
          onPressOut={() => setProgressPressed(false)}
        >
          <View
            style={[
              styles.progressFill,
              { width: `${progress * 100}%`, backgroundColor: progressPressed ? colors.gold : colors.text },
            ]}
          />
        </Pressable>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.trackInfo} onPress={openSheet}>
          <ArtworkImage uri={current.artworkUrl} emoji={current.emoji} style={styles.thumb} emojiFontSize={22} />
          <View style={styles.textBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {current.title}
            </Text>
            {current.subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {current.subtitle}
              </Text>
            ) : null}
          </View>
        </Pressable>

        <View style={styles.controls}>
          <Pressable
            hitSlop={8}
            onPress={() => {
              haptics.tap();
              previous();
            }}
          >
            <Ionicons name="play-skip-back" size={18} color={colors.text} />
          </Pressable>
          <Pressable
            style={styles.playButton}
            hitSlop={8}
            onPress={() => {
              haptics.press();
              togglePlaying();
            }}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={16} color={colors.background} />
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => {
              haptics.tap();
              next();
            }}
          >
            <Ionicons name="play-skip-forward" size={18} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.sideIcons}>
          <Ionicons name="list-outline" size={16} color={colors.textMuted} />
          <Ionicons name="chatbox-ellipses-outline" size={16} color={colors.textMuted} />
          <Ionicons name="volume-medium-outline" size={16} color={colors.textMuted} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: MINI_PLAYER_HEIGHT,
    borderTopWidth: 1,
    borderTopColor: colors.navBorder,
    overflow: 'hidden',
  },
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.navSurface,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.progressTrack,
  },
  progressFill: {
    height: '100%',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  trackInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumb: {
    width: 50,
    height: 50,
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
  subtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
