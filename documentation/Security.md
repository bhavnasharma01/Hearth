# Hearth — Security & Trust Overview

*High-level security, privacy, and abuse-resistance overview. Living document — update as the app evolves.*

---

## 1. Threat context

Hearth is a **public, no-login** community resource for a ~550-person trust-based community. There are no member passwords to steal (the public never authenticates), and all directory data is **public by design** (it exists to be found). So the security focus is **not** confidentiality of user accounts — it's:

1. **Abuse resistance** — spam listings, fake/malicious submissions, flag-brigading.
2. **Data integrity** — only `live` content is shown; writes are controlled.
3. **Admin account safety** — the one privileged surface is the admin panel.
4. **Privacy of reporters** — flagging is private and not weaponizable.

---

## 2. Authentication & authorization

- **Public surface — no auth.** Browsing, submitting a practitioner/event, and reporting require no account. This is a deliberate product principle, not an oversight.
- **Admin surface — Supabase Auth.** Only stewards/admins sign in. Admin routes (`/admin/*`) are gated server-side; an unauthenticated request never reaches admin data or mutations.
- **Authorization = roles.** The `users.role` enum (`member`/`practitioner`/`steward`/`admin`) governs privilege. In v1 only `steward`/`admin` accounts exist; `member`/`practitioner` accounts arrive in v2.

---

## 3. Row-Level Security (RLS) — the backstop

RLS is enabled on all tables so the database itself enforces access, even if app code has a bug:

- **Public read, live-only:** the anon role can `SELECT` only rows with `status = 'live'` (practitioners, events) and `categories` where `active = true`. `practitioner_categories` is visible only for live practitioners. This is enforced by policy in `supabase/migrations/0001_initial_schema.sql`.
- **Anon is READ-ONLY.** The anon role has **no insert/update/delete policies** at all — so a leaked anon key cannot write anything.
- **Public writes are mediated by trusted server actions** using the **service-role key** (server-only, never shipped to the client), which bypasses RLS. This is what lets the content-check gate run and set `status`/`auto_check` server-side — the client never supplies those, and the write path cannot be bypassed. *(This is a deliberate hardening over the original spec, which had anon inserting directly.)*
- **Admin full access:** authenticated users (admins/stewards only, in v1) get full CRUD via `..._admin_all` policies, seeing `pending`/`hidden` content.
- **Dormant tables** (`users`, `registrations`) carry only the admin policy until their features turn on.

---

## 4. Submission abuse — content checks

Every public submission passes an **automated content check** before it can go `live` (`/lib/moderation`):

- **Banned-word / spam-pattern scan** (e.g. many URLs, known spam phrases).
- **Required-field completeness** (incl. the at-least-one-contact rule, also a DB `CHECK`).
- **Result → `auto_check`:** `ok` → publish instantly (`status = live`); `needs_review` → hold as `status = pending` (not public) **and notify the admin immediately.** Legitimate users get instant publish; only the small suspicious fraction waits.

All user input is treated as untrusted: validated server-side, parameterized in queries (no string-built SQL — Supabase client/prepared statements), and **escaped on render** to prevent stored XSS in descriptions/bios.

---

## 5. Flagging / reporting — abuse-resistant by design

- Reporting asks for the reporter's **email or WhatsApp** — a **field for de-duplication, not a login**.
- The system counts **distinct reporters** per target (deduped by `reporter_contact`). One person = one flag, however many times they submit.
- **Flags never auto-hide anything.** Crossing **3 distinct reporters** only **notifies a human**, who decides whether to set `status = hidden`.
- **No public flag counts** — nothing to brigade, no public shaming; reporting is private.
- **Reporter-pattern check:** one contact flagging many different listings is surfaced to the admin and those flags can be discounted (points to a malicious reporter, not a bad listing).

**Honest limit:** with no real accounts, nothing free is fully sybil-proof. For a trust-based community of this size, dedupe + human-in-the-loop + no automatic consequence is more than enough. If abuse ever escalates, the v2 account layer raises the bar.

---

## 6. Secrets & keys

- **Supabase keys:** the **anon/public key** is safe in the browser *because RLS constrains it* — it can only do what policies allow. The **service-role key is server-only**, never shipped to the client, used only in trusted server actions / scripts.
- **Google Calendar:** the seed import reads the calendar's **public iCal feed** — **no API key or secret at all**, read-only, lowest possible risk.
- All secrets live in environment variables (`.env`, Vercel project settings), never committed.

---

## 7. Privacy

- Directory/event data is **public by design** — practitioners consent by submitting (the community agreement checkbox).
- **Reporter contact** is collected only for dedupe, stored privately, never displayed.
- **No tracking, no ads, no third-party analytics** beyond what's strictly needed; nothing that profiles visitors.
- Contact links use `wa.me`/`mailto:` — no contact data is brokered through a server.

---

## 8. Operational safety

- **Least privilege:** day-to-day stewardship uses the admin panel, not direct DB access.
- **Auditable status changes:** `status`, `auto_check`, and `reports.status` record the moderation lifecycle.
- **No money on platform:** even in the v3 registration model, payment happens off-platform (cash/e-transfer + uploaded proof) — Hearth never becomes a payment processor, removing PCI/financial-data risk.

---

## 9. Security TODO / watchlist

*(Track concrete items in `Bugs.md`; this is the standing checklist for the build.)*
- [x] Write RLS policies for every table (done in `0001_initial_schema.sql`; anon read-only, live-only; admin full access). *Still verify against the live project once connected.*
- [x] Public write paths implemented as service-role server actions (`src/lib/actions/*`) with the content-check gate (`src/lib/moderation/content-check.ts`); `status`/`auto_check` set server-side. *(Build 4)*
- [ ] Rate-limit + bot check (honeypot/hCaptcha) on the public submission forms — still open (the forms currently rely on the content-check + human moderation only).
- [ ] Rate-limit public submit/report endpoints (defense against flood spam).
- [ ] Add a lightweight bot check (honeypot field / hCaptcha) to public forms.
- [ ] Sanitize/escape all rendered user text; verify no `dangerouslySetInnerHTML` on user content.
- [x] Google Calendar import uses the public iCal feed — no API key to restrict or leak. *(Build 5)*
- [ ] Confirm service-role key never reaches a client bundle.
