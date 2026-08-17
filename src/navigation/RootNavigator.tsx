import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LandingScreen } from '../screens/LandingScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { ShortsPlayerScreen } from '../screens/ShortsPlayerScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { useAuthStore } from '../store/useAuthStore';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Splash → Landing → SignIn/SignUp → Tabs, gated purely on session state
 * (not imperative navigation calls): while the initial session check is in
 * flight, render the Splash screen directly; once it resolves, register
 * either the signed-out screens (Landing first, matching "every signed-out
 * visitor sees the marketing page first") or the signed-in ones. Signing in
 * or out elsewhere in the app just updates useAuthStore — this re-renders
 * and swaps which screens exist, so there's no stale "back" into a
 * protected screen after sign-out (and signing out lands back on Landing).
 */
export function RootNavigator() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const session = useAuthStore((state) => state.session);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen
            name="Player"
            component={PlayerScreen}
            options={{
              // Transparent so the tab screen stays visible behind the sheet's
              // rounded top corners during the slide; PlayerScreen implements
              // its own drag-to-dismiss instead of the native swipe gesture.
              presentation: 'transparentModal',
              animation: 'slide_from_bottom',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="ShortsPlayer"
            component={ShortsPlayerScreen}
            options={{
              // A true full-screen cover (not the rounded transparent sheet
              // Player uses) — Shorts are edge-to-edge vertical video, and
              // it owns its own up/down swipe gesture instead of the
              // native dismiss swipe.
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
              gestureEnabled: false,
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
