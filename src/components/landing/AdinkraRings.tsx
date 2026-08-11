import { StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';

const SIZES = [220, 160, 100, 40];

/** Purely ornamental concentric-circle motif, top-right of the landing hero — nods to Adinkra symbolism. */
export function AdinkraRings() {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      {SIZES.map((size) => (
        <View key={size} style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
