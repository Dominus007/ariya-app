-- Storage buckets for streamed audio and video files.
--
-- BEFORE_LAUNCH_TODO: both buckets are `public = true` below, and the two
-- policies grant public SELECT — that's fine for development (anyone with a
-- file's URL can stream it, which is also what makes playback work without
-- extra plumbing right now) but wrong for a paid product. Before launch:
--   1. Set both buckets' `public` column to false (or recreate them private).
--   2. Drop the two "Public can read ..." policies below.
--   3. Add a policy scoped to `auth.role() = 'authenticated'` (or check
--      profiles.is_subscribed) and switch the app to fetch short-lived
--      signed URLs (supabase.storage.from(bucket).createSignedUrl(...))
--      instead of using media_items.stream_url directly.
-- Search the repo for BEFORE_LAUNCH_TODO to find every related spot
-- (this file and supabase/seed.sql).

insert into storage.buckets (id, name, public)
values ('audio', 'audio', true), ('video', 'video', true)
on conflict (id) do nothing;

alter table storage.objects enable row level security; -- on by default, but explicit here

-- BEFORE_LAUNCH_TODO: public read — see the note above this file's insert
-- into storage.buckets. Needed for now so the app can stream/play files
-- directly without generating a signed URL for every request.
create policy "Public can read audio files"
  on storage.objects for select
  using (bucket_id = 'audio');

create policy "Public can read video files"
  on storage.objects for select
  using (bucket_id = 'video');

-- No insert/update/delete policy is defined for these buckets — only the
-- service_role key or the Supabase Studio dashboard (Storage tab) can
-- upload or remove files, not the app itself.
