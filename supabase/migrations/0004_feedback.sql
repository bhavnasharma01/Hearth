-- 0004: feedback (user-testing phase).
--
-- A private feedback channel for the testing rollout: testers submit via an
-- unlisted /feedback link (gated by the FEEDBACK_ENABLED app flag), and stewards
-- triage it on a status board at /admin/feedback. Never shown to the public.
--
-- Like reports: RLS-protected, admin-only readable; public writes go through a
-- service-role server action (the anon role gets no policy on this table at all,
-- so a leaked anon key can neither read nor write feedback). Safe to re-run.

do $$ begin
  create type feedback_type     as enum ('bug', 'idea', 'confusing', 'praise', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type feedback_status   as enum ('new', 'reviewing', 'planned', 'done', 'declined');
exception when duplicate_object then null; end $$;

do $$ begin
  create type feedback_priority as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

create table if not exists feedback (
  id                uuid primary key default gen_random_uuid(),
  message           text not null,
  type              feedback_type   not null default 'other',
  context           text,                                  -- optional: what they were doing / which part
  submitter_name    text,                                  -- optional
  submitter_contact text,                                  -- optional: email/WhatsApp for follow-up
  status            feedback_status not null default 'new',
  priority          feedback_priority,                     -- null = not yet triaged
  admin_note        text,                                  -- steward's private note
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists feedback_status_idx on feedback (status);

create trigger feedback_set_updated_at before update on feedback
  for each row execute function set_updated_at();

-- RLS: admin-only (authenticated). No anon policy → anon can't read or write;
-- public submissions are inserted by the service-role server action.
alter table feedback enable row level security;
create policy feedback_admin_all on feedback for all to authenticated using (true) with check (true);
