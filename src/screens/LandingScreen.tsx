import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AdinkraRings } from '../components/landing/AdinkraRings';
import {
  ContentWorldsSection,
  FeaturesSection,
  FooterSection,
  PricingSection,
} from '../components/landing/LandingSections';
import { GlowOrb } from '../components/landing/GlowOrb';
import { NowPlayingBar } from '../components/landing/NowPlayingBar';
import { KenteStripe } from '../components/KenteStripe';
import { Logo } from '../components/Logo';
import { haptics } from '../lib/haptics';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import type { PlaybackMode } from '../types/content';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const NAV_BREAKPOINT = 768; // show text nav links at/above this width
const STACK_BREAKPOINT = 640; // stack two-column sections below this width

/**
 * The marketing page every signed-out visitor lands on first (see
 * RootNavigator: it's the initial screen in the signed-out stack). "Start
 * free trial" and "Log In" hand off to SignUp/SignIn; nothing here requires
 * a session.
 */
export function LandingScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWideNav = width >= NAV_BREAKPOINT;
  const isStacked = width < STACK_BREAKPOINT;

  const [demoMode, setDemoMode] = useState<PlaybackMode>('listen');
  const scrollRef = useRef<ScrollView>(null);
  const contentWorldsY = useRef(0);
  const featuresY = useRef(0);
  const pricingY = useRef(0);

  const scrollToY = (y: number) => {
    haptics.tap();
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
  };

  const goToSignUp = () => {
    haptics.press();
    navigation.navigate('SignUp');
  };

  const goToSignIn = () => {
    haptics.tap();
    navigation.navigate('SignIn');
  };

  const captureY = (ref: React.MutableRefObject<number>) => (event: LayoutChangeEvent) => {
    ref.current = event.nativeEvent.layout.y;
  };

  return (
    <View style={styles.root}>
      <KenteStripe />

      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrap}>
          <GlowOrb />
          <AdinkraRings />

          <View style={[styles.nav, { paddingTop: insets.top + 16 }]}>
            <Logo size={20} />
            <View style={styles.navRight}>
              {isWideNav ? (
                <View style={styles.navLinks}>
                  <Pressable onPress={() => scrollToY(contentWorldsY.current)}>
                    <Text style={styles.navLink}>Content</Text>
                  </Pressable>
                  <Pressable onPress={() => scrollToY(featuresY.current)}>
                    <Text style={styles.navLink}>Features</Text>
                  </Pressable>
                  <Pressable onPress={() => scrollToY(pricingY.current)}>
                    <Text style={styles.navLink}>Pricing</Text>
                  </Pressable>
                </View>
              ) : null}
              <Pressable style={styles.ghostButton} onPress={goToSignIn}>
                <Text style={styles.ghostButtonLabel}>Log In</Text>
              </Pressable>
              <Pressable style={styles.goldButtonSmall} onPress={goToSignUp}>
                <Text style={styles.goldButtonSmallLabel}>Start Free Trial</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={styles.badge}>
              <PulsingDot />
              <Text style={styles.badgeLabel}>AFRICA'S ENTERTAINMENT SUPER-APP</Text>
            </View>

            <Text style={styles.headline}>
              One App.{'\n'}
              <Text style={styles.headlineGold}>Every Sound.</Text>
              {'\n'}
              <Text style={styles.headlineMuted}>Every Screen.</Text>
            </Text>

            <Text style={styles.catchphrase}>Watch. Listen. Africa.</Text>

            <Text style={styles.subtitle}>
              Music, movies, podcasts, and live sports — all in one subscription. Built for Nigeria. Made
              for the world.
            </Text>

            <View style={styles.modeToggle}>
              {(['listen', 'watch'] as const).map((mode) => {
                const active = demoMode === mode;
                return (
                  <Pressable
                    key={mode}
                    style={[styles.modeSegment, active && styles.modeSegmentActive]}
                    onPress={() => {
                      haptics.select();
                      setDemoMode(mode);
                    }}
                  >
                    <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>
                      {mode === 'listen' ? '🎧 Listen' : '📺 Watch'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.ctaRow}>
              <Pressable style={styles.goldButton} onPress={goToSignUp}>
                <Text style={styles.goldButtonLabel}>Start free trial</Text>
              </Pressable>
              <Pressable style={styles.ghostButtonLarge} onPress={() => scrollToY(contentWorldsY.current)}>
                <Text style={styles.ghostButtonLargeLabel}>Try the demo ↓</Text>
              </Pressable>
            </View>

            <NowPlayingBar />
          </View>
        </View>

        <View onLayout={captureY(contentWorldsY)}>
          <ContentWorldsSection />
        </View>
        <View onLayout={captureY(featuresY)}>
          <FeaturesSection stacked={isStacked} />
        </View>
        <View onLayout={captureY(pricingY)}>
          <PricingSection stacked={isStacked} />
        </View>
        <FooterSection />
      </ScrollView>
    </View>
  );
}

function PulsingDot() {
  const pulse = useRef(new Animated.Value(1)).current;

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

  return <Animated.View style={[styles.badgeDot, { opacity: pulse }]} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingLeft: 4, // clears the KenteStripe
  },
  heroWrap: {
    overflow: 'hidden',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 20,
    marginRight: 8,
  },
  navLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  ghostButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostButtonLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.text,
  },
  goldButtonSmall: {
    backgroundColor: colors.gold,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  goldButtonSmallLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.background,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderActive,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
  badgeLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.gold,
  },
  headline: {
    fontFamily: fonts.displayBlack,
    fontSize: 42,
    lineHeight: 48,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  headlineGold: {
    color: colors.gold,
  },
  headlineMuted: {
    color: colors.textMuted,
  },
  catchphrase: {
    fontFamily: fonts.displayBold,
    fontStyle: 'italic',
    fontSize: 18,
    color: colors.terracotta,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 340,
    marginBottom: 28,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.cardActive,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: 28,
  },
  modeSegment: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
  },
  modeSegmentActive: {
    backgroundColor: colors.gold,
  },
  modeLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  modeLabelActive: {
    color: colors.background,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  goldButton: {
    backgroundColor: colors.gold,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  goldButtonLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.background,
  },
  ghostButtonLarge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderActive,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  ghostButtonLargeLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.text,
  },
});
