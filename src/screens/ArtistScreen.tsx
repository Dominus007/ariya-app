import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { haptics } from '../lib/haptics';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { RootStackParamList } from '../navigation/types';

type ArtistRoute = RouteProp<RootStackParamList, 'Artist'>;

/**
 * Placeholder artist page — the data model (MediaItem) has no dedicated
 * artist entity yet (subtitle doubles as artist/host/team name across song,
 * podcast and video kinds), so this is a stub reachable from the tappable
 * artist name and "Go to artist" menu item on PlayerScreen, ready for a real
 * artist catalog to be wired in later.
 */
export function ArtistScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<ArtistRoute>();
  const name = route.params?.name ?? 'Unknown Artist';

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.goldTint, colors.background]} style={StyleSheet.absoluteFill} />

      <Pressable
        onPress={() => {
          haptics.tap();
          navigation.goBack();
        }}
        style={[styles.backButton, { top: insets.top + 12 }]}
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={26} color={colors.text} />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color={colors.gold} />
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtitle}>Artist page coming soon</Text>
        <Text style={styles.body}>
          We're still building out full artist catalogs — top tracks, albums and bio for {name} will show up here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.gold,
    marginTop: 4,
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
});
