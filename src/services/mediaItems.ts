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
    // .trim() defends against stray whitespace/newlines from pasting URLs
    // into Supabase's Table Editor (seen in production data — a trailing
    // \r\n silently breaks the image/stream request otherwise).
    artworkUrl: row.artwork_url?.trim() || undefined,
    streamUrl: row.stream_url.trim(),
    durationSeconds: row.duration_seconds ?? undefined,
    isLive: row.is_live,
    category: row.category ?? undefined,
  };
}

const SELECT_COLUMNS =
  'id, kind, title, subtitle, description, genre_badge, emoji, artwork_url, stream_url, duration_seconds, is_live, category';

/**
 * Fetch a content row's items — e.g. all songs, or all 'movie' rows tagged
 * 'nollywood'. `category` only applies to movies and shorts (see the
 * add_movie_category / add_shorts_category migrations); omit it for every
 * other kind.
 *
 * Shorts are `kind: 'video'` with `category: 'shorts'` — same kind as music
 * videos, distinguished only by category. So a bare `kind: 'video'` query
 * (no category — what the "Music Videos" row uses) must explicitly exclude
 * shorts, or short clips would double up in both rows.
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
  } else if (kind === 'video') {
    query = query.is('category', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapMediaItemRow);
}

/** Search screen's filter pills — 'all' plus one per content type. */
export type SearchFilter = 'all' | 'music' | 'videos' | 'podcasts' | 'sports' | 'shorts';

/**
 * Search across the whole catalog by title/subtitle, optionally narrowed to
 * one of the Search screen's filter pills. Bounded to 50 rows — this is a
 * quick-search, not a paginated browse.
 */
export async function searchMediaItems(term: string, filter: SearchFilter = 'all'): Promise<MediaItem[]> {
  let query = supabase
    .from('media_items')
    .select(SELECT_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(50);

  switch (filter) {
    case 'music':
      query = query.eq('kind', 'song');
      break;
    case 'podcasts':
      query = query.eq('kind', 'podcast');
      break;
    case 'sports':
      query = query.eq('kind', 'live-sport');
      break;
    case 'shorts':
      query = query.eq('kind', 'video').eq('category', 'shorts');
      break;
    case 'videos':
      // Music videos (category is null) and movies (category is one of the
      // movie genres) — everything video-shaped except shorts. Written as
      // an .or() rather than .neq('category', 'shorts') because SQL's NULL
      // semantics mean `category <> 'shorts'` silently drops every
      // category-is-null row too (music videos), which is the opposite of
      // what "Videos" should include.
      query = query.in('kind', ['video', 'movie']).or('category.is.null,category.neq.shorts');
      break;
    case 'all':
    default:
      break;
  }

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
