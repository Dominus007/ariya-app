-- The app's Watch-mode rows (New Nollywood, Hollywood, Bollywood, K-Drama &
-- Asian) need to group `kind = 'movie'` rows by origin, which `kind` alone
-- can't express. `category` is only meaningful for movies — null for
-- everything else.
alter table public.media_items
  add column if not exists category text
  check (category is null or category in ('nollywood', 'hollywood', 'bollywood', 'kdrama'));
