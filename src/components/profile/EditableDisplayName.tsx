import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { haptics } from '../../lib/haptics';
import { useUpdateDisplayName } from '../../hooks/useProfile';
import { validateDisplayName } from '../../services/profile';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

/** Tappable display name — switches to an inline text field with gold checkmark / grey cancel on tap. */
export function EditableDisplayName({ name }: { name: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const updateDisplayName = useUpdateDisplayName();

  const startEditing = () => {
    haptics.tap();
    setDraft(name);
    setEditing(true);
  };

  const cancel = () => {
    haptics.tap();
    setEditing(false);
  };

  const save = async () => {
    const validationError = validateDisplayName(draft);
    if (validationError) {
      Alert.alert('Invalid name', validationError);
      return;
    }

    haptics.press();
    try {
      await updateDisplayName.mutateAsync(draft);
      haptics.success();
      setEditing(false);
    } catch (error) {
      Alert.alert('Could not update name', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  if (editing) {
    return (
      <View style={styles.editRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          autoFocus
          maxLength={30}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          editable={!updateDisplayName.isPending}
        />
        {updateDisplayName.isPending ? (
          <ActivityIndicator color={colors.gold} style={styles.spinner} />
        ) : (
          <>
            <Pressable onPress={save} hitSlop={8}>
              <Ionicons name="checkmark-circle" size={26} color={colors.gold} />
            </Pressable>
            <Pressable onPress={cancel} hitSlop={8}>
              <Ionicons name="close-circle" size={26} color={colors.textMuted} />
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <Pressable onPress={startEditing} style={styles.nameRow} hitSlop={4}>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Ionicons name="pencil" size={14} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontFamily: fonts.displayExtraBold,
    fontSize: 20,
    color: colors.text,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: fonts.displayExtraBold,
    fontSize: 18,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold,
    paddingVertical: 2,
  },
  spinner: {
    marginLeft: 4,
  },
});
