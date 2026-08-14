import { useEffect, useRef } from 'react';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { usePlayerStore } from '../store/usePlayerStore';

/**
 * Owns the single live audio player instance for the whole app, mounted
 * once above the tab navigator so it survives the Now Playing sheet being
 * opened and closed — the MiniPlayerBar and PlayerScreen both just read
 * shared state from usePlayerStore rather than each creating their own
 * player (expo-audio's own maintainers note useAudioPlayer isn't meant to
 * be re-created per-screen for exactly this "global playback" case).
 *
 * Video/live-sport keeps its player local to PlayerScreen instead, since
 * that content needs a mounted VideoView to actually render into — see
 * PlayerScreen's VideoSurface. That means dismissing the sheet pauses video
 * (there's nowhere for the picture to draw), while audio keeps playing.
 */
export function PlaybackEngine() {
  const current = usePlayerStore((state) => state.current());
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const setProgress = usePlayerStore((state) => state.setProgress);
  const pendingSeekSeconds = usePlayerStore((state) => state.pendingSeekSeconds);

  const isAudio = !!current && (current.kind === 'song' || current.kind === 'podcast');
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const loadedTrackId = useRef<string | null>(null);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true });
  }, []);

  // Load whichever audio track is current whenever it changes.
  useEffect(() => {
    if (!isAudio || !current) return;
    if (loadedTrackId.current === current.id) return;

    loadedTrackId.current = current.id;
    // BEFORE_LAUNCH_TODO: streamUrl is a public storage URL for now (see
    // supabase/migrations/20260810120100_storage_buckets.sql). Once buckets
    // go private, resolve a short-lived signed URL here instead of playing
    // this field directly.
    player.replace(current.streamUrl);
    if (usePlayerStore.getState().isPlaying) player.play();
  }, [current, isAudio, player]);

  // A non-audio item became current (e.g. skipped into a video) — stop.
  useEffect(() => {
    if (!isAudio) {
      loadedTrackId.current = null;
      player.pause();
    }
  }, [isAudio, player]);

  // Reflect play/pause toggles from anywhere (mini bar, full sheet).
  useEffect(() => {
    if (!isAudio) return;
    if (isPlaying) player.play();
    else player.pause();
  }, [isPlaying, isAudio, player]);

  // Publish live position/duration for the mini bar + full sheet to read.
  useEffect(() => {
    if (!isAudio) return;
    setProgress(status.currentTime, status.duration);
  }, [isAudio, status.currentTime, status.duration, setProgress]);

  // A track finished — advance the queue.
  useEffect(() => {
    if (isAudio && status.didJustFinish) {
      usePlayerStore.getState().next();
    }
  }, [isAudio, status.didJustFinish]);

  // The full-screen seek bar releases a target position here — perform the
  // actual seek, then clear it so this doesn't refire on unrelated updates.
  useEffect(() => {
    if (!isAudio || pendingSeekSeconds == null) return;
    player.seekTo(pendingSeekSeconds);
    usePlayerStore.getState().clearSeekRequest();
  }, [isAudio, pendingSeekSeconds, player]);

  return null;
}
