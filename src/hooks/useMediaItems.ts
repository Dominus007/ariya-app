import { useQuery } from '@tanstack/react-query';

import { fetchMediaItems, searchMediaItems } from '../services/mediaItems';
import type { MediaKind } from '../types/content';

/**
 * One content row's data (e.g. all songs, or 'movie' rows tagged
 * 'nollywood'). `enabled` lets callers skip fetching a row that isn't
 * currently visible — HomeScreen uses this so switching to Watch mode
 * doesn't also fetch Listen mode's rows, and vice versa.
 */
export function useMediaItemsQuery(kind: MediaKind, category: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['media-items', kind, category ?? null],
    queryFn: () => fetchMediaItems({ kind, category }),
    enabled,
  });
}

/** Debounce the search term yourself (see useDebouncedValue) before passing it here. */
export function useSearchMediaItems(term: string) {
  return useQuery({
    queryKey: ['media-items-search', term.trim().toLowerCase()],
    queryFn: () => searchMediaItems(term),
  });
}
