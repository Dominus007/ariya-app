import { Text, type TextStyle } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

interface LogoProps {
  size?: number;
  /** Color of "Ariya" itself — the trailing dot is always gold, never overridable. */
  color?: string;
  style?: TextStyle;
}

/**
 * The Ariya wordmark — "Ariya" immediately followed by a gold "." (no
 * space), always Playfair Display 800. This is the single source of truth
 * for the logo: every place it appears (nav bars, splash, auth screens,
 * footer) should render this component rather than its own "Ariya" text,
 * so the dot can never accidentally end up white/grey/anything but gold.
 */
export function Logo({ size = 20, color = colors.text, style }: LogoProps) {
  return (
    <Text style={[{ fontFamily: fonts.displayExtraBold, fontSize: size, color }, style]}>
      Ariya
      <Text style={{ color: colors.gold }}>.</Text>
    </Text>
  );
}
