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
   Seeker  ─browse/────▶ │   • public site (NO login)      │    (phone-first
            report      │   • admin panel (Supabase Auth) │     web)
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
                       one-time / occasional seed import
                       Google Calendar API (events.list)
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
| Auth | **Supabase Auth** | **Admins only.** Public never logs in. |
| File storage | **Supabase Storage** | Practitioner photos, event flyers; external-URL fallback supported by the schema. |
| Search | **Postgres full-text** (`tsvector` / `search_vector`) | Search is a DB feature, not a client hack. |
| Hosting | **Vercel** (Cloudflare Pages alt) | Free tier. |
| Event seed | **Public iCal feed** (`/public/basic.ics`) parsed with `node-ical` | One-time/occasional import; **no API key needed** (the calendar is public); deduped by `external_id`. |
| Geocoding | **OpenStreetMap Nominatim** | Free, no key; geocode-on-write only (submit/import/backfill); address cleaning + fallbacks; results cached. |

---

## 4. Data model (summary)

Full detail in `Hearth - Database Schema.md`. Core v1 tables:

- **`practitioners`** — the directory. `status` (`pending`/`live`/`hidden`/`rejected`), `auto_check`, `flag_count`, `is_member`, `featured`, `source`, `search_vector`, `slug` (for `/p/slug`). DB `CHECK`: at least one of WhatsApp/email/website.
- **`categories`** — taxonomy table (seeded with 11), admin-extendable; `sort_order`, `active`.
- **`practitioner_categories`** — many-to-many join (a practitioner holds up to ~3).
- **`events`** — native events. `host_practitioner_id` (links to directory), `start_at`/`end_at`, `mode`, `cost_note`, `recurrence_rule` (RRULE), `status`, `source`, `external_id` (GCal dedupe), `search_vector`.
- **`reports`** — polymorphic flagging (one of `practitioner_id`/`event_id`); `reporter_contact` for dedupe (a field, not a login); `reason`, `status`.

**Modelled but dormant (v2/v3):** `users` (accounts), `registrations` (RSVP/tickets). Their FKs are nullable everywhere so the account layer switches on later without rework.

**Provenance everywhere:** every practitioner/event carries `source` (`hearth_form`/`import`/`google_calendar`/`whatsapp`/`manual`), letting Hearth coexist with and gradually replace the old Google pipeline.

---

## 5. Planned application structure

```
/app
  /(public)                     # no-login surface
    page.tsx                    # Home (peek at both worlds)
    practitioners/page.tsx      # directory: search + filters + cards
    practitioners/[slug]/page.tsx  # practitioner profile + their events
    events/page.tsx             # upcoming feed (This week/Next week/Later) + month view
    events/[id]/page.tsx        # event detail
    add-practitioner/page.tsx   # native add form
    add-event/page.tsx          # native add form
    report/page.tsx             # report a listing/event (no login)
  /admin                        # Supabase-Auth protected
    page.tsx                    # dashboard
    moderation/                 # pending queue (auto-check holds)
    reports/                    # reports inbox + distinct-reporter counts
    categories/                 # add/rename/reorder/deactivate
    listings/                   # manage practitioners
    events/                     # manage events + GCal import trigger
/lib
  supabase/                     # browser + server clients, typed
  moderation/                   # content-check + reporter-dedup logic
  search/                       # query builders for tsvector search
/components                     # cards, chips, forms, layout
/supabase                       # SQL migrations + seed (categories, RLS policies)
/scripts                        # one-off: google-calendar-seed-import
```

**Built so far (Build 4):**
- *Browse (Build 3):* `src/app` Home / `/practitioners` / `/events`; `src/components` header, footer, practitioner & event cards, filter chips; `src/lib` supabase server (anon) client, data access, types, formatting/url helpers; `supabase/migrations/0001_initial_schema.sql`.
- *Submit (Build 4):* `/add-practitioner` & `/add-event` pages + client forms (`src/components/forms/*`); server actions (`src/lib/actions/submit-practitioner.ts`, `submit-event.ts`); the **service-role write client** (`src/lib/supabase/admin.ts`, `server-only`); the **content-check** (`src/lib/moderation/content-check.ts`); slug uniqueness (`src/lib/slug.ts`); Toronto-time conversion (`src/lib/datetime.ts`).

- *Import (Build 5):* `scripts/import-calendar.mjs` (`npm run import:calendar`) — public-ICS seed of the community calendar via `node-ical`.
- *Near me (Build 7):* `latitude`/`longitude`/`geocoded_at` on events + practitioners; `src/lib/geocode.ts` (Nominatim, server-only) + `/api/geocode` autocomplete proxy; `src/lib/geo.ts` (haversine + `withDistance` sort/filter); `LocationControl` + `AddressAutocomplete`; geocode-on-submit; `scripts/geocode-events.mjs` (`npm run geocode`) backfill.
- *Auto-import + calendar (Build 9–10):* shared import core `src/lib/import/ics-core.mjs` (+ `.d.mts`) used by **both** the standalone script and a server module `src/lib/import/calendar.ts`; **`/api/cron/import`** route (CRON_SECRET-guarded) run **daily by Vercel Cron** (`vercel.json`) to sync Google-Form events during the transition; `node-ical` is in `serverExternalPackages` (doesn't bundle). After importing, the cron runs `geocodePending` (`src/lib/import/geocode-pending.ts`) to geocode new addressed events + practitioners (capped/throttled), so they join "near me" automatically. "Add to calendar" link on events (`googleCalendarUrl`).

- *Profiles (Build 11):* `/p/[slug]` practitioner profile (full info, contacts, hosted events, share metadata); directory cards link to it; the add-event form has an optional **host-practitioner** selector (`host_practitioner_id`) so events cross-link to a profile.

- *Report flow (Build 12):* `/report?type=&id=` page + `ReportForm` + `submitReport` (service-role) — dedupes by `reporter_contact`, denormalizes the distinct-reporter `flag_count` onto practitioners, logs a steward alert past the threshold of 3. "Report" links on profiles + event cards.
- *Admin (Build 13):* Supabase Auth login (`/admin/login`); `src/middleware.ts` refreshes the session on `/admin`; `src/lib/auth.ts` gates by `ADMIN_EMAILS`; admin reads (`src/lib/data/admin.ts`) + mutations (`src/lib/actions/admin.ts`, each `requireAdmin`) use the **service role**. Pages under `app/admin/(protected)`: dashboard, moderation (approve/reject pending), reports inbox (distinct counts, hide/dismiss), practitioners + events management (hide/feature/delete, run-import), categories CRUD.

**Not yet built:** event detail pages (`/events/[id]`).

---

## 6. Data flow

- **Public read** — Server Components query Supabase for `status = live` rows (RLS enforces this even if a query forgets). Search/filter compiled to Postgres full-text + category/mode/date predicates. Recurring events (stored one row per occurrence) are collapsed to one next-occurrence row per series for display (`collapseSeries`).
- **Public submit** — Server Action validates → runs the **content check** → inserts with `status = live` (clean) or `status = pending` (suspicious) → notifies admin on a hold. No account required.
- **Report** — Server Action inserts a `reports` row keyed by `reporter_contact`; the dedup routine recounts **distinct** reporters; crossing **3** notifies a steward. Flags never auto-hide.
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

- **No-login-first, accounts-later** — nullable user FKs mean v2 accounts bolt on cleanly.
- **Search-native** — `search_vector` columns make search a first-class DB capability.
- **Linked layers** — `events.host_practitioner_id` enforces directory↔events cross-discovery in the data model.
- **Provenance & dedupe** — `source` + `external_id` enable clean coexistence with / migration off the Google pipeline.
- **Security at the data layer** — RLS is the backstop (see `Security.md`), not just app-level checks.

---

## 9. Versioning

The app's **Version** and **Build** number live in the README (and, once code exists, in the app's config/about surface). Build number increments each `/wouldyou` work session; version changes only on explicit instruction. Current: **v0.1.0 — Build 3** (foundation: Next.js app, schema, and the public browse experience).
