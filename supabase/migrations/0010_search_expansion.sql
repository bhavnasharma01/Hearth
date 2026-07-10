-- 0010: comprehensive practitioner search.
--
-- The old search_vector was a GENERATED column over name/practice/description/
-- area/keywords — generated columns can't see other tables, so CATEGORIES,
-- SERVICES, and (an oversight) BIO were invisible to the search bar. A
-- practitioner categorised under "Bodywork & Massage" who never typed
-- "massage" simply couldn't be found (Bhavna's July 10 report).
--
-- New design: a regular tsvector column maintained by triggers, weighted:
--   A  name + practice name          (best matches rank first)
--   B  categories + keywords
--   C  description + services (titles + blurbs)
--   D  bio + area + languages
-- Refreshes on: practitioner writes, category links added/removed, services
-- changed, and admin category renames. Events search is unchanged.
--
-- >>> Run in the Supabase SQL editor before the Build 74 code ships.
-- Safe to re-run (drops and rebuilds the column, then backfills).

-- 1) Replace the generated column with a plain one --------------------------
drop index if exists practitioners_search_idx;
alter table practitioners drop column if exists search_vector;
alter table practitioners add column search_vector tsvector;

-- 2) The single source of truth for what's searchable -----------------------
create or replace function practitioner_search_vector(
  p_id uuid, p_name text, p_practice text, p_desc text,
  p_bio text, p_area text, p_keywords text, p_langs text
) returns tsvector language sql stable as $$
  select
    setweight(to_tsvector('english',
      coalesce(p_name,'') || ' ' || coalesce(p_practice,'')), 'A')
    ||
    setweight(to_tsvector('english',
      coalesce(p_keywords,'') || ' ' ||
      coalesce((select string_agg(c.name, ' ')
                from practitioner_categories pc
                join categories c on c.id = pc.category_id
                where pc.practitioner_id = p_id), '')), 'B')
    ||
    setweight(to_tsvector('english',
      coalesce(p_desc,'') || ' ' ||
      coalesce((select string_agg(s.title || ' ' || coalesce(s.description,''), ' ')
                from practitioner_services s
                where s.practitioner_id = p_id), '')), 'C')
    ||
    setweight(to_tsvector('english',
      coalesce(p_bio,'') || ' ' || coalesce(p_area,'') || ' ' || coalesce(p_langs,'')), 'D')
$$;

create or replace function refresh_practitioner_search(p_id uuid)
returns void language sql as $$
  update practitioners
  set search_vector = practitioner_search_vector(
    id, name, practice_name, description, bio, area, keywords, languages)
  where id = p_id;
$$;

-- 3) Keep it fresh -----------------------------------------------------------
create or replace function practitioners_search_trigger()
returns trigger language plpgsql as $$
begin
  new.search_vector := practitioner_search_vector(
    new.id, new.name, new.practice_name, new.description,
    new.bio, new.area, new.keywords, new.languages);
  return new;
end $$;

drop trigger if exists practitioners_search_refresh on practitioners;
create trigger practitioners_search_refresh
  before insert or update on practitioners
  for each row execute function practitioners_search_trigger();

create or replace function practitioner_categories_search_trigger()
returns trigger language plpgsql as $$
begin
  perform refresh_practitioner_search(coalesce(new.practitioner_id, old.practitioner_id));
  return null;
end $$;

drop trigger if exists practitioner_categories_search_refresh on practitioner_categories;
create trigger practitioner_categories_search_refresh
  after insert or delete on practitioner_categories
  for each row execute function practitioner_categories_search_trigger();

create or replace function practitioner_services_search_trigger()
returns trigger language plpgsql as $$
begin
  perform refresh_practitioner_search(coalesce(new.practitioner_id, old.practitioner_id));
  return null;
end $$;

drop trigger if exists practitioner_services_search_refresh on practitioner_services;
create trigger practitioner_services_search_refresh
  after insert or update or delete on practitioner_services
  for each row execute function practitioner_services_search_trigger();

-- Admin renames a category → re-index everyone holding it.
create or replace function categories_search_trigger()
returns trigger language plpgsql as $$
begin
  update practitioners
  set search_vector = practitioner_search_vector(
    id, name, practice_name, description, bio, area, keywords, languages)
  where id in (select practitioner_id from practitioner_categories where category_id = new.id);
  return null;
end $$;

drop trigger if exists categories_search_refresh on categories;
create trigger categories_search_refresh
  after update of name on categories
  for each row execute function categories_search_trigger();

-- 4) Backfill every existing row + rebuild the index -------------------------
update practitioners
set search_vector = practitioner_search_vector(
  id, name, practice_name, description, bio, area, keywords, languages);

create index if not exists practitioners_search_idx
  on practitioners using gin (search_vector);
