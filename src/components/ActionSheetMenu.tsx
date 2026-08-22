import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { haptics } from '../lib/haptics';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export interface ActionSheetItem {
  key: string;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  /** Marks the currently-selected item (e.g. the active output device) with a checkmark. */
  selected?: boolean;
  destructive?: boolean;
}

/**
 * Generic bottom action sheet — a title, an optional subtitle, and a list of
 * icon rows. Used for the Player's three-dot menu, the connect-device
 * picker, and the queue/menu affordances added alongside it. No bottom-sheet
 * library in the project, so this is a plain RN Modal with slide animation
 * (native on iOS/Android; react-native-web renders Modal as a fixed-position
 * overlay, so this also works under `expo export --platform web`).
 */
export function ActionSheetMenu({
  visible,
  title,
  subtitle,
  items,
  onClose,
}: {
  visible: boolean;
  title?: string;
  subtitle?: string;
  items: ActionSheetItem[];
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.grabber} />
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {items.map((item) => (
          <Pressable
            key={item.key}
            style={styles.row}
            onPress={() => {
              haptics.tap();
              item.onPress();
            }}
          >
            <Ionicons name={item.icon} size={20} color={item.destructive ? colors.terracotta : colors.text} />
            <Text style={[styles.rowLabel, item.destructive && styles.rowLabelDestructive]}>{item.label}</Text>
            {item.selected ? <Ionicons name="checkmark" size={18} color={colors.gold} /> : null}
          </Pressable>
        ))}

        <Pressable style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelLabel}>Cancel</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.settingsBorder,
  },
  rowLabel: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.text,
  },
  rowLabelDestructive: {
    color: colors.terracotta,
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.textMuted,
  },
});
