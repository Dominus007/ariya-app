/** Ariya brand palette — exact values from the reference design (ariyastream.netlify.app). */
export const colors = {
  background: '#080806',
  card: '#111110',
  cardActive: '#1C1C18',
  gold: '#C9963A',
  goldLight: '#E5B65A',
  goldTint: '#3D2D0F',
  terracotta: '#C4572A',
  kenteGreen: '#2A6B3C',
  text: '#F0EBE1',
  textSecondary: '#C8C3BA',
  textMuted: '#7A756E',
  border: 'rgba(201, 150, 58, 0.15)',
  borderActive: 'rgba(201, 150, 58, 0.28)',

  // Component-specific values called out explicitly in the design spec,
  // which differ from the tokens above on purpose (neutral white-based
  // borders on content cards vs. the gold-based border everywhere else).
  cardSurface: '#141414',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardBorderActive: 'rgba(255, 255, 255, 0.14)',
  navSurface: 'rgba(14, 14, 14, 0.97)',
  navBorder: 'rgba(255, 255, 255, 0.08)',
  progressTrack: '#282828',

  // The hero glow and "now playing" row tint share one accent orange that
  // doesn't map to any named brand color above — used only in those spots.
  heroGlow: 'rgba(232, 98, 42, 0.22)',
  nowPlayingTint: 'rgba(232, 98, 42, 0.12)',

  // Translucent gold used for the skeleton shimmer sweep, over the goldTint block.
  shimmer: 'rgba(229, 182, 90, 0.35)',

  // Toggle switches (Profile screen notifications) — off-state track.
  toggleOff: '#3A3830',

  // Profile screen settings cards use a subtler border than colors.border/cardBorder.
  settingsBorder: 'rgba(255, 255, 255, 0.06)',
};
