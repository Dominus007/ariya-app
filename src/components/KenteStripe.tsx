import { StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';

/**
 * 4px brand stripe on the left edge of the main screens — three equal bands
 * echoing kente cloth, a nod to the "Africa's entertainment super-app"
 * identity. Purely decorative: `pointerEvents="none"` so it never eats taps.
 */
export function KenteStripe() {
  return (
    <View style={styles.stripe} pointerEvents="none">
      <View style={[styles.band, { backgroundColor: colors.gold }]} />
      <View style={[styles.band, { backgroundColor: colors.terracotta }]} />
      <View style={[styles.band, { backgroundColor: colors.kenteGreen }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    zIndex: 40,
  },
  band: {
    flex: 1,
  },
});
