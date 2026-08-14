-- Avatar upload support: profiles gains avatar_url/display_name columns, and
-- a new `avatars` storage bucket where — unlike audio/video/artwork — each
-- signed-in user can write their OWN files (scoped by a {user_id}/... path
-- prefix), not just service_role.

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists display_name text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Public read, same public-bucket tradeoff as audio/video/artwork — see the
-- BEFORE_LAUNCH_TODO in 20260810120100_storage_buckets.sql.
create policy "Public can read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Users may only write to their own folder: avatars/{user_id}/... — the
-- first path segment must match their own auth uid.
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can replace their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
