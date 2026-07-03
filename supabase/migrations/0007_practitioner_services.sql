-- 0007: practitioner services menu (profiles-as-mini-sites, 1c).
--
-- A small structured "what I offer" list per practitioner (title · optional
-- blurb · optional price note), managed from the /manage/<token> page. Public
-- read only for LIVE practitioners (mirrors practitioner_categories); writes go
-- through the service-role manage action. Safe to re-run.

create table if not exists practitioner_services (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners(id) on delete cascade,
  title           text not null,
  description     text,
  price_note      text,
  sort_order      int  not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists practitioner_services_practitioner_idx
  on practitioner_services (practitioner_id);

alter table practitioner_services enable row level security;

create policy practitioner_services_public_read on practitioner_services
  for select to anon, authenticated using (
    exists (
      select 1 from practitioners p
      where p.id = practitioner_services.practitioner_id
        and p.status = 'live'
    )
  );

create policy practitioner_services_admin_all on practitioner_services
  for all to authenticated using (true) with check (true);
