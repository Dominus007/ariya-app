-- Ariya placeholder catalog: 8 Afrobeats tracks, 5 Nigerian podcasts, 6 films.
-- Run this the same way you ran the migrations: Supabase Dashboard → SQL
-- Editor → New query → paste this whole file → Run.
--
-- BEFORE_LAUNCH_TODO: every stream_url below is a public URL into the
-- `audio`/`video` storage buckets (currently public-read for dev
-- convenience — see supabase/migrations/20260810120100_storage_buckets.sql).
-- No actual files are uploaded yet, so these URLs 404 until real audio/video
-- is added. Before launch, switch the buckets to private + signed URLs and
-- regenerate these stream_url values to match.

-- ---------------------------------------------------------------------------
-- Afrobeats tracks (kind = 'song'). Asake is inserted first so it's the
-- Listen-mode hero (HomeScreen features the first song returned).
-- ---------------------------------------------------------------------------
insert into public.media_items (kind, title, subtitle, description, emoji, stream_url, duration_seconds) values
  ('song', 'Lonely At The Top', 'Asake', 'The sound defining a generation.', '🎶', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/audio/asake-lonely-at-the-top.mp3', 198),
  ('song', 'Fall', 'Davido', null, '⭐', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/audio/davido-fall.mp3', 250),
  ('song', 'Last Last', 'Burna Boy', null, '🔥', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/audio/burna-boy-last-last.mp3', 184),
  ('song', 'Essence', 'Wizkid ft. Tems', null, '🎤', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/audio/wizkid-essence.mp3', 249),
  ('song', 'Rush', 'Ayra Starr', null, '💃', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/audio/ayra-starr-rush.mp3', 176),
  ('song', 'Calm Down', 'Rema', null, '🥁', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/audio/rema-calm-down.mp3', 239),
  ('song', 'Soso', 'Omah Lay', null, '🌙', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/audio/omah-lay-soso.mp3', 166),
  ('song', 'Buga', 'Kizz Daniel', null, '🕺', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/audio/kizz-daniel-buga.mp3', 213);

-- ---------------------------------------------------------------------------
-- Nigerian podcasts (kind = 'podcast')
-- ---------------------------------------------------------------------------
insert into public.media_items (kind, title, subtitle, emoji, stream_url, duration_seconds) values
  ('podcast', 'Business Untold', 'Business & the Economy', '💼', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/audio/business-untold-ep1.mp3', 2700),
  ('podcast', 'Loose Talk', 'Pop Culture & Gist', '🎙️', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/audio/loose-talk-ep1.mp3', 3300),
  ('podcast', 'Africa Rising', 'Stories from the Continent', '🌍', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/audio/africa-rising-ep1.mp3', 3000),
  ('podcast', 'Naija Finance', 'Money & Markets', '💰', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/audio/naija-finance-ep1.mp3', 2400),
  ('podcast', 'Tech Cabal', 'African Tech News', '💻', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/audio/tech-cabal-ep1.mp3', 2100);

-- ---------------------------------------------------------------------------
-- Films (kind = 'movie'). King of Boys 3 is inserted first so it's the
-- Watch-mode hero (HomeScreen features the first 'nollywood' movie).
-- ---------------------------------------------------------------------------
insert into public.media_items (kind, category, title, subtitle, description, genre_badge, emoji, stream_url, duration_seconds) values
  ('movie', 'nollywood', 'King of Boys 3', 'Sola Sobowale, Reminisce', 'The final chapter in the saga of Eniola Salami — power, betrayal, and the price of the throne.', 'NOLLYWOOD · DRAMA', '👑', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/video/king-of-boys-3.mp4', 7500),
  ('movie', 'nollywood', 'Jagun Jagun', 'Femi Adebayo, Funke Akindele', 'A young warrior rises through a brutal school of legendary fighters to reclaim his honor.', 'NOLLYWOOD · EPIC', '⚔️', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/video/jagun-jagun.mp4', 6900),
  ('movie', 'nollywood', 'A Tribe Called Judah', 'Funke Akindele, Iyabo Ojo', 'Five siblings, one mother, and a heist that could finally set the family free.', 'NOLLYWOOD · COMEDY', '🎭', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/video/a-tribe-called-judah.mp4', 7560),
  ('movie', 'hollywood', 'Midnight Protocol', 'Action · Thriller', null, 'HOLLYWOOD · ACTION', '🕶️', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/video/midnight-protocol.mp4', 6600),
  ('movie', 'bollywood', 'Dil Ki Dhadkan', 'Romance · Musical', null, 'BOLLYWOOD · ROMANCE', '💃', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/video/dil-ki-dhadkan.mp4', 8400),
  ('movie', 'kdrama', 'Moonlight Palace', 'Historical · Romance', null, 'K-DRAMA · ROMANCE', '🌙', 'https://tkceyhpcndymogqckwlm.supabase.co/storage/v1/object/public/video/moonlight-palace.mp4', 3600);
