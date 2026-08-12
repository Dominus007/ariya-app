import { supabase } from './supabase';

export type QualityLevel = 'low' | 'medium' | 'high';
export type Language = 'english' | 'yoruba' | 'hausa' | 'igbo' | 'pidgin';

export interface UserPreferences {
  notificationsNewRelease: boolean;
  notificationsLiveSport: boolean;
  notificationsNewEpisode: boolean;
  notificationsRenewalReminder: boolean;
  downloadQuality: QualityLevel;
  streamingQuality: QualityLevel;
  language: Language;
}

/** Mirrors the user_preferences table's column defaults — used as a fallback
 * for any account that predates the handle_new_user() trigger inserting a row. */
export const DEFAULT_PREFERENCES: UserPreferences = {
  notificationsNewRelease: true,
  notificationsLiveSport: true,
  notificationsNewEpisode: false,
  notificationsRenewalReminder: true,
  downloadQuality: 'medium',
  streamingQuality: 'medium',
  language: 'english',
};

interface PreferencesRow {
  notifications_new_release: boolean;
  notifications_live_sport: boolean;
  notifications_new_episode: boolean;
  notifications_renewal_reminder: boolean;
  download_quality: QualityLevel;
  streaming_quality: QualityLevel;
  language: Language;
}

function mapRow(row: PreferencesRow): UserPreferences {
  return {
    notificationsNewRelease: row.notifications_new_release,
    notificationsLiveSport: row.notifications_live_sport,
    notificationsNewEpisode: row.notifications_new_episode,
    notificationsRenewalReminder: row.notifications_renewal_reminder,
    downloadQuality: row.download_quality,
    streamingQuality: row.streaming_quality,
    language: row.language,
  };
}

export async function fetchPreferences(userId: string): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select(
      'notifications_new_release, notifications_live_sport, notifications_new_episode, notifications_renewal_reminder, download_quality, streaming_quality, language'
    )
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data as PreferencesRow) : DEFAULT_PREFERENCES;
}

/** Upserts just the given fields — the row already exists for every user (created at
 * signup), so this only ever updates the touched columns, never clobbering the rest. */
export async function updatePreferences(userId: string, patch: Partial<UserPreferences>): Promise<void> {
  const payload: Record<string, unknown> = { user_id: userId };
  if (patch.notificationsNewRelease !== undefined) payload.notifications_new_release = patch.notificationsNewRelease;
  if (patch.notificationsLiveSport !== undefined) payload.notifications_live_sport = patch.notificationsLiveSport;
  if (patch.notificationsNewEpisode !== undefined) payload.notifications_new_episode = patch.notificationsNewEpisode;
  if (patch.notificationsRenewalReminder !== undefined)
    payload.notifications_renewal_reminder = patch.notificationsRenewalReminder;
  if (patch.downloadQuality !== undefined) payload.download_quality = patch.downloadQuality;
  if (patch.streamingQuality !== undefined) payload.streaming_quality = patch.streamingQuality;
  if (patch.language !== undefined) payload.language = patch.language;

  const { error } = await supabase.from('user_preferences').upsert(payload, { onConflict: 'user_id' });
  if (error) throw error;
}
