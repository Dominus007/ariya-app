import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

/**
 * Large, slow-pulsing gold/terracotta glow behind the landing hero. Same
 * "layered concentric circles + RN core Animated.loop" technique as
 * Hero.tsx's glow (RN has no radial-gradient primitive), just bigger and
 * two-tone.
 */
export function GlowOrb() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 3400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 3400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] });

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, { opacity, transform: [{ scale }] }]}>
      <View style={[styles.ring, styles.ringOuter]} />
      <View style={[styles.ring, styles.ringMid]} />
      <View style={[styles.ring, styles.ringCore]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: -160,
    alignSelf: 'center',
    width: 440,
    height: 440,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
  },
  ringOuter: {
    width: 440,
    height: 440,
    backgroundColor: 'rgba(196, 87, 42, 0.10)', // terracotta
  },
  ringMid: {
    width: 290,
    height: 290,
    backgroundColor: 'rgba(201, 150, 58, 0.14)', // gold
  },
  ringCore: {
    width: 160,
    height: 160,
    backgroundColor: 'rgba(201, 150, 58, 0.22)',
  },
});
