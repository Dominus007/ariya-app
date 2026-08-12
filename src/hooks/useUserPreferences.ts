import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DEFAULT_PREFERENCES, fetchPreferences, updatePreferences, type UserPreferences } from '../services/preferences';
import { useAuthStore } from '../store/useAuthStore';

export function useUserPreferences() {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ['preferences', userId],
    queryFn: () => fetchPreferences(userId as string),
    enabled: !!userId,
  });
}

/** Updates persist to Supabase in the background; the cache updates immediately
 * (and rolls back on failure) so toggles/segmented controls feel instant. */
export function useUpdatePreferences() {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const queryKey = ['preferences', userId];

  return useMutation({
    mutationFn: (patch: Partial<UserPreferences>) => {
      if (!userId) throw new Error('Not signed in');
      return updatePreferences(userId, patch);
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<UserPreferences>(queryKey);
      queryClient.setQueryData<UserPreferences>(queryKey, (current) => ({
        ...(current ?? DEFAULT_PREFERENCES),
        ...patch,
      }));
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
