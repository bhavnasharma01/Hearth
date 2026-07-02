# Claude.md — working notes for the AI assistant

*Tips, conventions, and nuances for working on Hearth. Read this alongside `Readme.md`. Update it whenever you learn something non-obvious.*

---

## What this project is

Hearth is a free, phone-first community hub: a **practitioner directory** (the defensible core) + a **native events layer** (the warm front door), database-backed with **Next.js + Supabase**. See `documentation/Product.md` for the North Star — **check every decision against it**: *does this strengthen the trusted, low-friction home, or just make it bigger / rebuild what WhatsApp/Luma already do?*

---

## Document map (what each file is for)

**Root:**
- **`Readme.md`** — high-level overview, tech stack, repo layout, version/build. Start here.
- **`Changelog.md`** — every change, newest at top, grouped by build under the current version. Append here at the end of each work session.
- **`Claude.md`** *(this file)* — working notes, conventions, nuances for the assistant.
- **`Bugs.md`** — known bugs/issues spotted while thinking or building; tick them off as fixed.

**`documentation/` (living source-of-truth docs):**
- **`Architecture.md`** — system design, tech stack, app structure, data flow.
- **`Security.md`** — auth, RLS, abuse-resistance, privacy, secrets. Security watchlist lives here.
- **`Product.md`** — North Star, personas, experience, forms, scope staging. The "why."
- **`Design.md`** — visual system, mobile-first UX, components, what to avoid.
- **`Hearth - Database Schema.md`** + **`.mermaid`** — the full data model & ER diagram. **The authoritative schema.**
- **`planning-archive/`** — original planning docs (North Star, Product Brief, Implementation Spec, Proposals, Anat & Curtis's message). **Preserved for provenance only**; their content is assimilated into the living docs. Don't edit them; cite them.

---

## Core conventions & locked decisions

- **Database-backed** (Next.js + Supabase), **not** the old static-site/Google-Sheets plan. The archived Implementation Spec describes that superseded approach — read it for context, but the living docs win.
- **No login for the public.** Browsing, submitting, and reporting never require an account. Only admins authenticate (Supabase Auth). The `users`/`registrations` tables are **modelled but dormant** until v2/v3 — don't wire them up yet.
- **Trust signal = community-member badge only.** No public upvotes or written reviews in v1.
- **Status is server-controlled.** Never trust `status`/`auto_check` from the client. Public submissions go `live` (clean) or `pending` (suspicious) via the server-side content check.
- **RLS is the backstop** — public read = `status = live` only; public may insert submissions/reports but not update/delete. Write/verify policies before any public write path ships.
- **Provenance everywhere** — set `source` (and `external_id` for imports) on every practitioner/event row.
- **Linked layers** — wire `events.host_practitioner_id` so directory↔events cross-discovery works.
- **Search is a DB feature** — use Postgres `search_vector`, not client-side filtering hacks.
- **Mobile-first, calm aesthetic** — soft greens/whites, rounded cards (see `Design.md`). No Yelp-style ratings, no default month-grid calendar, no corporate vibes.

---

## Versioning & changelog ritual (per `/wouldyou` workflow)

- **Version** and **Build** live in `Readme.md` (and the app's about surface once code exists).
- **Increment the Build number** each work session; **do not** bump the Version unless explicitly told.
- **Append changes to the top of `Changelog.md`** under the new build + current version.
- If a change touches anything a doc references, **update that doc** in the same session.
- **Build the app** to confirm it compiles without errors/warnings before finishing (once code exists).

---

## Gotchas & nuances

- **Two source docs disagreed.** The archived Implementation Spec says "$0 static site, no DB, events are a commodity — don't build them." We **overrode** that: database-backed + native events. If you find guidance that contradicts the living docs, the living docs are authoritative.
- **"Events are a commodity" still half-applies** — we still happily link out to Luma/Eventbrite registration links; we just own the *listing and the on-phone experience.* Don't rebuild ticketing/payments (that's deferred to v3, and even then payment stays off-platform).
- **At-least-one-contact rule** is enforced both app-side and as a DB `CHECK (whatsapp IS NOT NULL OR email IS NOT NULL OR website IS NOT NULL OR instagram IS NOT NULL)`. Keep both. **Instagram counts** (Build 17, migration `0003_instagram_contact.sql`) — it was added to the check so an Instagram-only practitioner can list (matches the original spec's "…or social link"). If you edit the contact set, change **both** the app validation and the DB constraint or they'll disagree (app passes, DB insert fails).
- **Flag threshold = 3 distinct reporters**, deduped by `reporter_contact`. Flags **notify**, never auto-hide. No public flag counts.
- **Category seed = 11 rows** (see schema §`categories`). Categories are a table, not a hardcoded list — admins add more.
- **Historical event import** = the **"Conscious Events TO Calendar"** (`src = consciouseventsto@gmail.com`, tz `America/Toronto`), **2026-01-01 forward**, `source = google_calendar`, deduped by `external_id`. Today's form (https://forms.gle/fzgQ7s43udWcFaSr6) captures only name + registration link + start/end; Hearth's `events` table is a strict superset (see `documentation/Product.md §7`).
- **Supabase keys:** anon key is browser-safe *because of RLS*; service-role key is server-only — never bundle it client-side.

---

## Admin panel (Build 13)

- Auth: Supabase Auth login at `/admin/login`. Gate = `getAdminUser()` (session email ∈ `ADMIN_EMAILS`). Pages live under `app/admin/(protected)/` (route group → URLs are `/admin/...`); the group's layout redirects non-admins to login.
- **Two clients again:** identity from the session (server client, `src/lib/auth.ts`); all admin **reads** (`src/lib/data/admin.ts`) and **writes** (`src/lib/actions/admin.ts`) use the **service role**, and every action calls `requireAdmin()` first. Don't rely on `authenticated` RLS for admin.
- To use it: set `ADMIN_EMAILS` (local + Vercel) and create the matching user in Supabase Auth (Dashboard → Authentication → Add user, auto-confirm). Keep public sign-ups disabled.
- `src/middleware.ts` (matcher `/admin/:path*`) refreshes the session cookie.
- Note: admin pages currently also render the public `SiteHeader`/`SiteFooter` (single root layout) — cosmetic, fine for now.

## Steward email alerts + pilot flags (Build 14)

- **Single email path:** `src/lib/notify.ts` (`notifyAdmins`, `server-only`) is the *only* place email is sent. Recipients = `adminEmails()` (the `ADMIN_EMAILS` allowlist doubles as the notify list). Two pluggable transports, chosen by which env is set (prefers Resend): **Resend** (`RESEND_API_KEY`, plain `fetch`) or **Gmail SMTP** (`nodemailer`, `service: "gmail"`; `GMAIL_USER`/`GMAIL_APP_PASSWORD`). With neither set it **logs to the server console** (so the app builds/runs without creds, same as the Supabase-optional clients). It **never throws** — a failed alert must not break a public submission/report. Keep the *one* notify path; add transports here, don't fork it. **Recipient caveats:** Resend's onboarding sender only delivers to the Resend-account email until a domain is verified (`RESEND_FROM`); Gmail SMTP has no such limit. `nodemailer` is in `serverExternalPackages` (next.config) so it doesn't get bundled. The Gmail app password is `.replace(/\s+/g, "")`-cleaned (Google displays it with spaces).
- **Two alert moments (practitioners):** a held submission (`submitPractitioner`, `status = pending`) and crossing **3 distinct reporters** (`submitReport`). The report email fires **once, on crossing** (`distinct === FLAG_THRESHOLD`), not on every later report — keep that guard or you'll spam the steward. Events are hidden, so event alerts aren't wired (the code path is practitioner-scoped).
- **Absolute links in emails:** use `siteUrl(path)` (`src/lib/url.ts`) — emails can't use relative URLs. Defaults to the prod domain; override with `NEXT_PUBLIC_SITE_URL`.
- **New env:** either `RESEND_API_KEY` (+ optional `RESEND_FROM`) **or** `GMAIL_USER` + `GMAIL_APP_PASSWORD` (a Google App Password on a 2SV-enabled account) turns on real sending; optional `NEXT_PUBLIC_SITE_URL`. All in `.env.example`.
- **Current deployment (as of Build 14) + migration plan:** running on **Resend** with the free onboarding sender (`RESEND_API_KEY` set in Vercel). *Stopgap limitation:* that sender only delivers to the **one** inbox the Resend account is registered under — fine for the single-steward pilot, **not** sustainable once multiple admins need alerts. **If Bhavna asks to "switch to Google/Gmail SMTP":** set `GMAIL_USER` + `GMAIL_APP_PASSWORD` in Vercel **and remove `RESEND_API_KEY`** (notify.ts prefers Resend when both are set) → all `ADMIN_EMAILS` then receive. Pre-req she hit: no dedicated Gmail yet (Google per-phone account cap) and won't send from her personal Gmail — sort a sending account first. *Alternative (no Gmail needed):* verify the domain she already owns in Resend + set `RESEND_FROM`, which also lifts the one-inbox limit. (Consider adding a `NOTIFY_PROVIDER` selector when switching, so it's a one-var flip.)
- **`EVENTS_ENABLED` flag** (`src/lib/features.ts`, currently `false`): the practitioner-only pilot switch. It gates **every public events surface** — nav (`SiteHeader`), home peek + hero CTA/copy (`app/page.tsx`), profile "events they host" (`app/p/[slug]`), `/events` + `/add-event` (→ `notFound()`), footer copy, and the import cron (`/api/cron/import` short-circuits). **To bring events back: set it to `true`** — no other change needed. Admin event management is intentionally *not* gated (behind auth, invisible to public). `EventCard`/`getEvents`/etc. are still referenced under the flag, so they're not orphaned.
- **Report a practitioner** is now on the **card** (`PractitionerCard`) *and* the profile — the backend/`/report`/admin inbox always handled practitioners; Build 14 just fixed discoverability.

## Dev commands

- `npm run dev` — local dev at http://localhost:3000 (runs without env; pages show empty states until Supabase is connected).
- `npm run build` — production build. **Must compile with zero errors/warnings** before committing.
- `npm run lint` — ESLint.
- Apply DB schema: run `supabase/migrations/0001_initial_schema.sql` in the Supabase SQL editor (or via the Supabase CLI).
- Import community events: `npm run import:calendar` — reads the **public iCal feed** (no API key), parses with `node-ical`, inserts via service role, deduped by `external_id`. Safe to re-run.
- **Single import implementation:** the parse/dedupe/insert logic lives in `src/lib/import/ics-core.mjs` (pure, typed by `.d.mts`). Both the script **and** the cron route (`src/lib/import/calendar.ts` → `/api/cron/import`) use it — don't fork it. `node-ical` is in `serverExternalPackages` (next.config) or the route build fails (`BigInt` bundling error).
- **Daily auto-import:** Vercel Cron (`vercel.json`, 09:00 UTC) hits `/api/cron/import`, guarded by `CRON_SECRET` (set in Vercel; unset locally = open for manual `curl`). It imports **and then** geocodes new addressed events/practitioners via `geocodePending` (capped 20/run, throttled ~1/sec, reuses `geocodeAddress`) — so new locations join "near me" without a manual step. `npm run geocode` remains for bulk/manual backfill.
- Backfill coordinates: `npm run geocode` — geocodes events (`location_text`) + practitioners (`area`) that have a location but no coords, via Nominatim.

## "Near me" / geocoding

- Coords live in `latitude`/`longitude`/`geocoded_at` on events **and** practitioners. Events geocode from `location_text` (precise); practitioners from `area` (coarse — never a home address).
- **`area` is a *required* field** on the practitioner form (Build 16) — a listing with no location silently vanishes from "near me", so we enforce it. Both forms use the shared **`AddressAutocomplete`** (pass `name` — `location_text` for events, `area` for practitioners); picking a suggestion pins precise coords via hidden `latitude`/`longitude`. Both submit actions call **`resolveCoordsFromForm(formData, text)`** (`src/lib/geocode.ts`) — prefers the picked coords, else geocodes the typed text. Don't re-inline that resolver; extend the shared one.
- **Geocode only on write** (submit/import/backfill) via `src/lib/geocode.ts` (Nominatim, `server-only`); never on public reads. The `/api/geocode` route proxies autocomplete so the browser never calls Nominatim directly.
- **Gotcha:** Nominatim chokes on venue-name prefixes + postal codes ("Hendon Park, 50 Hendon Ave … M2M 1A2"). `geocodeAddress` strips those and tries fallback variants — keep that logic if you touch it.
- Distance/sort/filter: `src/lib/geo.ts` (`withDistance`). Pages read `?lat=&lng=&radius=`; `LocationControl` sets them. **Geolocation needs HTTPS** — works on localhost + Vercel, but not the plain-http LAN URL on a phone (use the "type a place" box there).
- **Recurring events** are stored as one row per occurrence (from the import). `getEvents` calls `collapseSeries` to show each series **once** (its next upcoming occurrence), keyed by the `external_id` UID prefix — so a weekly event doesn't repeat (this was the near-me "same event over and over" bug, fixed Build 8). The hard `limit` is applied in JS *after* collapse + distance sort, not in SQL.
- Public list pages are `export const dynamic = "force-dynamic"` (they read live data per request; no DB fetch at build time).
- Filtering is **URL-param driven & server-rendered** (no client JS): `?q=&category=&mode=` via `FilterChips` link chips + GET search form.
- **Two Supabase clients:** `src/lib/supabase/server.ts` (anon, RLS-bound, READS for public pages) vs. `src/lib/supabase/admin.ts` (service-role, `server-only`, WRITES inside server actions). Never use the admin client outside a server action; never import it into a client component.
- **Submissions** go through server actions (`src/lib/actions/submit-*.ts`) used with React `useActionState`. The action sets `status`/`auto_check` from `runContentCheck` — clean → `live`, suspicious → `pending`. Both clients return `null` when env is unset so the app builds/runs without Supabase.
- Event times: forms use `datetime-local`; `src/lib/datetime.ts` converts the entered wall time (America/Toronto) to a UTC ISO before storage.

## Open questions (track resolutions here)

1. ~~v1 = Directory + Events together~~ **Confirmed** (native events chosen).
2. ~~Event taxonomy~~ **Resolved:** events reuse the practitioner `categories` table via `events.category_id` (shared taxonomy; same chips on both tabs).
3. ~~Seed import — which Google Calendar?~~ **Resolved:** "Conscious Events TO Calendar" (`consciouseventsto@gmail.com`, `America/Toronto`). *Still need:* confirm publicly API-readable + the 2026-01-01-forward window.
4. Brand — using a soft-green/cream default (see `documentation/Design.md`); confirm or supply Anat & Curtis's colours/logo to reskin.
5. Initial admins — Bhavna + Anat + Curtis? (needed when wiring admin auth.)
6. Endorsements — park for v2 or rule out entirely?
