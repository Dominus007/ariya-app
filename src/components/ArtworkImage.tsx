import { useState } from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '../theme/colors';

interface ArtworkImageProps {
  /** MediaItem.artworkUrl — undefined/empty renders the emoji fallback directly. */
  uri: string | undefined;
  /** Shown centered whenever there's no URL, or the image fails to load. */
  emoji: string;
  /** Sizing/border-radius — applied to the container, which is what actually gets clipped. */
  style: StyleProp<ViewStyle>;
  emojiFontSize?: number;
}

/**
 * Content artwork (track/movie/podcast thumbnails) — loads the real image
 * from Supabase's artwork_url when present. The container keeps a dark
 * background for the entire lifetime of the component, so it reads as a
 * placeholder before the image finishes loading without needing `Image`'s
 * `defaultSource` prop (unreliable on web/Android — this works identically
 * on every platform instead). Falls back to the item's emoji if there's no
 * URL at all, or if the image request fails.
 *
 * This is specifically for real content artwork — decorative/icon emoji
 * elsewhere in the app (nav icons, section eyebrows, etc.) aren't this.
 */
export function ArtworkImage({ uri, emoji, style, emojiFontSize = 28 }: ArtworkImageProps) {
  const [failed, setFailed] = useState(false);
  const showEmoji = !uri || failed;

  return (
    <View style={[styles.container, style]}>
      {!showEmoji ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={{ fontSize: emojiFontSize }}>{emoji}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
