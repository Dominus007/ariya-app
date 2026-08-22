import { useQuery } from '@tanstack/react-query';

interface LyricsOvhResponse {
  lyrics?: string;
  error?: string;
}

async function fetchLyrics(artist: string, title: string): Promise<string> {
  const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Lyrics.ovh returned ${response.status}`);
  const data = (await response.json()) as LyricsOvhResponse;
  if (!data.lyrics) throw new Error(data.error ?? 'No lyrics in response');
  return data.lyrics.trim();
}

/**
 * Free lyrics lookup via the Lyrics.ovh API (https://api.lyrics.ovh/v1/{artist}/{title}) —
 * we don't have a licensed lyrics source yet, this is a stopgap. Missing
 * lyrics (a 404, an instrumental, a name that doesn't match their catalog)
 * is an expected, common outcome, not a bug — surfaced as isError, not retried.
 */
export function useLyrics(artist: string | undefined, title: string | undefined) {
  return useQuery({
    queryKey: ['lyrics', artist, title],
    queryFn: () => fetchLyrics(artist as string, title as string),
    enabled: !!artist && !!title,
    retry: false,
    staleTime: Infinity,
  });
}
