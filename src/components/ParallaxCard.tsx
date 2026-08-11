import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { haptics } from '../lib/haptics';
import type { OriginRect } from '../store/usePlayerStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { MediaItem } from '../types/content';

export const CARD_GAP = 10;
const PARALLAX_RANGE = 14; // px the artwork shifts opposite the row's scroll

interface ParallaxCardProps {
  item: MediaItem;
  index: number;
  cardWidth: number;
  cardHeight: number;
  scrollX: SharedValue<number>;
  onPress: (item: MediaItem, originRect: OriginRect) => void;
  /** Shows the bottom-right duration badge / top-left LIVE badge — video & movie rows only. */
  showMeta?: boolean;
}

function formatDuration(totalSeconds: number | undefined) {
  if (!totalSeconds) return null;
  if (totalSeconds >= 3600) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.round((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
}

/** One card in a ContentRow — press feedback (scale + border) plus a subtle parallax drift as the row scrolls. */
export function ParallaxCard({
  item,
  index,
  cardWidth,
  cardHeight,
  scrollX,
  onPress,
  showMeta = false,
}: ParallaxCardProps) {
  const containerRef = useRef<View>(null);
  const step = cardWidth + CARD_GAP;
  const inputRange = [(index - 1) * step, index * step, (index + 1) * step];
  const pressed = useSharedValue(0);

  const artworkStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          inputRange,
          [-PARALLAX_RANGE, 0, PARALLAX_RANGE],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pressed.value, [0, 1], [1, 0.97]) }],
    borderColor: pressed.value === 1 ? colors.cardBorderActive : colors.cardBorder,
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: pressed.value,
  }));

  const handlePress = () => {
    haptics.tap();
    containerRef.current?.measureInWindow((x, y, width, height) => {
      onPress(item, { x, y, width, height });
    });
  };

  const duration = showMeta ? formatDuration(item.durationSeconds) : null;
  const showLiveBadge = showMeta && item.isLive;

  return (
    <Pressable
      ref={containerRef}
      collapsable={false}
      onPress={handlePress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 120 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 160 });
      }}
      style={{ width: cardWidth }}
    >
      <Animated.View style={[styles.card, { width: cardWidth, height: cardHeight }, cardStyle]}>
        <Animated.View style={[styles.artworkInner, artworkStyle]}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </Animated.View>

        {showLiveBadge ? (
          <View style={styles.liveBadge}>
            <PulsingDot />
            <Text style={styles.liveLabel}>LIVE</Text>
          </View>
        ) : duration ? (
          <View style={styles.durationBadge}>
            <Text style={styles.durationLabel}>{duration}</Text>
          </View>
        ) : null}

        <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none">
          <View style={styles.playCircle}>
            <Text style={styles.playGlyph}>▶</Text>
          </View>
        </Animated.View>
      </Animated.View>
      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
      {item.subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

function PulsingDot() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 650, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 650, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.liveDot, style]} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.cardSurface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkInner: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 40,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: {
    color: colors.background,
    fontSize: 14,
    marginLeft: 2,
  },
  durationBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
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
  liveBadge: {
    position: 'absolute',
    left: 6,
    top: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.terracotta,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.text,
  },
  liveLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    color: colors.text,
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.text,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
