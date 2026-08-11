/**
 * Brand type system: Playfair Display for anything editorial/headline
 * (titles, hero copy, artist names, section headings), DM Sans for
 * everything functional (body copy, labels, navigation).
 *
 * Each weight is its own font file/family name — see App.tsx's useFonts
 * call, which must load exactly these family names before any screen using
 * them renders.
 */
export const fonts = {
  displayBold: 'PlayfairDisplay_700Bold',
  displayExtraBold: 'PlayfairDisplay_800ExtraBold',
  displayBlack: 'PlayfairDisplay_900Black',
  bodyRegular: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
};
