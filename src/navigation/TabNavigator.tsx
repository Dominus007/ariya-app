import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KenteStripe } from '../components/KenteStripe';
import { MiniPlayerBar } from '../components/MiniPlayerBar';
import { ModeToggle } from '../components/ModeToggle';
import { PlaybackEngine } from '../components/PlaybackEngine';
import { Sidebar } from '../components/Sidebar';
import { DownloadsScreen } from '../screens/DownloadsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { usePlayerStore } from '../store/usePlayerStore';
import { SIDEBAR_BREAKPOINT, TAB_BAR_HEIGHT } from '../theme/layout';
import { FloatingTabBar } from './FloatingTabBar';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Hosts the four tabs, switching between a mobile layout (docked
 * FloatingTabBar) and a tablet/web layout (left Sidebar) at
 * SIDEBAR_BREAKPOINT — plus everything that needs to persist across that
 * switch and across tab changes: the audio engine, the mini player bar, and
 * the Watch/Listen toggle.
 */
export function TabNavigator() {
  const { width } = useWindowDimensions();
  const isWide = width >= SIDEBAR_BREAKPOINT;

  return isWide ? <WideLayout /> : <MobileLayout />;
}

function MobileLayout() {
  const insets = useSafeAreaInsets();
  const current = usePlayerStore((state) => state.current());

  return (
    <View style={styles.fill}>
      <PlaybackEngine />
      <KenteStripe />

      <Tab.Navigator
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Library" component={LibraryScreen} />
        <Tab.Screen name="Downloads" component={DownloadsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      <View pointerEvents="box-none" style={[styles.toggleOverlay, { top: insets.top + 8 }]}>
        <ModeToggle />
      </View>

      {current && <MiniPlayerBar bottomOffset={insets.bottom + TAB_BAR_HEIGHT} />}
    </View>
  );
}

// React Navigation's bottom-tabs always docks its `tabBar` slot below the
// screen content, so a left-hand Sidebar can't be that slot — this layout
// renders the four screens directly instead, switching on local state.
function WideLayout() {
  const insets = useSafeAreaInsets();
  const current = usePlayerStore((state) => state.current());
  const [activeRoute, setActiveRoute] = useState<keyof TabParamList>('Home');

  return (
    <View style={styles.wideRow}>
      <PlaybackEngine />
      <Sidebar activeRoute={activeRoute} onNavigate={(route) => setActiveRoute(route as keyof TabParamList)} />

      <View style={styles.wideContent}>
        <KenteStripe />

        {activeRoute === 'Home' && <HomeScreen />}
        {activeRoute === 'Search' && <SearchScreen />}
        {activeRoute === 'Library' && <LibraryScreen />}
        {activeRoute === 'Downloads' && <DownloadsScreen />}
        {activeRoute === 'Profile' && <ProfileScreen />}

        <View pointerEvents="box-none" style={[styles.toggleOverlay, { top: insets.top + 8 }]}>
          <ModeToggle />
        </View>

        {current && <MiniPlayerBar bottomOffset={0} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  wideRow: {
    flex: 1,
    flexDirection: 'row',
  },
  wideContent: {
    flex: 1,
  },
  toggleOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
});
