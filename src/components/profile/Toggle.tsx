import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { haptics } from '../../lib/haptics';
import { colors } from '../../theme/colors';

const WIDTH = 44;
const HEIGHT = 26;
const KNOB_SIZE = 22;
const PADDING = 2;

/** Custom iOS-style toggle switch — gold when on, dark when off (RN's built-in Switch can't match brand colors precisely enough). */
export function Toggle({ value, onChange }: { value: boolean; onChange: (next: boolean) => void }) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 180 });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.toggleOff, colors.gold]),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * (WIDTH - KNOB_SIZE - PADDING * 2) }],
  }));

  return (
    <Pressable
      onPress={() => {
        haptics.select();
        onChange(!value);
      }}
      hitSlop={8}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    padding: PADDING,
    justifyContent: 'center',
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: colors.text,
  },
});
