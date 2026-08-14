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
  /** Set by the seek bar on release; PlaybackEngine (audio) / VideoSurface
   * (video) watch this and perform the actual seek, then clear it. */
  pendingSeekSeconds: number | null;
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
  requestSeek: (seconds: number) => void;
  clearSeekRequest: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  originRect: null,
  positionSeconds: 0,
  durationSeconds: 0,
  pendingSeekSeconds: null,

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
      pendingSeekSeconds: null,
    }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),

  next: () =>
    set((state) => {
      if (state.currentIndex >= state.queue.length - 1) return state;
      return {
        currentIndex: state.currentIndex + 1,
        isPlaying: true,
        positionSeconds: 0,
        durationSeconds: 0,
        pendingSeekSeconds: null,
      };
    }),

  previous: () =>
    set((state) => {
      if (state.currentIndex <= 0) return state;
      return {
        currentIndex: state.currentIndex - 1,
        isPlaying: true,
        positionSeconds: 0,
        durationSeconds: 0,
        pendingSeekSeconds: null,
      };
    }),

  clear: () =>
    set({ queue: [], currentIndex: -1, isPlaying: false, positionSeconds: 0, durationSeconds: 0, pendingSeekSeconds: null }),

  setProgress: (positionSeconds, durationSeconds) => set({ positionSeconds, durationSeconds }),

  // Optimistically reflect the target position immediately (feels instant),
  // then the actual player performs the seek and clears the request.
  requestSeek: (seconds) => set({ pendingSeekSeconds: seconds, positionSeconds: seconds }),
  clearSeekRequest: () => set({ pendingSeekSeconds: null }),
}));
