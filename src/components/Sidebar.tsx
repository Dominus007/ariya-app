import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { haptics } from '../lib/haptics';
import { Logo } from './Logo';
import { colors } from '../theme/colors';
import { SIDEBAR_WIDTH } from '../theme/layout';
import { fonts } from '../theme/typography';

type IconName = keyof typeof Ionicons.glyphMap;

interface NavItem {
  route: string;
  label: string;
  icon: string;
}

const SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Browse',
    items: [
      { route: 'Home', label: 'Home', icon: 'home' },
      { route: 'Search', label: 'Search', icon: 'search' },
      { route: 'Library', label: 'Library', icon: 'library' },
    ],
  },
  {
    label: 'Account',
    items: [{ route: 'Profile', label: 'Profile', icon: 'person' }],
  },
];

/** Left nav shown instead of the bottom tab bar at tablet/web widths (see TabNavigator). */
export function Sidebar({
  activeRoute,
  onNavigate,
}: {
  activeRoute: string;
  onNavigate: (route: string) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <Logo size={20} style={styles.brand} />
      {SECTIONS.map((section) => (
        <View key={section.label} style={styles.section}>
          <Text style={styles.sectionLabel}>{section.label.toUpperCase()}</Text>
          {section.items.map((item) => {
            const active = activeRoute === item.route;
            const iconName = `${item.icon}${active ? '' : '-outline'}` as IconName;
            return (
              <Pressable
                key={item.route}
                style={[styles.navItem, active && styles.navItemActive]}
                onPress={() => {
                  haptics.select();
                  onNavigate(item.route);
                }}
              >
                <Ionicons name={iconName} size={16} color={active ? colors.gold : colors.textMuted} />
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderRightColor: colors.navBorder,
    paddingHorizontal: 16,
  },
  brand: {
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.8, // 0.08em at 10px
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 2,
  },
  navItemActive: {
    backgroundColor: colors.goldTint,
  },
  navLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  navLabelActive: {
    color: colors.gold,
  },
});
