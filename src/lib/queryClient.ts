import { QueryClient } from '@tanstack/react-query';

/**
 * 5-minute staleTime app-wide: on slow/expensive Nigerian mobile networks,
 * re-fetching a screen's data every time it's revisited is costly and
 * makes the app feel sluggish. Cached data up to 5 minutes old is served
 * instantly instead; `retry: 2` gives flaky connections a couple of extra
 * attempts before showing an error.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});
