import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { haptics } from '../lib/haptics';
import { useSavedItems, useToggleSaved } from '../hooks/useLibrary';
import type { RootStackParamList } from '../navigation/types';
import { usePlayerStore } from '../store/usePlayerStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { MediaItem } from '../types/content';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const HERO_HEIGHT = 320;

/**
 * Home screen hero: fixed brand banner (not a data carousel) matching the
 * reference design exactly. Takes the featured item as a prop — Listen mode
 * passes a music feature, Watch mode a film — so each mode's Home screen
 * controls what's featured without this component knowing about modes.
 */
export function Hero({ feature }: { feature: MediaItem }) {
  const navigation = useNavigation<Nav>();
  const playQueue = usePlayerStore((state) => state.playQueue);
  const { data: savedItems = [] } = useSavedItems();
  const toggleSaved = useToggleSaved();
  const containerRef = useRef<View>(null);
  const isMovie = feature.kind === 'movie';
  const isSaved = savedItems.some((saved) => saved.id === feature.id);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!feature.artworkUrl && !imageFailed;

  // Slow pulsing glow, explicitly via RN's core Animated (not Reanimated) per spec.
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // Hero stays mounted across Listen/Watch mode switches with a new
  // `feature` each time — don't let a previous item's failed image state
  // stick around and hide a perfectly good new one.
  useEffect(() => {
    setImageFailed(false);
  }, [feature.id]);

  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });

  const handlePlay = () => {
    haptics.press();
    containerRef.current?.measureInWindow((x, y, width, height) => {
      playQueue([feature], 0, { x, y, width, height });
      navigation.navigate('Player');
    });
  };

  const handleSave = () => {
    haptics.tap();
    toggleSaved.mutate({ item: feature, isSaved });
  };

  return (
    <View style={styles.container} ref={containerRef} collapsable={false}>
      {showImage ? (
        <Image
          source={{ uri: feature.artworkUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
        />
      ) : null}

      {/* Dark scrim over a real photo for text legibility; the full brand
          gradient stands in as the background when there's no artwork. */}
      <LinearGradient
        colors={showImage ? ['transparent', 'rgba(8, 8, 6, 0.55)', colors.background] : ['#1a0a05', '#2d1206', '#3d1a0a']}
        locations={showImage ? [0, 0.55, 1] : undefined}
        style={StyleSheet.absoluteFill}
      />

      {/* RN has no radial-gradient primitive, so the glow is layered concentric
          circles anchored off the top-right corner — a close approximation. */}
      <Animated.View
        pointerEvents="none"
        style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
      >
        <View style={[styles.glowRing, styles.glowRingOuter]} />
        <View style={[styles.glowRing, styles.glowRingMid]} />
        <View style={[styles.glowRing, styles.glowRingCore]} />
      </Animated.View>

      <View style={styles.content}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowLine} />
          <Text style={styles.eyebrow}>{feature.genreBadge ?? 'FEATURED ARTIST'}</Text>
        </View>
        <Text style={styles.title}>{feature.title}</Text>
        <Text style={styles.subtitle}>{feature.description ?? feature.subtitle}</Text>

        <View style={styles.actions}>
          <Pressable style={styles.playButton} onPress={handlePlay}>
            <Text style={styles.playLabel}>▶  {isMovie ? 'Watch Now' : 'Play Now'}</Text>
          </Pressable>
          <Pressable style={styles.libraryButton} onPress={handleSave}>
            <Text style={styles.libraryLabel}>
              {isMovie
                ? isSaved
                  ? '✓ In My List'
                  : '+ My List'
                : isSaved
                  ? '✓ In Library'
                  : '+ Add to Library'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: HERO_HEIGHT,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  glow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowRingOuter: {
    width: 280,
    height: 280,
    backgroundColor: 'rgba(232, 98, 42, 0.08)',
  },
  glowRingMid: {
    width: 190,
    height: 190,
    backgroundColor: 'rgba(232, 98, 42, 0.14)',
  },
  glowRingCore: {
    width: 110,
    height: 110,
    backgroundColor: colors.heroGlow,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 28,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyebrowLine: {
    width: 20,
    height: 1,
    backgroundColor: colors.gold,
    marginRight: 8,
  },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 38,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    backgroundColor: colors.gold,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  playLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.background,
  },
  libraryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderActive,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  libraryLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.text,
  },
});
