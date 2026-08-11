/** Shared sizes so the tab bar and mini player bar stack without overlap. */
export const TAB_BAR_HEIGHT = 60; // excludes safe-area inset, which callers add separately
export const MINI_PLAYER_HEIGHT = 80;
export const SIDEBAR_WIDTH = 220;
/** Below this width, use the bottom tab bar; at/above it, use the sidebar (tablet/web). */
export const SIDEBAR_BREAKPOINT = 768;
