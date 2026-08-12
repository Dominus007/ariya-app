import { Platform } from 'react-native';

/**
 * Brand type system: Playfair Display for anything editorial/headline
 * (titles, hero copy, artist names, section headings), DM Sans for
 * everything functional (body copy, labels, navigation).
 *
 * Each weight is its own font file/family name — see App.tsx's useFonts
 * call, which must load exactly these family names before any screen using
 * them renders.
 *
 * On web only, a system fallback is appended after the real family name —
 * CSS font-family fallback lets the browser substitute Georgia/system-ui if
 * the Google Fonts @font-face ever fails to load, instead of falling back to
 * a blank/invisible glyph. This can't be done on native: iOS/Android expect
 * `fontFamily` to be exactly one PostScript name, and a comma-separated list
 * there would just fail to resolve any font at all.
 */
const withWebFallback = (fontFamily: string, fallback: string) =>
  Platform.OS === 'web' ? `${fontFamily}, ${fallback}` : fontFamily;

const DISPLAY_FALLBACK = 'Georgia, serif';
const BODY_FALLBACK = 'system-ui, sans-serif';

export const fonts = {
  displayBold: withWebFallback('PlayfairDisplay_700Bold', DISPLAY_FALLBACK),
  displayExtraBold: withWebFallback('PlayfairDisplay_800ExtraBold', DISPLAY_FALLBACK),
  displayBlack: withWebFallback('PlayfairDisplay_900Black', DISPLAY_FALLBACK),
  bodyRegular: withWebFallback('DMSans_400Regular', BODY_FALLBACK),
  bodyMedium: withWebFallback('DMSans_500Medium', BODY_FALLBACK),
  bodySemiBold: withWebFallback('DMSans_600SemiBold', BODY_FALLBACK),
};
