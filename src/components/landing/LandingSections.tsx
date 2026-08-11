import { StyleSheet, Text, View } from 'react-native';

import { Logo } from '../Logo';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

const WORLDS = [
  { emoji: '🌍', title: 'Africa', description: 'Afrobeats, Nollywood, and the sounds shaping a continent.' },
  { emoji: '🎬', title: 'Hollywood', description: 'Blockbusters and originals from the biggest studios.' },
  { emoji: '🎭', title: 'Bollywood', description: 'Music, drama, and spectacle from Mumbai.' },
  { emoji: '🎌', title: 'Korean & Asian', description: 'K-Drama, K-Pop, and stories from across Asia.' },
];

export function ContentWorldsSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Every World, One App</Text>
      <View style={styles.worldGrid}>
        {WORLDS.map((world) => (
          <View key={world.title} style={styles.worldCard}>
            <Text style={styles.worldEmoji}>{world.emoji}</Text>
            <Text style={styles.worldTitle}>{world.title}</Text>
            <Text style={styles.worldDescription}>{world.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const LISTEN_FEATURES = [
  'Unlimited Afrobeats & African music',
  'Nigerian & African podcasts',
  'Offline downloads',
  'Lyrics & smart queue',
];
const WATCH_FEATURES = [
  'Nollywood, Hollywood, Bollywood, K-Drama',
  'Live sports — football, basketball & more',
  'HD & 4K streaming',
  'Watch parties (coming soon)',
];

export function FeaturesSection({ stacked }: { stacked: boolean }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Two Modes, One Subscription</Text>
      <View style={[styles.columns, stacked && styles.columnsStacked]}>
        <View style={styles.column}>
          <Text style={styles.columnEyebrow}>🎧 LISTEN MODE</Text>
          {LISTEN_FEATURES.map((feature) => (
            <FeatureRow key={feature} text={feature} />
          ))}
        </View>
        <View style={styles.column}>
          <Text style={[styles.columnEyebrow, styles.watchEyebrow]}>📺 WATCH MODE</Text>
          {WATCH_FEATURES.map((feature) => (
            <FeatureRow key={feature} text={feature} />
          ))}
        </View>
      </View>
    </View>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureCheck}>✓</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const PLANS = [
  {
    name: 'Basic',
    price: '₦1,500',
    features: ['Listen Mode only', 'Standard audio quality', '1 device'],
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '₦3,500',
    features: ['Listen + Watch Mode', 'HD streaming', '2 devices', 'Offline downloads'],
    highlighted: true,
  },
  {
    name: 'Family',
    price: '₦6,000',
    features: ['Everything in Premium', 'Up to 5 profiles', '4K streaming', 'Live sports included'],
    highlighted: false,
  },
];

export function PricingSection({ stacked }: { stacked: boolean }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Simple, Honest Pricing</Text>
      <View style={[styles.plans, stacked && styles.plansStacked]}>
        {PLANS.map((plan) => (
          <View key={plan.name} style={[styles.planCard, plan.highlighted && styles.planCardHighlighted]}>
            {plan.highlighted ? <Text style={styles.planBadge}>MOST POPULAR</Text> : null}
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.planPriceRow}>
              <Text style={styles.planPrice}>{plan.price}</Text>
              <Text style={styles.planPeriod}>/mo</Text>
            </View>
            {plan.features.map((feature) => (
              <FeatureRow key={feature} text={feature} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export function FooterSection() {
  return (
    <View style={styles.footer}>
      <Logo size={22} style={styles.footerLogo} />
      <Text style={styles.footerTagline}>Watch. Listen. Africa.</Text>
      <Text style={styles.footerCopyright}>© {new Date().getFullYear()} Ariya. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  sectionTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },

  // Content Worlds
  worldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  worldCard: {
    width: '46%',
    backgroundColor: colors.cardSurface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  worldEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  worldTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  worldDescription: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Features
  columns: {
    flexDirection: 'row',
    gap: 16,
  },
  columnsStacked: {
    flexDirection: 'column',
  },
  column: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
  },
  columnEyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.gold,
    marginBottom: 14,
  },
  watchEyebrow: {
    color: colors.terracotta,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  featureCheck: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.gold,
  },
  featureText: {
    flex: 1,
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Pricing
  plans: {
    flexDirection: 'row',
    gap: 14,
  },
  plansStacked: {
    flexDirection: 'column',
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
  },
  planCardHighlighted: {
    borderColor: colors.borderActive,
    backgroundColor: colors.cardActive,
  },
  planBadge: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.6,
    color: colors.gold,
    marginBottom: 8,
  },
  planName: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  planPrice: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 28,
    color: colors.gold,
  },
  planPeriod: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 4,
  },

  // Footer
  footer: {
    paddingVertical: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLogo: {
    marginBottom: 12,
  },
  footerTagline: {
    fontFamily: fonts.displayBold,
    fontStyle: 'italic',
    fontSize: 16,
    color: colors.gold,
    marginBottom: 10,
  },
  footerCopyright: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
