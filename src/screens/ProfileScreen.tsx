import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePaystack } from 'react-native-paystack-webview';

import { haptics } from '../lib/haptics';
import { useAuthStore } from '../store/useAuthStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const MONTHLY_SUBSCRIPTION_NAIRA = 3500;

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const isSubscribed = useAuthStore((state) => state.isSubscribed);
  const setSubscribed = useAuthStore((state) => state.setSubscribed);
  const signOut = useAuthStore((state) => state.signOut);
  const { popup } = usePaystack();
  const [isPaying, setIsPaying] = useState(false);

  const handleSubscribe = () => {
    if (!user?.email) {
      Alert.alert('Sign in required', 'Sign in with an email first to start a subscription.');
      return;
    }

    haptics.press();
    setIsPaying(true);
    popup.checkout({
      email: user.email,
      amount: MONTHLY_SUBSCRIPTION_NAIRA,
      reference: `ariya_${user.id}_${Date.now()}`,
      onSuccess: () => {
        // TODO: verify the transaction server-side (Supabase edge function calling
        // Paystack's /transaction/verify) before trusting this client-side event.
        setIsPaying(false);
        setSubscribed(true);
        haptics.success();
        Alert.alert('Welcome to Ariya+', 'Your subscription is active.');
      },
      onCancel: () => setIsPaying(false),
      onError: () => {
        setIsPaying(false);
        Alert.alert('Payment failed', 'Please try again.');
      },
    });
  };

  const handleSignOut = () => {
    haptics.tap();
    signOut();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 76 }]}>
      <Text style={styles.heading}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.value}>{user?.email ?? 'Not signed in'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Subscription</Text>
        <Text style={styles.value}>{isSubscribed ? 'Ariya+ (active)' : 'Free'}</Text>
        {!isSubscribed && (
          <Pressable style={styles.subscribeButton} onPress={handleSubscribe} disabled={isPaying}>
            {isPaying ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.subscribeText}>
                Subscribe — ₦{MONTHLY_SUBSCRIPTION_NAIRA.toLocaleString()}/mo
              </Text>
            )}
          </Pressable>
        )}
      </View>

      {user && (
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  heading: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 28,
    color: colors.text,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.bodyRegular,
    color: colors.textMuted,
    fontSize: 13,
  },
  value: {
    fontFamily: fonts.bodySemiBold,
    color: colors.text,
    fontSize: 16,
    marginTop: 4,
  },
  subscribeButton: {
    marginTop: 12,
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  subscribeText: {
    fontFamily: fonts.bodySemiBold,
    color: colors.background,
    fontSize: 14,
  },
  signOutButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signOutText: {
    fontFamily: fonts.bodySemiBold,
    color: colors.textMuted,
    fontSize: 14,
  },
});
