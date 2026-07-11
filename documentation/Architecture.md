# Hearth — Architecture Overview

*High-level architecture. Living document — update as the app evolves.*

> **Companion reference:** `Hearth - Database Schema.md` + `Hearth - Database Schema.mermaid` (the full ER model). This file describes the system; the schema file describes the tables.

---

## 1. Foundational decision

Hearth is a **database-backed web application** — **Next.js + Supabase (Postgres)**. This supersedes the original "$0 static site reading Google Sheets/Calendar" plan in the archived Implementation Spec. The database backing buys us: native event creation, real full-text search, an admin panel, and a clean growth path to accounts/endorsements/registrations — all without a painful migration, because the schema is modelled for the fuller vision now.

**Cost:** effectively **$0** at community scale (a few hundred listings, a calendar of events, a few hundred visitors) on Supabase + Vercel free tiers.

---

## 2. System diagram

```
                       ┌─────────────────────────────────┐
   Practitioner ─add─▶  │                                 │
   Host         ─add─▶  │   Hearth — Next.js (App Router) │ ─▶ Community
   Seeker  ─browse/────▶ │   • browse/report: no login     │    (phone-first
            report      │   • contribute: member sign-in  │     web)
   Member  ─sign in─▶   │   • admin panel (allowlist)     │
   Admin    ─sign in─▶  │   • server actions / route       │
                       │     handlers for writes          │
                       └────────────────┬─────────────────┘
                                        │
                    Supabase (Postgres + Auth + Storage)
                    • practitioners, categories,
                      practitioner_categories, events, reports
                    • users, registrations  (modelled, dormant)
                    • full-text search (tsvector)
                    • Row-Level Security (RLS)
                                        ▲
                       daily / occasional seed import
                       Public iCal feed (node-ical, no key)
                       → events  (source=google_calendar,
                                  external_id for dedupe)
```

---

## 3. Technology stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router)** + React + TypeScript | Server Components for reads; Server Actions / Route Handlers for writes. |
| Styling | **Tailwind CSS** | Implements the calm "soft greens/whites" system (see `Design.md`). |
| Database | **Supabase Postgres** | Holds the v1 schema; RLS-enforced. |
| Auth | **Supabase Auth** | **Members** (Google OAuth + email/password) for contributing; browsing needs no account. Admin = `ADMIN_EMAILS` allowlist. |
| File storage | **Supabase Storage** | Practitioner photos, event flyers; external-URL fallback supported by the schema. |
| Search | **Postgres full-text** (`tsvector` / `search_vector`) | Search is a DB feature, not a client hack. |
| Hosting | **Vercel** (Cloudflare Pages alt) | Free tier. |
| Event seed | **Google's public iCal feed** (the calendar's `…/public/basic.ics` URL) parsed with `node-ical` | Daily/occasional import; **no API key needed** (the calendar is public); deduped by `external_id`. |
| Geocoding | **OpenStreetMap Nominatim** | Free, no key; geocode-on-write only (submit/import/backfill); address cleaning + fallbacks; results cached. |

---

## 4. Data model (summary)

Full detail in `Hearth - Database Schema.md`. Core v1 tables:

- **`practitioners`** — the directory. `status` (`pending`/`live`/`hidden`/`rejected`), `auto_check`, `flag_count`, `is_member`, `accepting_clients`, `featured`, `source`, `search_vector`, `slug` (for `/p/slug`), and `manage_token` (a per-listing secret capability for the owner's edit link — **column-revoked from public roles**). DB `CHECK`: at least one of WhatsApp/email/website/Instagram.
- **`categories`** — taxonomy table (seeded with 11), admin-extendable; `sort_order`, `active`.
- **`practitioner_categories`** — many-to-many join (a practitioner holds one or more; the 3-cap was removed in Build 39).
- **`practitioner_services`** — the "what I offer" menu (`title`, optional `description`/`price_note`, `sort_order`), managed from the owner's `/manage` page. Public-read for live practitioners; service-role writes. *(Build 25, migration `0007`.)*
- **`events`** — native events. `host_practitioner_id` (links to directory), `start_at`/`end_at`, `mode`, `cost_note`, `recurrence_rule` (RRULE), `status`, `source`, `external_id` (GCal dedupe), `search_vector`.
- **`reports`** — polymorphic flagging (one of `practitioner_id`/`event_id`); `reporter_contact` for dedupe (a field, not a login); `reason`, `status`.
- **`testimonials`** — member-written recommendations (Build 60, migration `0009`): `practitioner_id`, `author_user_id`, `author_name`, `body`, `status` (`pending`/`approved`/`hidden`), unique per (practitioner, author). Public read = **approved on live practitioners** only (RLS); all writes via service-role actions (`src/lib/actions/testimonials.ts`) — submit (signed-in, content-checked, not your own practice), owner approve/hide, author delete.
- **`feedback`** — private user-testing feedback (Build 18, migration `0004`). `message`, `type` (bug/idea/confusing/praise/other), optional `context`/`submitter_name`/`submitter_contact`, and triage fields `status` (new/reviewing/planned/done/declined), `priority`, `admin_note`. Admin-only (RLS); public writes via a service-role action; never shown publicly.

**`users` is live as of accounts Phase A (Build 46, migration `0008`):** `users.id` now references `auth.users(id)`; a profile row is auto-created on first sign-in (DB trigger, Google name/avatar captured); members can read/update their own row (RLS `auth.uid() = id`); a signed-in practice submission sets `practitioners.owner_user_id`. **Still dormant (v3):** `registrations` (RSVP/tickets).

**Provenance everywhere:** every practitioner/event carries `source` (`hearth_form`/`import`/`google_calendar`/`whatsapp`/`manual`), letting Hearth coexist with and gradually replace the old Google pipeline.

---

## 5. Planned application structure

Actual structure (public pages live at the root of `/app`; there is no `(public)`
route group). Event pages exist but are **hidden** behind `EVENTS_ENABLED`.

```
src/app
  layout.tsx                    # root layout (SiteHeader/Footer, fonts, metadata)
  page.tsx                      # Home (orientation only: two doors in)
  icon.svg                      # Hearth-flame favicon
  practitioners/page.tsx        # directory: search + filters + cards
  p/[slug]/page.tsx             # practitioner profile + their events
  events/page.tsx               # upcoming feed  (hidden: EVENTS_ENABLED → 404)
  add-practitioner/page.tsx     # native add form (required, geocoded area)
  add-event/page.tsx            # native add form (hidden: EVENTS_ENABLED → 404)
  report/page.tsx               # report a concern (no login)
  privacy/page.tsx              # public privacy policy (mirrors Security.md §7)
  signin/page.tsx               # member sign-in — Google OAuth (accounts Phase A)
  auth/callback/route.ts        # OAuth (Google) code → session exchange
  auth/confirm/route.ts         # email links (confirm/reset): token_hash → verifyOtp
  my-practice/page.tsx          # owner home: edit/claim/delete + approve kind words
  my-listing/page.tsx           # → redirect to /my-practice (renamed Build 57)
  recommend/page.tsx            # write a recommendation (sign-in gateway, Phase C)
  my-recommendations/page.tsx   # what a member has written, with status
  feedback/page.tsx             # unlisted testing feedback (FEEDBACK_ENABLED → 404)
  manage/[token]/page.tsx       # owner edit page — private capability link (noindex)
  api/geocode/route.ts          # Nominatim autocomplete proxy
  api/cron/import/route.ts      # daily Vercel-Cron GCal import (events-gated)
  admin/login/page.tsx          # Supabase-Auth login
  admin/(protected)/            # gated: layout redirects non-admins to login
    page.tsx  moderation/  reports/  feedback/  listings/  events/  categories/
src/lib
  supabase/                     # anon (server) + service-role (admin) clients
  actions/                      # server actions: submit-*, admin, types
  data/                         # read queries: practitioners, events, categories, admin
  moderation/                   # content-check
  import/                       # ics-core (shared), calendar, geocode-pending
  types/                        # hand-authored DB types
  auth · notify · features · geocode · geo · format · url · slug · datetime
src/components                  # cards, chips, forms/, admin/, logo, share-button, layout
src/middleware.ts               # refreshes the Supabase session on /admin
supabase/migrations             # 0001 schema+RLS+seed · 0002 geocoding · 0003 instagram · 0004 feedback
scripts                         # import-calendar.mjs · geocode-events.mjs
public                          # static assets served at "/" (palette-explorations.html — temporary reviewer page)
vercel.json                     # Vercel Cron schedule → daily /api/cron/import
```

**Built so far (through Build 18):**
- *Browse (Build 3):* `src/app` Home / `/practitioners` / `/events`; `src/components` header, footer, practitioner & event cards, filter chips; `src/lib` supabase server (anon) client, data access, types, formatting/url helpers; `supabase/migrations/0001_initial_schema.sql`.
- *Submit (Build 4):* `/add-practitioner` & `/add-event` pages + client forms (`src/components/forms/*`); server actions (`src/lib/actions/submit-practitioner.ts`, `submit-event.ts`); the **service-role write client** (`src/lib/supabase/admin.ts`, `server-only`); the **content-check** (`src/lib/moderation/content-check.ts`); slug uniqueness (`src/lib/slug.ts`); Toronto-time conversion (`src/lib/datetime.ts`).

- *Import (Build 5):* `scripts/import-calendar.mjs` (`npm run import:calendar`) — public-ICS seed of the community calendar via `node-ical`.
- *Near me (Build 7):* `latitude`/`longitude`/`geocoded_at` on events + practitioners; `src/lib/geocode.ts` (Nominatim, server-only) + `/api/geocode` autocomplete proxy; `src/lib/geo.ts` (haversine + `withDistance` sort/filter); `LocationControl` + `AddressAutocomplete`; geocode-on-submit; `scripts/geocode-events.mjs` (`npm run geocode`) backfill.
- *Auto-import + calendar (Build 9–10):* shared import core `src/lib/import/ics-core.mjs` (+ `.d.mts`) used by **both** the standalone script and a server module `src/lib/import/calendar.ts`; **`/api/cron/import`** route (CRON_SECRET-guarded) run **daily by Vercel Cron** (`vercel.json`) to sync Google-Form events during the transition; `node-ical` is in `serverExternalPackages` (doesn't bundle). After importing, the cron runs `geocodePending` (`src/lib/import/geocode-pending.ts`) to geocode new addressed events + practitioners (capped/throttled), so they join "near me" automatically. "Add to calendar" link on events (`googleCalendarUrl`).

- *Profiles (Build 11):* `/p/[slug]` practitioner profile (full info, contacts, hosted events, share metadata); directory cards link to it; the add-event form has an optional **host-practitioner** selector (`host_practitioner_id`) so events cross-link to a profile.

- *Report flow (Build 12):* `/report?type=&id=` page + `ReportForm` + `submitReport` (service-role) — dedupes by `reporter_contact`, denormalizes the distinct-reporter `flag_count` onto practitioners, logs a steward alert past the threshold of 3. "Report" links on profiles + event cards.
- *Admin (Build 13):* Supabase Auth login (`/admin/login`); `src/middleware.ts` refreshes the session on `/admin`; `src/lib/auth.ts` gates by `ADMIN_EMAILS`; admin reads (`src/lib/data/admin.ts`) + mutations (`src/lib/actions/admin.ts`, each `requireAdmin`) use the **service role**. Pages under `app/admin/(protected)`: dashboard, moderation (approve/reject pending), reports inbox (distinct counts, status badge; **Hide listing** hides the target *and* resolves the report — marks it `actioned` — so the card leaves the inbox as feedback, or **Dismiss** clears the flags without hiding — Build 44), practitioners + events management (hide/feature/delete, run-import; **edit a listing or copy its private manage link** — Build 41), categories CRUD.
- *Steward alerts + practitioner-only pilot (Build 14):* `src/lib/notify.ts` (`notifyAdmins`) emails `ADMIN_EMAILS` when a practitioner submission is held or crosses the 3-reporter threshold — via **Resend** or **Gmail SMTP** (`nodemailer`), whichever env is set; `siteUrl()` (`src/lib/url.ts`) builds absolute links for those emails. A **"Report" link** now sits on every practitioner card (`PractitionerCard`), matching events. `src/lib/features.ts` (`EVENTS_ENABLED = false`) hides the whole public Events layer (nav, home peek/CTA, profile "events they host", `/events` + `/add-event` → 404, and the import cron) behind one reversible flag.
- *Polish + shareability (Build 15):* Hearth-flame favicon (`src/app/icon.svg`); `ShareButton` (native share sheet / copy-link) on profiles **and** the "you're live" success screen (which now surfaces the practitioner's own `/p/…` link); an optional photo/logo field on the add form; a richer `/p/[slug]` layout (header card, **Offerings** chips from `keywords`, "Get in touch" card); and honest copy — dropped the "our community *trusts/vouches for*" claim from the hero + tab title.
- *Required, easy location (Build 16):* `area` is now **required** on the practitioner form and entered via the shared type-ahead `AddressAutocomplete` (picking a suggestion pins area-level coords — reliable "near me"); extracted a shared `resolveCoordsFromForm` used by **both** submit actions.
- *Instagram as a contact (Build 17):* Instagram now satisfies the at-least-one-contact rule — app validation **and** the DB constraint (migration `0003_instagram_contact.sql`).
- *Feedback board (Build 18):* private user-testing feedback — unlisted `/feedback` form (gated by `FEEDBACK_ENABLED`) → `submitFeedback` (service-role) → `feedback` table (migration `0004`, RLS admin-only) → a **status-column board** at `/admin/feedback` (move status, set priority, add notes) + a "new feedback" count on the dashboard.

- *Alert recipients decoupled (Build 21):* steward alert emails now target **`NOTIFY_EMAILS`** (fallback `ADMIN_EMAILS`) via `notifyEmails()` — so several people can have admin-panel access while only a chosen list is emailed (and the Resend onboarding-sender recipient stays a single inbox as admins are added). Shared `parseEmails()` in `src/lib/auth.ts`.
- *Editable listings — profiles-as-mini-sites, Phase 1a (Build 23):* a per-listing **manage link** (`/manage/<manage_token>`, migration `0005`) lets a practitioner **edit their own listing with no account** — the token is an unguessable capability (column-revoked from public roles), surfaced on the submission success screen. `getListingByManageToken` (service-role) loads it; `updateListing` (`src/lib/actions/manage-listing.ts`) saves, re-running the content-check. Added an **"accepting new clients"** toggle (shown on the profile). Foundation for the mini-site work and reused later for testimonial-request links.
- *Photo uploads — Phase 1b (Build 24):* real avatar **uploads** replace URL-paste on both the add + manage forms. `AvatarUploader` (client) compresses on-device (canvas, ~512px JPEG, EXIF-aware) → `uploadAvatar` (service-role action) validates + stores in the public **`avatars`** Storage bucket (migration `0006`) → URL saved to `photo_url`. Compression keeps files ~100–200 KB (storage/egress ≈ $0 at community scale).
- *Services menu — Phase 1c (Build 25):* a `practitioner_services` table (migration `0007`) + a dynamic **`ServicesEditor`** on the manage page (parallel-named rows zipped by `getAll`, replaced on save). Rendered as a **"What I offer"** section on `/p/[slug]`; the free-text keyword chips were relabelled **"Specialties"** to distinguish them. **Phase 1 (mini-site core) complete;** Phase 2 = solicited testimonials.

- *Accounts Phase A (Build 46):* member sign-in with **Google** — `/signin` (+ `GoogleSignInButton`), `/auth/callback` (code → session), the header **`AccountControl`** (client-side session so static pages stay static), site-wide session refresh in `src/middleware.ts`, migration `0008` (drops the `*_admin_all` policies — `authenticated` no longer means admin — ties `users` to `auth.users`, self-access RLS, sign-up trigger), and `submitPractitioner` binding `owner_user_id` when the submitter is signed in. Phase B (claim + "My listing") comes next.
- *Accounts Phase B (Build 47):* **`/my-listing`** (session-gated owner home) reusing the manage-page editor via the listing's own token; **claim flows** (session-email match on `/my-listing`, or "Link to my account" on `/manage/<token>` while signed in — both re-verified server-side, unowned listings only; `src/lib/actions/account.ts`); **owner delete** (`DeleteListing`, token-authorized, on both edit surfaces); **"Add your practice" now asks for sign-in first** (just-in-time gate; the listing binds to the account); "My listing" in the header account menu. Manage links keep working as the bridge for pre-account listings.

- *Search overhaul (Build 74, migration `0010`):* the practitioner `search_vector` became a **trigger-maintained weighted vector** covering name/practice (A), categories + keywords (B), description + services (C), bio/area/languages (D) — refreshed on practitioner writes, category links, service edits, and category renames; `getPractitioners` issues sanitized prefix tsqueries. Directory cards became fully tappable (stretched-link).
- *Brand + polish (Builds 73–84):* the final identity — **Clementine & Juniper** palette (two stage pairs), the **heart-flame** mark (34px header; `public/logo.svg` + `public/email-logo.png`), **Zilla Slab + Source Sans 3** type, branded emails with the logo, AODA/AA accessibility (skip-link, focus-visible, chip focus rings, reduced motion) — plus `/privacy` (Build 76) and the `token_hash` email-link fix (`/auth/confirm`, Build 77).

**Not yet built:** event detail pages (`/events/[id]`). *(The whole Events layer is currently hidden for the practitioner-only pilot — see `EVENTS_ENABLED`.)*

---

## 6. Data flow

- **Public read** — Server Components query Supabase for `status = live` rows (RLS enforces this even if a query forgets). Search/filter compiled to Postgres full-text + category/mode/date predicates. Recurring events (stored one row per occurrence) are collapsed to one next-occurrence row per series for display (`collapseSeries`).
- **Add a practice** — requires sign-in (the just-in-time gate on `/add-practitioner`); the Server Action validates → runs the **content check** → inserts with `status = live` (clean) or `status = pending` (suspicious), binding `owner_user_id` — one practice per account — → on a hold, **emails the stewards**. Reporting stays accountless.
- **Report** — Server Action inserts a `reports` row keyed by `reporter_contact`; the dedup routine recounts **distinct** reporters; crossing **3** **emails the stewards** once (same `notify.ts` path). Flags never auto-hide.
- **Feedback (testing)** — the unlisted `/feedback` page (gated by `FEEDBACK_ENABLED`) posts to a service-role action (`submitFeedback`) that inserts a `feedback` row (`status = 'new'`); stewards triage it on the `/admin/feedback` status board. Not public, no content-check (never published).
- **Owner edit** — the primary path is **`/my-listing`** (session-gated; new listings bind to the account at submit, so no secret link is surfaced anymore — Build 55). The manage link `/manage/<manage_token>` remains as the bridge for pre-account listings (and the admin panel can copy it); the token resolves via the **service-role** client (`getListingByManageToken`), and `updateListing` saves the changes. On edit the content-check re-runs — a live listing that trips it is quietly held for review + stewards notified, so neither path can sneak spam live.
- **Photo upload** — the `AvatarUploader` compresses the image **on-device** (canvas → JPEG, ~512px, EXIF-aware) and calls the `uploadAvatar` **service-role** action, which validates type + size and stores it in the public **`avatars`** Storage bucket; the returned URL lands in `photo_url`. The anon role has no storage write policy, so uploads can't bypass the action.
- **Admin notifications** — `src/lib/notify.ts` (`notifyAdmins`, `server-only`) is the single email path, targeting **`NOTIFY_EMAILS`** (fallback `ADMIN_EMAILS`) — recipients decoupled from admin-panel access. It sends via **Resend** (`RESEND_API_KEY`) or **Gmail SMTP** (`GMAIL_USER`/`GMAIL_APP_PASSWORD`) — preferring Resend when both are set — otherwise logs to the server console, and never throws (a failed alert can't break a public write).
- **Admin** — authenticated Server Actions do full CRUD, toggle `featured`, manage `categories`, and trigger the **Google Calendar seed import**.
- **Seed import** — a script calls `events.list` on the public community calendar (from 2026-01-01), maps each event into `events` with `source = google_calendar` and `external_id`, skipping any already-imported id.

### Existing pipeline being replaced (the seed source)

Today's flow, which Hearth supersedes:

```
Host ─▶ Google Form ─▶ (manual copy) ─▶ Google Calendar ─▶ (clunky on phone)
       "Add an Event to the              "Conscious Events TO Calendar"
        Conscious Events TO Calendar"
```

| Thing | Value |
|---|---|
| Form | `Add an Event to the Conscious Events TO Calendar` — https://forms.gle/fzgQ7s43udWcFaSr6 |
| Form fields | Event name *(req)* · registration link *(req)* · start date *(req)* + time *(opt)* · end date *(req)* + time *(opt)* |
| Calendar (seed source) | **Conscious Events TO Calendar** |
| Calendar src / ID | `consciouseventsto@gmail.com` |
| Public iCal feed | `https://calendar.google.com/calendar/ical/consciouseventsto%40gmail.com/public/basic.ics` |
| Timezone | `America/Toronto` |
| Recurring events | Currently manual — host emails an admin to repeat. Hearth replaces this with `recurrence_rule` (RRULE). |

The Hearth `events` table is a strict superset of these fields (see `Product.md §7`), so the import maps cleanly and adds enrichment (description, category, mode/location, cost, image, host link).

**Import implementation (`scripts/import-calendar.mjs`, `npm run import:calendar`):** fetches the public ICS feed (no API key), parses with `node-ical`, and inserts via the service-role client. The registration link lives in the event DESCRIPTION (Eventbrite/Luma URLs) and is extracted into `registration_link`. Non-recurring events import from `EVENT_IMPORT_FROM` (2026-01-01) forward; recurring series are expanded into upcoming occurrences (today → +120 days), each row keyed `external_id = UID:<occurrenceISO>`. Safe to re-run — existing `external_id`s are skipped. First run: **553 events imported (229 upcoming).**

---

## 7. Moderation/automation (replaces the old Apps Script)

The original plan ran moderation in Google Apps Script. In the database-backed design this lives **in the app** (`/lib/moderation`): content checks on submit, distinct-reporter de-duplication, and threshold notifications — no external script, one codebase.

---

## 8. Key architectural properties

- **No-login to consume, accounts to contribute** — the original nullable-FK design let the account layer bolt on mid-pilot with zero rework (exactly as planned).
- **Search-native** — `search_vector` columns make search a first-class DB capability.
- **Linked layers** — `events.host_practitioner_id` enforces directory↔events cross-discovery in the data model.
- **Provenance & dedupe** — `source` + `external_id` enable clean coexistence with / migration off the Google pipeline.
- **Security at the data layer** — RLS is the backstop (see `Security.md`), not just app-level checks.

---

## 9. Versioning

The app's **Version** and **Build** number live in the README (and, once code exists, in the app's config/about surface). Build number increments each `/wouldyou` work session; version changes only on explicit instruction. Current: **v0.1.0 — Build 85** (practitioner-only pilot on www.myhearthapp.ca, launch-ready: full account layer, testimonials, comprehensive search, the final Clementine & Juniper / heart-flame / Zilla Slab identity, branded emails, privacy page; events still behind one flag).
