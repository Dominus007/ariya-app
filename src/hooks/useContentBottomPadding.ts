import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePlayerStore } from '../store/usePlayerStore';
import { MINI_PLAYER_HEIGHT, SIDEBAR_BREAKPOINT, TAB_BAR_HEIGHT } from '../theme/layout';

/**
 * Bottom padding for scrollable screen content, so the last row/card always
 * clears whatever's docked at the bottom: the tab bar (mobile layout only —
 * the sidebar layout has none), plus the mini player above it whenever
 * something's queued. Mirrors TabNavigator's own mobile-vs-sidebar and
 * mini-player-visibility logic, so screens don't need to know about either.
 */
export function useContentBottomPadding(extra = 20) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const hasCurrentTrack = usePlayerStore((state) => !!state.current());
  const isWide = width >= SIDEBAR_BREAKPOINT;

  const tabBarSpace = isWide ? 0 : insets.bottom + TAB_BAR_HEIGHT;
  const miniPlayerSpace = hasCurrentTrack ? MINI_PLAYER_HEIGHT : 0;

  return tabBarSpace + miniPlayerSpace + extra;
}
