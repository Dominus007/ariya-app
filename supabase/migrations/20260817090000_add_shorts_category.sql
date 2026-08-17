-- Widen media_items.category to also accept 'shorts' — short-form video
-- clips (kind = 'video', same as music videos) alongside the existing
-- movie-origin values (nollywood/hollywood/bollywood/kdrama).
--
-- The original check constraint's name is whatever Postgres auto-generated
-- for it, so find and drop it by inspecting its definition rather than
-- guessing the name.
do $$
declare
  existing_constraint text;
begin
  select conname into existing_constraint
  from pg_constraint
  where conrelid = 'public.media_items'::regclass
    and pg_get_constraintdef(oid) like '%category%';

  if existing_constraint is not null then
    execute format('alter table public.media_items drop constraint %I', existing_constraint);
  end if;
end $$;

alter table public.media_items
  add constraint media_items_category_check
  check (category is null or category in ('nollywood', 'hollywood', 'bollywood', 'kdrama', 'shorts'));
