import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Logo } from '../components/Logo';
import { haptics } from '../lib/haptics';
import type { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/useAuthStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email.trim() || !password) {
      setError('Enter an email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords don’t match.');
      return;
    }

    haptics.press();
    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);
    const result = await signUpWithEmail(email.trim(), password);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsEmailConfirmation) {
      // Supabase's default: no session until the confirmation link is clicked.
      setInfoMessage('Check your email to confirm your account, then sign in.');
      return;
    }
    // If email confirmation is off, a session comes back immediately and
    // RootNavigator swaps to the Tabs stack on its own — nothing more to do.
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 }]}>
        <View>
          <Pressable
            onPress={() => {
              haptics.tap();
              navigation.navigate('Landing');
            }}
          >
            <Logo size={24} style={styles.logo} />
          </Pressable>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Music, movies, podcasts, and live sport — one subscription.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}

          <Pressable style={styles.primaryButton} onPress={handleSignUp} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.primaryLabel}>Sign Up</Text>
            )}
          </Pressable>
        </View>

        <Pressable
          style={styles.footerLink}
          onPress={() => {
            haptics.tap();
            navigation.navigate('SignIn');
          }}
        >
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.footerTextBold}>Sign In</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 32,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 32,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.terracotta,
    marginBottom: 12,
  },
  infoText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.gold,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.background,
  },
  footerLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
  },
  footerTextBold: {
    color: colors.gold,
    fontFamily: fonts.bodySemiBold,
  },
});
