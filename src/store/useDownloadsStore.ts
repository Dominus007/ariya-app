import { create } from 'zustand';

import type { MediaItem } from '../types/content';

export interface DownloadedItem {
  item: MediaItem;
  fileSizeBytes: number;
  downloadedAt: string;
}

export interface ActiveDownload {
  item: MediaItem;
  /** 0–1 */
  progress: number;
}

interface DownloadsState {
  audioDownloads: DownloadedItem[];
  videoDownloads: DownloadedItem[];
  activeDownload: ActiveDownload | null;
  storageLimitBytes: number;
  removeDownload: (mediaItemId: string) => void;
  cancelActiveDownload: () => void;
}

const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

/**
 * BEFORE_LAUNCH_TODO: there's no real download engine wired up yet (no
 * expo-file-system fetch, no background task, no persistence) — this store
 * only models the *shape* of "what's downloaded" so DownloadsScreen has
 * something real to render against once that engine exists. It starts
 * empty and nothing in the app currently adds to it, which is why the
 * empty state is what you'll see today.
 */
export const useDownloadsStore = create<DownloadsState>((set) => ({
  audioDownloads: [],
  videoDownloads: [],
  activeDownload: null,
  storageLimitBytes: STORAGE_LIMIT_BYTES,

  removeDownload: (mediaItemId) =>
    set((state) => ({
      audioDownloads: state.audioDownloads.filter((download) => download.item.id !== mediaItemId),
      videoDownloads: state.videoDownloads.filter((download) => download.item.id !== mediaItemId),
    })),

  cancelActiveDownload: () => set({ activeDownload: null }),
}));
