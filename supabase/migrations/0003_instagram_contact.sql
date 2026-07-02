-- 0003: allow Instagram to satisfy the "at least one contact" rule.
--
-- Originally a practitioner needed at least one of WhatsApp / Email / Website.
-- Instagram is a first-class way to reach many practitioners (especially in
-- this community), so it now counts too — matching the app-side validation in
-- src/lib/actions/submit-practitioner.ts. Safe to re-run.

alter table practitioners
  drop constraint if exists practitioners_contact_check;

alter table practitioners
  add constraint practitioners_contact_check
    check (
      whatsapp  is not null
      or email     is not null
      or website   is not null
      or instagram is not null
    );
