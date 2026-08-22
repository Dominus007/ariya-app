import { create } from 'zustand';

import type { MediaItem } from '../types/content';

/** On-screen rect of the card that was tapped, measured in window coordinates. */
export interface OriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type RepeatMode = 'off' | 'all' | 'one';

/** Fisher-Yates shuffle of queue indices, optionally excluding one index (the current track). */
function shuffledIndices(length: number, exclude?: number): number[] {
  const order = Array.from({ length }, (_, i) => i).filter((i) => i !== exclude);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** Pop the next index off the shuffle bag, refilling (a fresh shuffled round) once it's empty. */
function drawShuffleIndex(state: PlayerState): { index: number; order: number[] } {
  let order = state.shuffleOrder.filter((i) => i !== state.currentIndex && i < state.queue.length);
  if (order.length === 0) {
    order = shuffledIndices(state.queue.length, state.currentIndex);
  }
  const [index, ...rest] = order;
  return { index, order: rest };
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
  shuffle: boolean;
  repeatMode: RepeatMode;
  /** Remaining not-yet-played indices for the current shuffle round (see drawShuffleIndex). */
  shuffleOrder: number[];
  current: () => MediaItem | null;
  /** Replace the queue and start playing at `startIndex` (e.g. tapping a track in a list). */
  playQueue: (items: MediaItem[], startIndex?: number, originRect?: OriginRect) => void;
  play: () => void;
  pause: () => void;
  togglePlaying: () => void;
  /** Manual "skip forward" (next-track button). */
  next: () => void;
  /** Manual "skip back" (previous-track button). */
  previous: () => void;
  /** Jump straight to a specific index already in the queue (e.g. tapping an item in the Queue screen). */
  playAt: (index: number) => void;
  /** Called by PlaybackEngine when a track finishes naturally — applies repeat/shuffle rules. */
  trackFinished: () => void;
  toggleShuffle: () => void;
  /** Cycles OFF → REPEAT ALL → REPEAT ONE → OFF. */
  cycleRepeat: () => void;
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
  shuffle: false,
  repeatMode: 'off',
  shuffleOrder: [],

  current: () => {
    const { queue, currentIndex } = get();
    return queue[currentIndex] ?? null;
  },

  playQueue: (items, startIndex = 0, originRect) =>
    set((state) => ({
      queue: items,
      currentIndex: startIndex,
      isPlaying: true,
      originRect: originRect ?? null,
      positionSeconds: 0,
      durationSeconds: 0,
      pendingSeekSeconds: null,
      shuffleOrder: state.shuffle ? shuffledIndices(items.length, startIndex) : [],
    })),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),

  next: () =>
    set((state) => {
      if (state.queue.length === 0) return state;
      if (state.shuffle) {
        const { index, order } = drawShuffleIndex(state);
        return {
          currentIndex: index,
          shuffleOrder: order,
          isPlaying: true,
          positionSeconds: 0,
          durationSeconds: 0,
          pendingSeekSeconds: null,
        };
      }
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

  playAt: (index) =>
    set((state) => {
      if (index < 0 || index >= state.queue.length) return state;
      return {
        currentIndex: index,
        isPlaying: true,
        positionSeconds: 0,
        durationSeconds: 0,
        pendingSeekSeconds: null,
      };
    }),

  // Auto-advance when a track ends on its own (PlaybackEngine's didJustFinish) —
  // distinct from next()/previous() (the manual skip buttons) because the
  // end-of-queue behavior differs by repeat mode, per the design spec:
  //   - REPEAT ONE: replay the same track from the top.
  //   - shuffle on: jump to a random not-yet-played track in the queue.
  //   - last track, REPEAT OFF: go back to the first track and pause.
  //   - last track, REPEAT ALL: go back to the first track and keep playing.
  //   - otherwise: advance to the next track, same as a manual skip.
  trackFinished: () =>
    set((state) => {
      if (state.queue.length === 0) return state;

      if (state.repeatMode === 'one') {
        return { positionSeconds: 0, pendingSeekSeconds: 0, isPlaying: true };
      }

      if (state.shuffle) {
        const { index, order } = drawShuffleIndex(state);
        return {
          currentIndex: index,
          shuffleOrder: order,
          isPlaying: true,
          positionSeconds: 0,
          durationSeconds: 0,
          pendingSeekSeconds: null,
        };
      }

      const isLast = state.currentIndex >= state.queue.length - 1;
      if (isLast) {
        return {
          currentIndex: 0,
          isPlaying: state.repeatMode === 'all',
          positionSeconds: 0,
          durationSeconds: 0,
          pendingSeekSeconds: null,
        };
      }

      return {
        currentIndex: state.currentIndex + 1,
        isPlaying: true,
        positionSeconds: 0,
        durationSeconds: 0,
        pendingSeekSeconds: null,
      };
    }),

  toggleShuffle: () =>
    set((state) => {
      const shuffle = !state.shuffle;
      return {
        shuffle,
        shuffleOrder: shuffle ? shuffledIndices(state.queue.length, state.currentIndex) : [],
      };
    }),

  cycleRepeat: () =>
    set((state) => ({
      repeatMode: state.repeatMode === 'off' ? 'all' : state.repeatMode === 'all' ? 'one' : 'off',
    })),

  clear: () =>
    set({
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      positionSeconds: 0,
      durationSeconds: 0,
      pendingSeekSeconds: null,
      shuffleOrder: [],
    }),

  setProgress: (positionSeconds, durationSeconds) => set({ positionSeconds, durationSeconds }),

  // Optimistically reflect the target position immediately (feels instant),
  // then the actual player performs the seek and clears the request.
  requestSeek: (seconds) => set({ pendingSeekSeconds: seconds, positionSeconds: seconds }),
  clearSeekRequest: () => set({ pendingSeekSeconds: null }),
}));
