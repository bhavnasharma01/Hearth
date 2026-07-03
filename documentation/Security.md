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
- **Admin surface — Supabase Auth.** Only stewards/admins sign in. Admin routes (`/admin/*`) are gated server-side (`getAdminUser` → redirect to login); an unauthenticated request never reaches admin data or mutations. *(Build 13.)*
  - **Authorization = an `ADMIN_EMAILS` allowlist**, not merely "is authenticated." Even a logged-in non-allowlisted user is bounced. *(Who receives steward **alert emails** is a separate `NOTIFY_EMAILS` list — see §6 — so moderation access and email recipients are configured independently.)*
  - **All admin reads/writes use the service-role client**, and every admin mutation calls `requireAdmin()` first — so admin power never depends on the broad `authenticated` RLS policies (defence in depth). Keep public sign-ups disabled in Supabase Auth; create stewards via the dashboard.
  - `src/middleware.ts` refreshes the session cookie on `/admin` navigation (recommended `@supabase/ssr` pattern).
- **Authorization = roles.** The `users.role` enum (`member`/`practitioner`/`steward`/`admin`) governs privilege. In v1 only `steward`/`admin` accounts exist; `member`/`practitioner` accounts arrive in v2.

---

## 3. Row-Level Security (RLS) — the backstop

RLS is enabled on all tables so the database itself enforces access, even if app code has a bug:

- **Public read, live-only:** the anon role can `SELECT` only rows with `status = 'live'` (practitioners, events) and `categories` where `active = true`. `practitioner_categories` is visible only for live practitioners. This is enforced by policy in `supabase/migrations/0001_initial_schema.sql`.
- **Anon is READ-ONLY.** The anon role has **no insert/update/delete policies** at all — so a leaked anon key cannot write anything.
- **Public writes are mediated by trusted server actions** using the **service-role key** (server-only, never shipped to the client), which bypasses RLS. This is what lets the content-check gate run and set `status`/`auto_check` server-side — the client never supplies those, and the write path cannot be bypassed. *(This is a deliberate hardening over the original spec, which had anon inserting directly.)*
- **Admin full access:** authenticated users (admins/stewards only, in v1) get full CRUD via `..._admin_all` policies, seeing `pending`/`hidden` content.
- **Dormant tables** (`users`, `registrations`) carry only the admin policy until their features turn on.
- **`feedback` (testing) is admin-only.** It has **no anon policy at all** — the anon role can neither read nor write it (a leaked anon key exposes nothing). Public submissions are inserted by a service-role server action; the `/feedback` form is unlisted and gated by `FEEDBACK_ENABLED` (off ⇒ 404 at launch). *(Build 18.)*
- **Owner edit is capability-based, not a login (`manage_token`).** A practitioner edits their own listing via a secret `/manage/<manage_token>` URL — an unguessable UUID that grants edit rights to **that one listing only** (never admin). It's **column-revoked from the `anon`/`authenticated` roles** (`revoke select (manage_token)`) so it can't leak through a public `select *`, and is only ever read via the service-role. Edits re-run the content-check (a flagged live listing is held for review), so the link can't push spam public. Treat the link like a password; it can be rotated by reissuing the token. *(Build 23.)*

---

## 4. Submission abuse — content checks

Every public submission passes an **automated content check** before it can go `live` (`/lib/moderation`):

- **Banned-word / spam-pattern scan** (e.g. many URLs, known spam phrases).
- **Required-field completeness** (incl. the at-least-one-contact rule, also a DB `CHECK`).
- **Result → `auto_check`:** `ok` → publish instantly (`status = live`); `needs_review` → hold as `status = pending` (not public) **and notify the admin immediately** — an email to `ADMIN_EMAILS` via `src/lib/notify.ts` (Resend or Gmail SMTP), naming the listing and why it was held, with a link to `/admin/moderation`. Legitimate users get instant publish; only the small suspicious fraction waits. *(Wired for practitioners in Build 14.)*

All user input is treated as untrusted: validated server-side, parameterized in queries (no string-built SQL — Supabase client/prepared statements), and **escaped on render** to prevent stored XSS in descriptions/bios.

---

## 5. Flagging / reporting — abuse-resistant by design

- Reporting asks for the reporter's **email or WhatsApp** — a **field for de-duplication, not a login**.
- The system counts **distinct reporters** per target (deduped by `reporter_contact`). One person = one flag, however many times they submit.
- **Flags never auto-hide anything.** Crossing **3 distinct reporters** only **notifies a human** — an email to `ADMIN_EMAILS` (Resend or Gmail SMTP, via `src/lib/notify.ts`) fired **once** on crossing, with the listing name, reason, and links to the listing + `/admin/reports` — who decides whether to set `status = hidden`. *(Wired in Build 14; previously a silent server log.)*
- **No public flag counts** — nothing to brigade, no public shaming; reporting is private.
- **Reporter-pattern check:** one contact flagging many different listings is surfaced to the admin and those flags can be discounted (points to a malicious reporter, not a bad listing).

**Honest limit:** with no real accounts, nothing free is fully sybil-proof. For a trust-based community of this size, dedupe + human-in-the-loop + no automatic consequence is more than enough. If abuse ever escalates, the v2 account layer raises the bar.

---

## 6. Secrets & keys

- **Supabase keys:** the **anon/public key** is safe in the browser *because RLS constrains it* — it can only do what policies allow. The **service-role key is server-only**, never shipped to the client, used only in trusted server actions / scripts.
- **Google Calendar:** the seed import reads the calendar's **public iCal feed** — **no API key or secret at all**, read-only, lowest possible risk.
- **Email alerts (Resend or Gmail SMTP):** the credentials (`RESEND_API_KEY`, or `GMAIL_USER`/`GMAIL_APP_PASSWORD`) are **server-only** (read only inside `src/lib/notify.ts`, which is `server-only`), never shipped to the client. Each is a **scoped, independently revocable** send credential — a Resend API key, or a Google App Password (not the account's real password, on a 2-Step-Verification account) — i.e. least-privilege for a send-only role. Alerts go to **`NOTIFY_EMAILS`** (falling back to `ADMIN_EMAILS` when unset) — the alert recipient list is **decoupled from admin-panel access**, so who can log in and who is emailed are configured independently. Visitor/reporter contact data is never included beyond what a steward needs. Absent any credentials, alerts fall back to server-console logs.
- All secrets live in environment variables (`.env`, Vercel project settings), never committed.

---

## 7. Privacy

- Directory/event data is **public by design** — practitioners consent by submitting (the community agreement checkbox).
- **Reporter contact** is collected only for dedupe, stored privately, never displayed.
- **No tracking, no ads, no third-party analytics** beyond what's strictly needed; nothing that profiles visitors.
- **"Near me" location** is used only to build the page URL (`?lat=&lng=`) so the server can sort by distance — it is **never stored server-side, logged, or sent to any third party**. Geolocation requires the visitor's explicit per-use permission (and HTTPS). Practitioner coordinates are **area-level** (geocoded from `area`, e.g. a neighbourhood), never a home address.
- Contact links use `wa.me`/`mailto:` — no contact data is brokered through a server.
- **Feedback** (testing phase) is stored privately and shown only in the admin board; the optional name/contact a tester provides is used only for follow-up, never displayed publicly.

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
- [x] "Notify a human" actually delivered — email to `ADMIN_EMAILS` (Resend or Gmail SMTP, `src/lib/notify.ts`) on a held submission and on crossing the 3-reporter threshold; no credentials ⇒ console log; never throws. *(Build 14; practitioners)*
- [ ] Rate-limit + bot check (honeypot/hCaptcha) on the public submission forms — still open (the forms currently rely on the content-check + human moderation only).
- [ ] Rate-limit public submit/report endpoints (defense against flood spam).
- [ ] Add a lightweight bot check (honeypot field / hCaptcha) to public forms.
- [ ] Sanitize/escape all rendered user text; verify no `dangerouslySetInnerHTML` on user content.
- [x] Google Calendar import uses the public iCal feed — no API key to restrict or leak. *(Build 5)*
- [ ] Confirm service-role key never reaches a client bundle.
