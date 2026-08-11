import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { mapMediaItemRow, type MediaItemRow } from '../services/mediaItems';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/useAuthStore';
import type { MediaItem } from '../types/content';

// The Supabase client isn't given generated DB types, so it can't tell this
// embedded relation is many-to-one (many library_items -> one media_items
// row) and infers an array. At runtime PostgREST returns a single object —
// this local type + cast reflects that, rather than the client's guess.
interface SavedItemRow {
  saved_at: string;
  media_items: MediaItemRow | null;
}

async function fetchSavedItems(userId: string): Promise<MediaItem[]> {
  const { data, error } = await supabase
    .from('library_items')
    .select(
      'saved_at, media_items (id, kind, title, subtitle, description, genre_badge, emoji, artwork_url, stream_url, duration_seconds, is_live, category)'
    )
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as SavedItemRow[])
    .map((row) => row.media_items)
    .filter((item): item is MediaItemRow => item != null)
    .map(mapMediaItemRow);
}

/** The signed-in user's "My List" — the heart/save button across the app. */
export function useSavedItems() {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ['library-items', userId],
    queryFn: () => fetchSavedItems(userId as string),
    enabled: !!userId,
  });
}

/** Toggle a single item saved/unsaved, and refresh useSavedItems' cache. */
export function useToggleSaved() {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ item, isSaved }: { item: MediaItem; isSaved: boolean }) => {
      if (!userId) throw new Error('Not signed in');

      if (isSaved) {
        const { error } = await supabase
          .from('library_items')
          .delete()
          .eq('user_id', userId)
          .eq('media_item_id', item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('library_items')
          .insert({ user_id: userId, media_item_id: item.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-items', userId] });
    },
  });
}
