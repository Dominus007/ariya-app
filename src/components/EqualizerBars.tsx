import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../theme/colors';

interface EqualizerBarsProps {
  /** Defaults to 3 (track-list row indicator); the landing hero uses 5. */
  barCount?: number;
  barWidth?: number;
  barHeight?: number;
}

/** Small pulsing gold bars — a track-list row's "now playing" indicator, or the landing hero's now-playing strip. */
export function EqualizerBars({ barCount = 3, barWidth = 3, barHeight = 12 }: EqualizerBarsProps) {
  const delays = Array.from({ length: barCount }, (_, index) => index * 120);

  return (
    <View style={[styles.row, { width: barCount * (barWidth + 2), height: barHeight }]}>
      {delays.map((delay, index) => (
        <Bar key={index} delay={delay} width={barWidth} height={barHeight} />
      ))}
    </View>
  );
}

function Bar({ delay, width, height }: { delay: number; width: number; height: number }) {
  const scale = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 340, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.4, { duration: 340, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      )
    );
  }, [delay, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scaleY: scale.value }],
  }));

  return <Animated.View style={[styles.bar, { width, height, borderRadius: width / 2 }, style]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    backgroundColor: colors.gold,
  },
});
