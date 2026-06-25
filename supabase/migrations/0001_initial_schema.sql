-- Hearth — initial schema (v1)
-- Postgres / Supabase. Mirrors documentation/Hearth - Database Schema.md, with one
-- addition resolved during the build: events.category_id linking events to the SAME
-- categories taxonomy used by practitioners (shared taxonomy decision).
--
-- Security model (see documentation/Security.md):
--   * Row-Level Security is ON for every table.
--   * The anonymous (public) role is READ-ONLY and only sees `live` content.
--   * All public writes (submissions, reports) go through trusted server actions
--     using the service-role key, which bypasses RLS — so status/auto_check are always
--     set server-side and the content-check gate cannot be bypassed from the client.
--   * Authenticated users in v1 are admins/stewards only; they get full access.

-- Extensions ---------------------------------------------------------------
create extension if not exists pgcrypto;   -- gen_random_uuid()

-- Enums --------------------------------------------------------------------
do $$ begin
  create type user_role          as enum ('member', 'practitioner', 'steward', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_mode       as enum ('in_person', 'online', 'both');
exception when duplicate_object then null; end $$;

do $$ begin
  create type practitioner_status as enum ('pending', 'live', 'hidden', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type auto_check_result   as enum ('ok', 'needs_review');
exception when duplicate_object then null; end $$;

do $$ begin
  create type practitioner_source as enum ('hearth_form', 'import', 'whatsapp', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status        as enum ('pending', 'live', 'hidden', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_source        as enum ('hearth_form', 'google_calendar', 'whatsapp', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_reason       as enum ('spam', 'inappropriate', 'not_real', 'outdated', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status       as enum ('open', 'reviewed', 'dismissed', 'actioned');
exception when duplicate_object then null; end $$;

do $$ begin
  create type registration_status as enum ('registered', 'waitlist', 'cancelled', 'attended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method      as enum ('free', 'cash', 'etransfer', 'card');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status      as enum ('none', 'pending', 'confirmed');
exception when duplicate_object then null; end $$;

-- updated_at helper --------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- users (modelled now, DORMANT until v2) -----------------------------------
create table if not exists users (
  id           uuid primary key default gen_random_uuid(),
  email        text unique,
  display_name text,
  phone        text,
  role         user_role not null default 'member',
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- categories ----------------------------------------------------------------
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  sort_order  int  not null default 0,
  active      boolean not null default true
);

-- practitioners (the directory — the unique core) --------------------------
create table if not exists practitioners (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid references users(id) on delete set null,   -- nullable; self-edit in v2
  name          text not null,
  practice_name text,
  slug          text not null unique,
  description   text not null,
  bio           text,
  area          text,
  mode          listing_mode not null default 'both',
  whatsapp      text,
  email         text,
  website       text,
  instagram     text,
  photo_url     text,
  pricing_note  text,
  languages     text,
  keywords      text,
  is_member     boolean not null default false,
  status        practitioner_status not null default 'pending',
  auto_check    auto_check_result   not null default 'ok',
  flag_count    int     not null default 0,
  featured      boolean not null default false,
  source        practitioner_source not null default 'hearth_form',
  search_vector tsvector generated always as (
    to_tsvector('english',
      coalesce(name,'')         || ' ' ||
      coalesce(practice_name,'')|| ' ' ||
      coalesce(description,'')  || ' ' ||
      coalesce(area,'')         || ' ' ||
      coalesce(keywords,'')
    )
  ) stored,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- at least one contact method (also enforced app-side)
  constraint practitioners_contact_check
    check (whatsapp is not null or email is not null or website is not null)
);

create index if not exists practitioners_status_idx        on practitioners (status);
create index if not exists practitioners_search_idx        on practitioners using gin (search_vector);
create trigger practitioners_set_updated_at before update on practitioners
  for each row execute function set_updated_at();

-- practitioner_categories (many-to-many) -----------------------------------
create table if not exists practitioner_categories (
  practitioner_id uuid not null references practitioners(id) on delete cascade,
  category_id     uuid not null references categories(id)    on delete cascade,
  primary key (practitioner_id, category_id)
);
create index if not exists practitioner_categories_cat_idx on practitioner_categories (category_id);

-- events --------------------------------------------------------------------
create table if not exists events (
  id                  uuid primary key default gen_random_uuid(),
  host_practitioner_id uuid references practitioners(id) on delete set null,  -- links event <-> directory
  submitted_by_user_id uuid references users(id)         on delete set null,  -- dormant until v2
  recurrence_parent_id uuid references events(id)        on delete set null,  -- self-ref for series
  category_id         uuid references categories(id)     on delete set null,  -- SHARED taxonomy
  title               text not null,
  description         text,
  registration_link   text,
  start_at            timestamptz not null,
  end_at              timestamptz,
  location_text       text,
  mode                listing_mode not null default 'in_person',
  host_name           text,
  cost_note           text,
  image_url           text,
  recurrence_rule     text,                                  -- iCal RRULE
  status              event_status  not null default 'pending',
  featured            boolean       not null default false,
  source              event_source  not null default 'hearth_form',
  external_id         text,                                  -- Google Calendar id, for dedupe
  search_vector       tsvector generated always as (
    to_tsvector('english',
      coalesce(title,'')        || ' ' ||
      coalesce(description,'')  || ' ' ||
      coalesce(location_text,'')|| ' ' ||
      coalesce(host_name,'')
    )
  ) stored,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- dedupe imported calendar events on (source, external_id)
create unique index if not exists events_source_external_idx
  on events (source, external_id) where external_id is not null;
create index if not exists events_status_start_idx on events (status, start_at);
create index if not exists events_search_idx       on events using gin (search_vector);
create index if not exists events_category_idx     on events (category_id);
create trigger events_set_updated_at before update on events
  for each row execute function set_updated_at();

-- reports (community flagging) ---------------------------------------------
create table if not exists reports (
  id               uuid primary key default gen_random_uuid(),
  practitioner_id  uuid references practitioners(id) on delete cascade,
  event_id         uuid references events(id)        on delete cascade,
  reporter_user_id uuid references users(id)         on delete set null,
  reporter_contact text,                              -- email/WhatsApp; dedupes reporters (not a login)
  reason           report_reason not null default 'other',
  details          text,
  status           report_status not null default 'open',
  created_at       timestamptz not null default now(),
  -- exactly one target
  constraint reports_one_target_check check (
    (practitioner_id is not null)::int + (event_id is not null)::int = 1
  )
);
create index if not exists reports_practitioner_idx on reports (practitioner_id);
create index if not exists reports_event_idx        on reports (event_id);

-- registrations (RSVP/tickets — modelled now, DORMANT until v3) -------------
create table if not exists registrations (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references events(id) on delete cascade,
  user_id        uuid references users(id) on delete set null,   -- no-login registration allowed
  attendee_name  text,
  attendee_email text,
  status         registration_status not null default 'registered',
  ticket_code    text,
  payment_method payment_method not null default 'free',
  payment_status payment_status not null default 'none',
  proof_url      text,
  created_at     timestamptz not null default now()
);
create index if not exists registrations_event_idx on registrations (event_id);

-- Row-Level Security -------------------------------------------------------
alter table users                   enable row level security;
alter table categories              enable row level security;
alter table practitioners           enable row level security;
alter table practitioner_categories enable row level security;
alter table events                  enable row level security;
alter table reports                 enable row level security;
alter table registrations           enable row level security;

-- Public (anon) READ-ONLY access, live content only.
create policy categories_public_read on categories
  for select to anon, authenticated using (active = true);

create policy practitioners_public_read on practitioners
  for select to anon, authenticated using (status = 'live');

create policy practitioner_categories_public_read on practitioner_categories
  for select to anon, authenticated using (
    exists (select 1 from practitioners p
            where p.id = practitioner_categories.practitioner_id
              and p.status = 'live')
  );

create policy events_public_read on events
  for select to anon, authenticated using (status = 'live');

-- Authenticated users in v1 are admins/stewards only → full access.
-- (Public writes are mediated by server actions using the service role, which
--  bypasses RLS; the anon role therefore needs no write policies.)
create policy categories_admin_all    on categories              for all to authenticated using (true) with check (true);
create policy practitioners_admin_all  on practitioners           for all to authenticated using (true) with check (true);
create policy pract_cat_admin_all      on practitioner_categories for all to authenticated using (true) with check (true);
create policy events_admin_all         on events                  for all to authenticated using (true) with check (true);
create policy reports_admin_all        on reports                 for all to authenticated using (true) with check (true);
create policy registrations_admin_all  on registrations           for all to authenticated using (true) with check (true);
create policy users_admin_all          on users                   for all to authenticated using (true) with check (true);

-- Seed: the 11 starter categories (idempotent) -----------------------------
insert into categories (name, slug, description, sort_order) values
  ('Bodywork & Massage',               'bodywork-massage',               'Massage therapy, deep tissue, Thai, lymphatic, reflexology', 1),
  ('Somatic & Movement',               'somatic-movement',               'Somatic therapy, dance/movement, yoga, breathwork, Qigong',  2),
  ('Energy Healing',                   'energy-healing',                 'Reiki, energetic alignment, sound healing, crystal healing', 3),
  ('Manual & Physical Therapies',      'manual-physical-therapies',      'Osteopathy, chiropractic, physiotherapy, acupuncture',       4),
  ('Mental & Emotional Wellbeing',     'mental-emotional-wellbeing',     'Counselling, coaching, psychotherapy, hypnotherapy',         5),
  ('Ceremony & Plant Medicine',        'ceremony-plant-medicine',        'Cacao ceremonies, medicine people, facilitators',            6),
  ('Spiritual Guidance',               'spiritual-guidance',             'Astrology, tarot, intuitive readings, shamanic practice',    7),
  ('Nutrition & Herbalism',            'nutrition-herbalism',            'Holistic nutrition, herbalism, Ayurveda',                    8),
  ('Classes, Workshops & Facilitation','classes-workshops-facilitation', 'Workshop facilitators, retreat organisers, teachers',        9),
  ('Creative & Expressive Arts',       'creative-expressive-arts',       'Art therapy, music, voice',                                 10),
  ('Conscious Business & Other',       'conscious-business-other',       'Eco/ethical products, services that don''t fit above',      11)
on conflict (slug) do nothing;
