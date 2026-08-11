import { create } from 'zustand';

import type { PlaybackMode } from '../types/content';

interface ModeState {
  /** Drives the app-wide Watch/Listen toggle (music+podcasts vs video+sport). */
  mode: PlaybackMode;
  setMode: (mode: PlaybackMode) => void;
  toggleMode: () => void;
}

export const useModeStore = create<ModeState>((set) => ({
  mode: 'listen',
  setMode: (mode) => set({ mode }),
  toggleMode: () => set((state) => ({ mode: state.mode === 'listen' ? 'watch' : 'listen' })),
}));
