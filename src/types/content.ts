/** The app's core Watch/Listen toggle. */
export type PlaybackMode = 'listen' | 'watch';

/** 'video' = music videos; 'movie' = films/series (Nollywood, Hollywood, Bollywood, K-Drama, etc). */
export type MediaKind = 'song' | 'podcast' | 'video' | 'movie' | 'live-sport';

/** A single playable item, audio or video, streamed from Supabase storage/CDN. */
export interface MediaItem {
  id: string;
  kind: MediaKind;
  title: string;
  subtitle?: string; // artist, show host, team names, cast/category, etc.
  /** Brand thumbnails are a single centered emoji rather than photography — see the design spec. */
  emoji: string;
  artworkUrl?: string;
  streamUrl: string;
  durationSeconds?: number;
  isLive?: boolean;
  /** Longer blurb — used by the Hero when this item is the featured item. */
  description?: string;
  /** e.g. "NOLLYWOOD · DRAMA" — used by the Hero's eyebrow when this item is featured. */
  genreBadge?: string;
}

export interface Playlist {
  id: string;
  title: string;
  coverUrl?: string;
  itemIds: string[];
}
