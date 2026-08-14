import { supabase } from './supabase';

export interface ProfileRecord {
  avatarUrl: string | null;
  displayName: string | null;
}

export async function fetchProfileRecord(userId: string): Promise<ProfileRecord> {
  const { data, error } = await supabase
    .from('profiles')
    .select('avatar_url, display_name')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return {
    avatarUrl: data?.avatar_url ?? null,
    displayName: data?.display_name ?? null,
  };
}

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * Uploads a locally-picked image to the `avatars` bucket at
 * avatars/{userId}/avatar.{ext} — a fixed path per user (upsert:true), so
 * re-uploading always replaces the previous one instead of accumulating
 * orphaned files. Saves the resulting public URL onto profiles.avatar_url.
 */
export async function uploadAvatar(userId: string, localUri: string, mimeType?: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const contentType = mimeType ?? blob.type ?? 'image/jpeg';
  const extension = EXTENSION_BY_MIME[contentType] ?? 'jpg';
  const path = `${userId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, blob, { contentType, upsert: true });
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
  // Cache-bust so the new image shows immediately instead of a stale cached copy at the same path.
  const publicUrl = `${publicUrlData.publicUrl}?updated=${Date.now()}`;

  const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
  if (updateError) throw updateError;

  return publicUrl;
}

const NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  if (trimmed.length > 30) return 'Name must be 30 characters or fewer.';
  if (!NAME_PATTERN.test(trimmed)) return 'Only letters, numbers, underscores, and hyphens are allowed.';
  return null;
}

/**
 * Updates both auth user_metadata (so display name changes are available
 * from the session immediately via onAuthStateChange) and
 * profiles.display_name (source of truth for display across the app).
 * Caller is expected to have already validated via validateDisplayName.
 */
export async function updateDisplayName(userId: string, name: string): Promise<void> {
  const trimmed = name.trim();

  const { error: authError } = await supabase.auth.updateUser({ data: { full_name: trimmed } });
  if (authError) throw authError;

  const { error: profileError } = await supabase.from('profiles').update({ display_name: trimmed }).eq('id', userId);
  if (profileError) throw profileError;
}
