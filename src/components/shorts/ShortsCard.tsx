import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ArtworkImage } from '../ArtworkImage';
import { haptics } from '../../lib/haptics';
import type { OriginRect } from '../../store/usePlayerStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import type { MediaItem } from '../../types/content';

interface ShortsCardProps {
  item: MediaItem;
  cardWidth: number;
  cardHeight: number;
  onPress: (item: MediaItem, originRect: OriginRect) => void;
}

function formatDuration(totalSeconds: number | undefined) {
  if (!totalSeconds) return null;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

/**
 * One card in the Shorts row — deliberately distinct from ParallaxCard:
 * portrait 9:16 (not landscape/square), title overlaid at the bottom on a
 * gradient scrim instead of below the card, duration badge moved to the
 * top-right (the bottom is taken by the title), and a lightning-bolt "Short"
 * badge that no other card kind shows.
 */
export function ShortsCard({ item, cardWidth, cardHeight, onPress }: ShortsCardProps) {
  const containerRef = useRef<View>(null);
  const pressed = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.96]) }],
  }));

  const handlePress = () => {
    haptics.tap();
    containerRef.current?.measureInWindow((x, y, width, height) => {
      onPress(item, { x, y, width, height });
    });
  };

  const duration = formatDuration(item.durationSeconds);

  return (
    <Pressable
      ref={containerRef}
      collapsable={false}
      onPress={handlePress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 100 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 140 });
      }}
      style={{ width: cardWidth }}
    >
      <Animated.View style={[styles.card, { width: cardWidth, height: cardHeight }, cardStyle]}>
        <ArtworkImage uri={item.artworkUrl} emoji={item.emoji} style={styles.artwork} emojiFontSize={32} />

        <View style={styles.shortBadge}>
          <Ionicons name="flash" size={10} color={colors.background} />
          <Text style={styles.shortBadgeLabel}>Short</Text>
        </View>

        {duration ? (
          <View style={styles.durationBadge}>
            <Text style={styles.durationLabel}>{duration}</Text>
          </View>
        ) : null}

        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.85)']}
          locations={[0.4, 1]}
          style={styles.scrim}
          pointerEvents="none"
        >
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    // 9:16 portrait, not 16:9 — width/height are also passed explicitly by
    // ShortsRow, but aspectRatio is here too as a safety net.
    aspectRatio: 9 / 16,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.cardSurface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  // Note: StyleSheet.absoluteFillObject doesn't exist in this RN version's
  // types — use ...StyleSheet.absoluteFill instead.
  artwork: {
    ...StyleSheet.absoluteFill,
  },
  shortBadge: {
    position: 'absolute',
    left: 6,
    top: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.gold,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  shortBadgeLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.background,
    letterSpacing: 0.3,
  },
  durationBadge: {
    position: 'absolute',
    right: 6,
    top: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.text,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
    justifyContent: 'flex-end',
    padding: 8,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.text,
    lineHeight: 14,
  },
});
