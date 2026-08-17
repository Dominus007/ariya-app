-- Seed data for the Shorts feature. Run this AFTER
-- migrations/20260817090000_add_shorts_category.sql. Safe to run once
-- against the live DB — does not touch supabase/seed.sql or its rows.
--
-- IMPORTANT — this intentionally does NOT run the duration-based UPDATE
-- originally proposed ("category = 'shorts' WHERE duration_secs < 300"):
-- our three existing music videos (Essence, Ye, Calm Down) are all under
-- 300 seconds too, so that WHERE clause would have silently reclassified
-- real music videos as Shorts. Category is assigned explicitly per-row
-- below instead — duration alone doesn't tell you what something is.
--
-- Also corrected the column names from the original request to match this
-- project's actual schema: `kind` (not `type`), `duration_seconds` (not
-- `duration_secs`), `subtitle` (not `artist`).

insert into media_items (kind, title, subtitle, category, duration_seconds, artwork_url, stream_url, is_live)
values
  ('video', 'Lagos Street Vibes', 'Ariya Originals', 'shorts', 45,
   'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=600&q=80',
   '', false),
  ('video', 'Behind the Scenes: New Nollywood', 'Ariya Originals', 'shorts', 58,
   'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
   '', false),
  ('video', 'Afrobeats Dance Challenge', 'Ariya Originals', 'shorts', 32,
   'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&q=80',
   '', false),
  ('video', 'Comedy Skit: Lagos Traffic', 'Ariya Originals', 'shorts', 74,
   'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80',
   '', false),
  ('video', 'Match Highlights: Super Eagles', 'Ariya Sports', 'shorts', 61,
   'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
   '', false);

-- BEFORE_LAUNCH_TODO: stream_url is empty above — same placeholder pattern
-- as the rest of this project's seed data until real clip files are
-- uploaded to the `video` storage bucket. The Shorts rows will render (and
-- be tappable) but won't actually play until real URLs are filled in.
