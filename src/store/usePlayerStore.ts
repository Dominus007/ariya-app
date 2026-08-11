import { create } from 'zustand';

import type { MediaItem } from '../types/content';

/** On-screen rect of the card that was tapped, measured in window coordinates. */
export interface OriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PlayerState {
  queue: MediaItem[];
  currentIndex: number;
  isPlaying: boolean;
  /** Where the tapped card was on screen, so PlayerScreen can "grow" out of it. */
  originRect: OriginRect | null;
  /** Playback position, in seconds — kept in the store so both the mini bar
   * and the full sheet reflect the same live progress. See PlaybackEngine. */
  positionSeconds: number;
  durationSeconds: number;
  current: () => MediaItem | null;
  /** Replace the queue and start playing at `startIndex` (e.g. tapping a track in a list). */
  playQueue: (items: MediaItem[], startIndex?: number, originRect?: OriginRect) => void;
  play: () => void;
  pause: () => void;
  togglePlaying: () => void;
  next: () => void;
  previous: () => void;
  clear: () => void;
  setProgress: (positionSeconds: number, durationSeconds: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  originRect: null,
  positionSeconds: 0,
  durationSeconds: 0,

  current: () => {
    const { queue, currentIndex } = get();
    return queue[currentIndex] ?? null;
  },

  playQueue: (items, startIndex = 0, originRect) =>
    set({
      queue: items,
      currentIndex: startIndex,
      isPlaying: true,
      originRect: originRect ?? null,
      positionSeconds: 0,
      durationSeconds: 0,
    }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),

  next: () =>
    set((state) => {
      if (state.currentIndex >= state.queue.length - 1) return state;
      return { currentIndex: state.currentIndex + 1, isPlaying: true, positionSeconds: 0, durationSeconds: 0 };
    }),

  previous: () =>
    set((state) => {
      if (state.currentIndex <= 0) return state;
      return { currentIndex: state.currentIndex - 1, isPlaying: true, positionSeconds: 0, durationSeconds: 0 };
    }),

  clear: () => set({ queue: [], currentIndex: -1, isPlaying: false, positionSeconds: 0, durationSeconds: 0 }),

  setProgress: (positionSeconds, durationSeconds) => set({ positionSeconds, durationSeconds }),
}));
