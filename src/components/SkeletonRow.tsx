import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme/colors';

function ShimmerBlock({ width, height }: { width: number; height: number }) {
  const sweep = useSharedValue(-1);

  useEffect(() => {
    sweep.value = withRepeat(withTiming(1, { duration: 1100, easing: Easing.linear }), -1, false);
  }, [sweep]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sweep.value * width }],
  }));

  return (
    <View style={[styles.block, { width, height }]}>
      <Animated.View style={[StyleSheet.absoluteFill, sweepStyle]}>
        <LinearGradient
          colors={['transparent', colors.shimmer, 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/** Shimmering placeholder row shown while a content section's data is loading. */
export function SkeletonRow({
  count = 4,
  cardWidth = 132,
  cardHeight = 132,
}: {
  count?: number;
  cardWidth?: number;
  cardHeight?: number;
}) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, index) => (
        <ShimmerBlock key={index} width={cardWidth} height={cardHeight} />
      ))}
    </View>
  );
}

/** Full-height shimmer standing in for the hero while its data loads. */
export function HeroSkeleton({ height }: { height: number }) {
  const { width } = useWindowDimensions();
  return (
    <View style={[styles.hero, { height }]}>
      <ShimmerBlock width={width} height={height} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  block: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.goldTint,
  },
  hero: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.goldTint,
  },
});
