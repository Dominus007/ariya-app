import { useQuery } from '@tanstack/react-query';

import { fetchActiveSubscription } from '../services/subscriptions';
import { useAuthStore } from '../store/useAuthStore';

/** The signed-in user's active subscription — `data` is null for free tier. */
export function useActiveSubscription() {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ['subscription', userId],
    queryFn: () => fetchActiveSubscription(userId as string),
    enabled: !!userId,
  });
}
