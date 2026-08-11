-- Ariya core schema: profiles, content catalog, playlists, and saved items.

create extension if not exists "pgcrypto"; -- gives us gen_random_uuid()

-- ============================================================================
-- profiles: one row per auth user, tracks subscription state
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  is_subscribed boolean not null default false,
  paystack_customer_code text,
  subscription_expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- media_items: the content catalog (songs, podcasts, music videos, movies, live sport)
-- ============================================================================
create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('song', 'podcast', 'video', 'movie', 'live-sport')),
  title text not null,
  subtitle text,
  description text,
  genre_badge text,
  emoji text,
  artwork_url text,
  stream_url text not null,
  duration_seconds integer,
  is_live boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.media_items enable row level security;

-- Public catalog: anyone can browse it, even signed-out visitors.
create policy "Media items are publicly readable"
  on public.media_items for select
  using (true);

-- No insert/update/delete policy is defined here on purpose — that means
-- only the service_role key (never shipped in the app) can add or change
-- catalog rows. Add content via the Supabase Studio Table Editor for now.

-- ============================================================================
-- playlists + playlist_items: user-curated collections
-- ============================================================================
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  cover_url text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.playlists enable row level security;

create policy "Playlists are readable by their owner or if public"
  on public.playlists for select
  using (is_public or auth.uid() = owner_id);

create policy "Users manage their own playlists"
  on public.playlists for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create table if not exists public.playlist_items (
  playlist_id uuid not null references public.playlists (id) on delete cascade,
  media_item_id uuid not null references public.media_items (id) on delete cascade,
  position integer not null default 0,
  added_at timestamptz not null default now(),
  primary key (playlist_id, media_item_id)
);

alter table public.playlist_items enable row level security;

create policy "Playlist items follow their playlist's visibility"
  on public.playlist_items for select
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_items.playlist_id
        and (p.is_public or p.owner_id = auth.uid())
    )
  );

create policy "Users manage items in their own playlists"
  on public.playlist_items for all
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_items.playlist_id and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_items.playlist_id and p.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- library_items: a user's saved/"My List" items (the heart icon in the app)
-- ============================================================================
create table if not exists public.library_items (
  user_id uuid not null references auth.users (id) on delete cascade,
  media_item_id uuid not null references public.media_items (id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, media_item_id)
);

alter table public.library_items enable row level security;

create policy "Users manage their own saved items"
  on public.library_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
