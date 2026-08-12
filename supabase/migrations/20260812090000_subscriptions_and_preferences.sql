-- Subscriptions (tier/status, driven by Paystack in production) and
-- per-user preferences (notifications, quality, language) for the Profile screen.

-- ============================================================================
-- subscriptions: history of a user's subscription periods
-- ============================================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tier text not null check (tier in ('nigeria', 'family', 'global')),
  status text not null check (status in ('active', 'canceled', 'past_due', 'trialing')),
  paystack_reference text,
  amount_naira integer,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- No insert/update/delete policy — subscription rows are written by a
-- service_role script/edge function reacting to verified Paystack events,
-- never directly by the app. See ProfileScreen's BEFORE_LAUNCH_TODO note on
-- verifying transactions server-side before trusting a client-side success.

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);

-- ============================================================================
-- user_preferences: one row per user — notification toggles, quality, language
-- ============================================================================
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  notifications_new_release boolean not null default true,
  notifications_live_sport boolean not null default true,
  notifications_new_episode boolean not null default false,
  notifications_renewal_reminder boolean not null default true,
  download_quality text not null default 'medium' check (download_quality in ('low', 'medium', 'high')),
  streaming_quality text not null default 'medium' check (streaming_quality in ('low', 'medium', 'high')),
  language text not null default 'english',
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users manage their own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Extend the existing handle_new_user() trigger (see init_schema migration)
-- so a default preferences row exists immediately at signup — the app can
-- then always `upsert` a partial change instead of branching on "does a row
-- exist yet".
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  insert into public.user_preferences (user_id)
  values (new.id);

  return new;
end;
$$;
