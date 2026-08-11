import { supabase } from './supabase';
import type { MediaItem, MediaKind } from '../types/content';

/** Shape of a row in the `media_items` table (snake_case, as Postgres returns it). */
export interface MediaItemRow {
  id: string;
  kind: MediaKind;
  title: string;
  subtitle: string | null;
  description: string | null;
  genre_badge: string | null;
  emoji: string | null;
  artwork_url: string | null;
  stream_url: string;
  duration_seconds: number | null;
  is_live: boolean;
  category: string | null;
}

const FALLBACK_EMOJI_BY_KIND: Record<MediaKind, string> = {
  song: '🎵',
  podcast: '🎙️',
  video: '🎬',
  movie: '🎬',
  'live-sport': '⚽',
};

export function mapMediaItemRow(row: MediaItemRow): MediaItem {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    description: row.description ?? undefined,
    genreBadge: row.genre_badge ?? undefined,
    emoji: row.emoji ?? FALLBACK_EMOJI_BY_KIND[row.kind],
    artworkUrl: row.artwork_url ?? undefined,
    streamUrl: row.stream_url,
    durationSeconds: row.duration_seconds ?? undefined,
    isLive: row.is_live,
  };
}

const SELECT_COLUMNS =
  'id, kind, title, subtitle, description, genre_badge, emoji, artwork_url, stream_url, duration_seconds, is_live, category';

/**
 * Fetch a content row's items — e.g. all songs, or all 'movie' rows tagged
 * 'nollywood'. `category` only applies to movies (see the
 * add_movie_category migration); omit it for every other kind.
 */
export async function fetchMediaItems({
  kind,
  category,
}: {
  kind: MediaKind;
  category?: string;
}): Promise<MediaItem[]> {
  let query = supabase
    .from('media_items')
    .select(SELECT_COLUMNS)
    .eq('kind', kind)
    .order('created_at', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapMediaItemRow);
}

/**
 * Search across the whole catalog by title/subtitle. Bounded to 50 rows —
 * this is a quick-search, not a paginated browse.
 */
export async function searchMediaItems(term: string): Promise<MediaItem[]> {
  let query = supabase
    .from('media_items')
    .select(SELECT_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(50);

  const trimmed = term.trim();
  if (trimmed) {
    // Escape ilike's own wildcard characters so a literal "%" or "_" in a
    // search term isn't treated as a pattern.
    const escaped = trimmed.replace(/[%_]/g, (match) => `\\${match}`);
    query = query.or(`title.ilike.%${escaped}%,subtitle.ilike.%${escaped}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapMediaItemRow);
}
