import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { EqualizerBars } from '../EqualizerBars';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

const TRACKS = [
  'Asake — Lonely At The Top',
  'Burna Boy — Last Last',
  'King of Boys 3 — Now Streaming',
  'Wizkid — Essence',
  'Rema — Calm Down',
];

const CYCLE_MS = 3000;

/** Decorative "now playing" strip at the bottom of the landing hero — pulsing dot, 5 bars, cycling titles. */
export function NowPlayingBar() {
  const [index, setIndex] = useState(0);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % TRACKS.length), CYCLE_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.row}>
      <Animated.View style={[styles.dot, { opacity: pulse }]} />
      <EqualizerBars barCount={5} barWidth={3} barHeight={16} />
      <Text style={styles.track} numberOfLines={1}>
        {TRACKS[index]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cardActive,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'center',
    maxWidth: '92%',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.gold,
  },
  track: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    maxWidth: 190,
  },
});
