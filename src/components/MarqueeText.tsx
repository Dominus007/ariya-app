import { useEffect, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const GAP = 48; // px between the looping copies
const SPEED = 36; // px per second
const START_DELAY = 1200; // ms pause before the loop begins, so a short glance can still read it

/**
 * Single-line text that quietly scrolls left-to-right-looping only when it's
 * actually too wide for its box (e.g. a long track title in PlayerScreen) —
 * otherwise it just renders as normal static, centered text. No third-party
 * marquee lib in the project, so this is built on Reanimated (already a
 * dependency, used the same way by FloatingTabBar/EqualizerBars).
 */
export function MarqueeText({
  text,
  style,
  containerStyle,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useSharedValue(0);

  // Re-measure whenever the track (and so the text) changes.
  useEffect(() => {
    setTextWidth(0);
  }, [text]);

  const measured = textWidth > 0 && containerWidth > 0;
  const shouldScroll = measured && textWidth > containerWidth;

  useEffect(() => {
    if (!shouldScroll) {
      cancelAnimation(translateX);
      translateX.value = 0;
      return;
    }
    const distance = textWidth + GAP;
    const duration = (distance / SPEED) * 1000;
    translateX.value = 0;
    translateX.value = withDelay(START_DELAY, withRepeat(withTiming(-distance, { duration, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(translateX);
  }, [shouldScroll, textWidth, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[styles.container, containerStyle]} onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}>
      {shouldScroll ? (
        <Animated.View style={[styles.track, animatedStyle]}>
          <Text style={style} numberOfLines={1}>
            {text}
          </Text>
          <Text style={[style, styles.repeat]} numberOfLines={1}>
            {text}
          </Text>
        </Animated.View>
      ) : (
        <Text style={style} numberOfLines={1}>
          {text}
        </Text>
      )}

      {/* Invisible, unclipped measurer — the only way to learn the text's
          natural width, since the visible copies above are width-constrained. */}
      {!measured ? (
        <Text style={[style, styles.measurer]} numberOfLines={1} onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}>
          {text}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
  },
  repeat: {
    marginLeft: GAP,
  },
  measurer: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    top: 0,
  },
});
