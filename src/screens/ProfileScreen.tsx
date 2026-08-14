import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePaystack } from 'react-native-paystack-webview';
import { useQueryClient } from '@tanstack/react-query';

import { AvatarPicker } from '../components/profile/AvatarPicker';
import { EditableDisplayName } from '../components/profile/EditableDisplayName';
import { SegmentedControl } from '../components/profile/SegmentedControl';
import { SettingsCard, SettingsDivider } from '../components/profile/SettingsCard';
import { ToggleRow } from '../components/profile/ToggleRow';
import { useContentBottomPadding } from '../hooks/useContentBottomPadding';
import { haptics } from '../lib/haptics';
import type { Language, QualityLevel } from '../services/preferences';
import type { ActiveSubscription, SubscriptionTier } from '../services/subscriptions';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useActiveSubscription } from '../hooks/useSubscription';
import { useProfileRecord } from '../hooks/useProfile';
import { useUpdatePreferences, useUserPreferences } from '../hooks/useUserPreferences';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

// A first-time subscribe defaults to the Family tier shown in the header
// example. BEFORE_LAUNCH_TODO: let the user pick a tier (see the Landing
// page's pricing section) instead of hardcoding one here.
const DEFAULT_TIER: SubscriptionTier = 'family';
// Paystack's popup.checkout `amount` is Naira-only — matches the Landing
// page's Family plan price exactly. Global is USD (see TIER_PRICE_DISPLAY
// below) and can't be charged through this same Naira checkout flow yet.
const DEFAULT_TIER_PRICE_NAIRA = 3500;

const TIER_LABEL: Record<SubscriptionTier, string> = {
  nigeria: 'NIGERIA TIER',
  family: 'FAMILY TIER',
  global: 'GLOBAL TIER',
};

// Mirrors the Landing page's pricing section exactly (src/components/landing/LandingSections.tsx).
const TIER_PRICE_DISPLAY: Record<SubscriptionTier, string> = {
  nigeria: '₦1,500',
  family: '₦3,500',
  global: '$5.99',
};

/** Naira tiers can show the DB's stored amount_naira (may differ from current
 * pricing for grandfathered subscribers); Global is USD, so amount_naira never applies. */
function formatSubscriptionPrice(subscription: ActiveSubscription): string {
  if (subscription.tier === 'global') return TIER_PRICE_DISPLAY.global;
  if (subscription.amountNaira != null) return `₦${subscription.amountNaira.toLocaleString()}`;
  return TIER_PRICE_DISPLAY[subscription.tier];
}

const QUALITY_OPTIONS: { label: string; value: QualityLevel }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const LANGUAGE_OPTIONS: { label: string; value: Language }[] = [
  { label: 'English', value: 'english' },
  { label: 'Yoruba', value: 'yoruba' },
  { label: 'Hausa', value: 'hausa' },
  { label: 'Igbo', value: 'igbo' },
  { label: 'Pidgin', value: 'pidgin' },
];

function formatRenewalDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Real display name from the auth user — falls back to the email's local part, capitalized. */
function deriveDisplayName(email: string | undefined, metadata: Record<string, unknown> | undefined): string {
  const metaName = (metadata?.full_name ?? metadata?.name) as string | undefined;
  if (metaName && metaName.trim()) return metaName.trim();
  const prefix = email?.split('@')[0] ?? 'there';
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const { popup } = usePaystack();
  const queryClient = useQueryClient();

  const { data: activeSubscription } = useActiveSubscription();
  const { data: preferences } = useUserPreferences();
  const { data: profileRecord } = useProfileRecord();
  const updatePreferences = useUpdatePreferences();
  const bottomPadding = useContentBottomPadding(20);

  const [isPaying, setIsPaying] = useState(false);

  // Explicit supabase.auth.getUser() call + log, per request — lets you
  // confirm in the browser console that real Supabase user data is flowing
  // into this screen (separate from useAuthStore's cached session user above).
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.log('[ProfileScreen] supabase.auth.getUser() error:', error);
      } else {
        console.log('[ProfileScreen] supabase.auth.getUser() ->', data.user);
      }
    });
  }, []);

  // profiles.display_name (set via the editable name below) wins once a user
  // has customized it; otherwise fall back to auth metadata / email prefix.
  const displayName = profileRecord?.displayName || deriveDisplayName(user?.email, user?.user_metadata);
  const renewalDate = formatRenewalDate(activeSubscription?.currentPeriodEnd ?? null);

  const handleSubscribe = () => {
    if (!user?.email) {
      Alert.alert('Sign in required', 'Sign in with an email first to start a subscription.');
      return;
    }

    haptics.press();
    setIsPaying(true);
    popup.checkout({
      email: user.email,
      amount: DEFAULT_TIER_PRICE_NAIRA,
      reference: `ariya_${user.id}_${Date.now()}`,
      onSuccess: () => {
        // BEFORE_LAUNCH_TODO: verify the transaction server-side (a Supabase
        // edge function calling Paystack's /transaction/verify) and have
        // *that* insert the `subscriptions` row via service_role — the app
        // deliberately has no client-side insert policy on that table, so
        // this success callback can't (and shouldn't) write the row itself.
        setIsPaying(false);
        haptics.success();
        queryClient.invalidateQueries({ queryKey: ['subscription', user.id] });
        Alert.alert('Payment received', "Your subscription will activate shortly — we're confirming it now.");
      },
      onCancel: () => setIsPaying(false),
      onError: () => {
        setIsPaying(false);
        Alert.alert('Payment failed', 'Please try again.');
      },
    });
  };

  const handleManageSubscription = () => {
    if (activeSubscription) {
      haptics.tap();
      Alert.alert(
        'Manage subscription',
        `You're on the ${TIER_LABEL[activeSubscription.tier]} plan. Full self-service management via Paystack is coming soon — contact support to change or cancel for now.`
      );
      return;
    }
    handleSubscribe();
  };

  const handleSignOut = () => {
    haptics.tap();
    signOut();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 76, paddingBottom: bottomPadding }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header card */}
      <View style={styles.headerCard}>
        <AvatarPicker avatarUrl={profileRecord?.avatarUrl ?? null} />
        <View style={styles.headerText}>
          <EditableDisplayName name={displayName} />
          <Text style={styles.email} numberOfLines={1}>
            {user?.email ?? 'Not signed in'}
          </Text>
          <View style={[styles.tierBadge, activeSubscription ? styles.tierBadgeActive : styles.tierBadgeFree]}>
            <Text style={[styles.tierBadgeText, activeSubscription ? styles.tierBadgeTextActive : styles.tierBadgeTextFree]}>
              {activeSubscription ? TIER_LABEL[activeSubscription.tier] : 'FREE TIER'}
            </Text>
          </View>
        </View>
      </View>

      {/* Manage subscription row */}
      <Pressable style={styles.subscriptionRow} onPress={handleManageSubscription} disabled={isPaying}>
        <View style={styles.subscriptionText}>
          <Text style={styles.subscriptionTitle}>Manage subscription</Text>
          <Text style={styles.subscriptionSubtitle}>
            {isPaying
              ? 'Opening checkout…'
              : activeSubscription
                ? `${formatSubscriptionPrice(activeSubscription)}/month${
                    renewalDate ? ` · renews ${renewalDate}` : ''
                  } · Paystack`
                : 'Manage your plan · ₦1,500/mo Nigeria · $5.99/mo Global'}
          </Text>
        </View>
        {isPaying ? (
          <ActivityIndicator color={colors.gold} />
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        )}
      </Pressable>
      <View style={styles.divider} />

      {/* Download quality */}
      <SettingsCard icon="download-outline" title="Download quality">
        <SegmentedControl
          options={QUALITY_OPTIONS}
          value={preferences?.downloadQuality ?? 'medium'}
          onChange={(downloadQuality) => updatePreferences.mutate({ downloadQuality })}
        />
      </SettingsCard>

      {/* Streaming quality */}
      <SettingsCard icon="wifi-outline" title="Streaming quality">
        <SegmentedControl
          options={QUALITY_OPTIONS}
          value={preferences?.streamingQuality ?? 'medium'}
          onChange={(streamingQuality) => updatePreferences.mutate({ streamingQuality })}
        />
      </SettingsCard>

      {/* Notifications */}
      <SettingsCard icon="notifications-outline" title="Notifications">
        <ToggleRow
          label="New release from a followed artist"
          value={preferences?.notificationsNewRelease ?? true}
          onChange={(notificationsNewRelease) => updatePreferences.mutate({ notificationsNewRelease })}
        />
        <SettingsDivider />
        <ToggleRow
          label="Live sport starting in 30 minutes"
          value={preferences?.notificationsLiveSport ?? true}
          onChange={(notificationsLiveSport) => updatePreferences.mutate({ notificationsLiveSport })}
        />
        <SettingsDivider />
        <ToggleRow
          label="New episode from a subscribed show"
          value={preferences?.notificationsNewEpisode ?? false}
          onChange={(notificationsNewEpisode) => updatePreferences.mutate({ notificationsNewEpisode })}
        />
        <SettingsDivider />
        <ToggleRow
          label="Subscription renewal reminder"
          value={preferences?.notificationsRenewalReminder ?? true}
          onChange={(notificationsRenewalReminder) => updatePreferences.mutate({ notificationsRenewalReminder })}
        />
      </SettingsCard>

      {/* Language */}
      <SettingsCard icon="globe-outline" title="Language">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.languageRow}>
          {LANGUAGE_OPTIONS.map((option) => {
            const active = (preferences?.language ?? 'english') === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.languagePill, active && styles.languagePillActive]}
                onPress={() => {
                  if (!active) haptics.select();
                  updatePreferences.mutate({ language: option.value });
                }}
              >
                <Text style={[styles.languagePillText, active && styles.languagePillTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </SettingsCard>

      {user && (
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      )}

      <Text style={styles.version}>Ariya v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
  },

  // Header card
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.cardActive,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
  },
  email: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
    marginBottom: 8,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    borderRadius: 100,
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  tierBadgeActive: {
    backgroundColor: colors.goldTint,
    borderColor: colors.gold,
  },
  tierBadgeFree: {
    backgroundColor: colors.background,
    borderColor: colors.settingsBorder,
  },
  tierBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  tierBadgeTextActive: {
    color: colors.gold,
  },
  tierBadgeTextFree: {
    color: colors.textMuted,
  },

  // Manage subscription row
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  subscriptionText: {
    flex: 1,
  },
  subscriptionTitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  subscriptionSubtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.settingsBorder,
    marginBottom: 20,
  },

  // Language
  languageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  languagePill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.settingsBorder,
  },
  languagePillActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  languagePillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  languagePillTextActive: {
    color: colors.background,
    fontFamily: fonts.bodySemiBold,
  },

  // Footer
  signOutButton: {
    marginTop: 4,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.terracotta,
    borderRadius: 12,
  },
  signOutText: {
    fontFamily: fonts.bodySemiBold,
    color: colors.terracotta,
    fontSize: 14,
  },
  version: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
});
