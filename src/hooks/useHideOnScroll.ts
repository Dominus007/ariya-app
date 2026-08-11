import { useAnimatedScrollHandler, useSharedValue, withTiming } from 'react-native-reanimated';

import { tabBarHidden } from '../lib/animatedUI';

const DIRECTION_THRESHOLD = 8; // px of scroll before committing to a direction, avoids jitter
const ALWAYS_SHOW_NEAR_TOP = 24;

/**
 * Wire this hook's returned handler to a scrollable screen's `onScroll` to
 * drive the floating tab bar's fade/slide via the shared `tabBarHidden`
 * value — scrolling down hides it, scrolling up (or being near the top)
 * brings it back.
 */
export function useHideOnScroll() {
  const lastY = useSharedValue(0);

  return useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      const delta = y - lastY.value;

      if (y <= ALWAYS_SHOW_NEAR_TOP) {
        tabBarHidden.value = withTiming(0, { duration: 220 });
      } else if (delta > DIRECTION_THRESHOLD) {
        tabBarHidden.value = withTiming(1, { duration: 220 });
      } else if (delta < -DIRECTION_THRESHOLD) {
        tabBarHidden.value = withTiming(0, { duration: 220 });
      }

      lastY.value = y;
    },
  });
}
