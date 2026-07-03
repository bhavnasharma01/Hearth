-- 0006: Storage bucket for practitioner avatars (profiles-as-mini-sites, 1b).
--
-- A public bucket so images serve via public URLs (they're shown on public
-- profiles/cards). Uploads go through a service-role server action (uploadAvatar)
-- which validates type + size — the anon role gets NO storage write policy, so it
-- can't upload directly. Safe to re-run.
--
-- Alternatively, create this in the dashboard: Storage → New bucket → name
-- "avatars" → toggle "Public bucket" → Create.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;
