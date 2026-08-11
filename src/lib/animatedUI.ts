import { makeMutable } from 'react-native-reanimated';

/**
 * App-lifetime shared values for cross-component UI state driven by scroll.
 *
 * These live outside React (via `makeMutable`, not `useSharedValue`) so any
 * scrollable screen can update them from a worklet and the floating tab bar
 * can read them in its own `useAnimatedStyle` with zero React re-renders and
 * no context plumbing. Safe here specifically because they're created once
 * at module scope (never inside a component body) and live for the app's
 * whole lifetime — see Reanimated's `makeMutable` docs for why that matters.
 */

/** 0 = tab bar fully visible, 1 = fully hidden (translated + faded out). */
export const tabBarHidden = makeMutable(0);
