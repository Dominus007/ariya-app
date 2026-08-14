import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { haptics } from '../../lib/haptics';
import { useUploadAvatar } from '../../hooks/useProfile';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

const AVATAR_SIZE = 56;

/** Tappable avatar circle — opens an action sheet to take/choose a photo, uploads it, shows a small camera badge. */
export function AvatarPicker({ avatarUrl }: { avatarUrl: string | null }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const uploadAvatar = useUploadAvatar();

  const openMenu = () => {
    haptics.tap();
    setMenuVisible(true);
  };

  const closeMenu = () => setMenuVisible(false);

  const handlePick = async (source: 'camera' | 'library') => {
    closeMenu();
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission needed',
          `Ariya needs ${source === 'camera' ? 'camera' : 'photo library'} access to set a profile picture.`
        );
        return;
      }

      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(pickerOptions)
          : await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (result.canceled || !result.assets[0]) return;

      haptics.press();
      await uploadAvatar.mutateAsync({ uri: result.assets[0].uri, mimeType: result.assets[0].mimeType });
      haptics.success();
    } catch (error) {
      Alert.alert('Upload failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <>
      <Pressable onPress={openMenu} style={styles.wrap} hitSlop={4}>
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <Ionicons name="headset" size={28} color={colors.textMuted} />
          )}
          {uploadAvatar.isPending ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={colors.gold} />
            </View>
          ) : null}
        </View>
        <View style={styles.cameraBadge}>
          <Ionicons name="camera" size={12} color={colors.background} />
        </View>
      </Pressable>

      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Update profile picture</Text>

            <Pressable
              style={styles.sheetOption}
              onPress={() => {
                haptics.select();
                handlePick('camera');
              }}
            >
              <Ionicons name="camera-outline" size={20} color={colors.text} />
              <Text style={styles.sheetOptionLabel}>Take Photo</Text>
            </Pressable>
            <View style={styles.sheetDivider} />
            <Pressable
              style={styles.sheetOption}
              onPress={() => {
                haptics.select();
                handlePick('library');
              }}
            >
              <Ionicons name="images-outline" size={20} color={colors.text} />
              <Text style={styles.sheetOptionLabel}>Choose from Library</Text>
            </Pressable>
            <View style={styles.sheetDivider} />
            <Pressable
              style={styles.sheetOption}
              onPress={() => {
                haptics.tap();
                closeMenu();
              }}
            >
              <Text style={[styles.sheetOptionLabel, styles.cancelLabel]}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.cardActive,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  sheetTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  sheetOptionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.text,
  },
  cancelLabel: {
    color: colors.textMuted,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: colors.settingsBorder,
  },
});
