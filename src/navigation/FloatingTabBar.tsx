import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { haptics } from '../lib/haptics';
import { tabBarHidden } from '../lib/animatedUI';
import { colors } from '../theme/colors';
import { TAB_BAR_HEIGHT } from '../theme/layout';
import { fonts } from '../theme/typography';

const INDICATOR_WIDTH = 22;

type IconName = keyof typeof Ionicons.glyphMap;

const BASE_ICON: Record<string, string> = {
  Home: 'home',
  Search: 'search',
  Library: 'library',
  Downloads: 'download',
  Profile: 'person',
};

/**
 * Custom bottom-tabs `tabBar`: a docked, blurred bar that fades/slides out
 * on scroll-down via the shared `tabBarHidden` value (see useHideOnScroll),
 * with a gold indicator sliding between tabs.
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const tabWidth = barWidth / Math.max(state.routes.length, 1);

  useEffect(() => {
    if (barWidth === 0) return;
    indicatorX.value = withSpring(state.index * tabWidth + tabWidth / 2 - INDICATOR_WIDTH / 2, {
      damping: 16,
      stiffness: 180,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index, barWidth]);

  const wrapperStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tabBarHidden.value, [0, 1], [1, 0]),
    transform: [{ translateY: interpolate(tabBarHidden.value, [0, 1], [0, 48]) }],
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, { height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }, wrapperStyle]}
    >
      <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.tint} pointerEvents="none" />

      <View style={styles.row} onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const base = BASE_ICON[route.name] ?? 'ellipse';
          const iconName = `${base}${focused ? '' : '-outline'}` as IconName;

          const onPress = () => {
            haptics.select();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabBarButton
              key={route.key}
              focused={focused}
              iconName={iconName}
              label={route.name}
              onPress={onPress}
            />
          );
        })}
      </View>
      {barWidth > 0 && (
        <Animated.View
          style={[styles.indicator, { bottom: insets.bottom + 4 }, indicatorStyle]}
          pointerEvents="none"
        />
      )}
    </Animated.View>
  );
}

function TabBarButton({
  focused,
  iconName,
  label,
  onPress,
}: {
  focused: boolean;
  iconName: IconName;
  label: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(focused ? 1.12 : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.12 : 1, { damping: 14, stiffness: 200 });
  }, [focused, scale]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.tabButton} hitSlop={8}>
      <Animated.View style={iconStyle}>
        <Ionicons name={iconName} size={22} color={focused ? colors.gold : colors.textMuted} />
      </Animated.View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: colors.navBorder,
    overflow: 'hidden',
  },
  tint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.navSurface,
  },
  row: {
    flexDirection: 'row',
    paddingTop: 10,
    height: TAB_BAR_HEIGHT,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.gold,
  },
  indicator: {
    position: 'absolute',
    height: 3,
    width: INDICATOR_WIDTH,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
});
