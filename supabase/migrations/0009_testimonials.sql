-- 0009: testimonials (accounts Phase C).
--
-- The model that keeps the North Star intact (Product.md §6: no open reviews):
-- any SIGNED-IN member may write a recommendation from a practitioner's
-- profile, but it becomes public ONLY when the practitioner approves it —
-- visitor-initiated, owner-curated, positive-by-construction. No ratings, no
-- reply threads.
--
-- Writes go through service-role server actions only (the codebase pattern);
-- the public may read approved testimonials on live practitioners. One
-- testimonial per member per practitioner.
--
-- >>> Run in the Supabase SQL editor before the Build 60 code ships.
-- Safe to re-run.

do $$ begin
  create type testimonial_status as enum ('pending', 'approved', 'hidden');
exception when duplicate_object then null; end $$;

create table if not exists testimonials (
  id              uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references practitioners(id) on delete cascade,
  author_user_id  uuid not null references users(id)         on delete cascade,
  author_name     text not null,
  body            text not null,
  status          testimonial_status not null default 'pending',
  created_at      timestamptz not null default now(),
  -- one voice per member per practitioner
  constraint testimonials_one_per_author unique (practitioner_id, author_user_id)
);

create index if not exists testimonials_practitioner_idx
  on testimonials (practitioner_id, status);

alter table testimonials enable row level security;

-- Public read: approved testimonials on live practitioners only.
drop policy if exists testimonials_public_read on testimonials;
create policy testimonials_public_read on testimonials
  for select to anon, authenticated
  using (
    status = 'approved'
    and exists (
      select 1 from practitioners p
      where p.id = testimonials.practitioner_id and p.status = 'live'
    )
  );

-- No anon/authenticated write policies: submit/approve/hide/delete all go
-- through service-role server actions that re-verify identity server-side.
