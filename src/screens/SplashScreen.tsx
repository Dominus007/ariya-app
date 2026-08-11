import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Logo } from '../components/Logo';
import { colors } from '../theme/colors';

/**
 * Shown while useAuthStore checks for an existing session (see
 * RootNavigator) — briefly, on cold start only, before routing to either
 * the Tabs (already signed in) or Landing (not signed in).
 */
export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Logo size={40} style={styles.wordmark} />
      <ActivityIndicator color={colors.gold} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    marginBottom: 20,
  },
  spinner: {
    marginTop: 4,
  },
});
