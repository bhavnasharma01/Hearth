-- 0005: editable listings (private "manage" link) + "accepting clients" status.
--
-- v1 has no practitioner logins, so a listing was frozen after submission. This
-- adds a per-listing MANAGE TOKEN — an unguessable capability URL, /manage/<token>
-- — that lets a practitioner edit their own listing without an account, plus an
-- "accepting clients" flag they can toggle. Safe to re-run.

alter table practitioners
  add column if not exists manage_token uuid not null default gen_random_uuid();

create unique index if not exists practitioners_manage_token_idx
  on practitioners (manage_token);

alter table practitioners
  add column if not exists accepting_clients boolean not null default true;

-- The manage token is a SECRET capability — it must never reach the public.
-- Revoke column read from the public roles so it can't leak through a `select *`
-- on a public read; it's only ever read via the service-role server actions
-- (which bypass RLS + column grants). This is the DB-level backstop.
revoke select (manage_token) on practitioners from anon;
revoke select (manage_token) on practitioners from authenticated;
