import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

type IconName = keyof typeof Ionicons.glyphMap;

interface SettingsCardProps {
  icon: IconName;
  title: string;
  children: ReactNode;
}

/** A settings section: gold icon + white title above a rounded dark card. */
export function SettingsCard({ icon, title, children }: SettingsCardProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Ionicons name={icon} size={16} color={colors.gold} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

/** Thin divider between rows inside a SettingsCard. */
export function SettingsDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.settingsBorder,
    borderRadius: 16,
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.settingsBorder,
    marginVertical: 14,
  },
});
