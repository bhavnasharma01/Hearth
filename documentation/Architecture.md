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
| Event seed | **Google Calendar API v3** (`events.list`, API key) | One-time/occasional import to seed events; deduped by `external_id`. |

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

**Not yet built:** profile/detail pages (`/p/[slug]`, `/events/[id]`), the report flow, the `/admin` area, and the `scripts/` Google Calendar import.

---

## 6. Data flow

- **Public read** — Server Components query Supabase for `status = live` rows (RLS enforces this even if a query forgets). Search/filter compiled to Postgres full-text + category/mode/date predicates.
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
| Timezone | `America/Toronto` |
| Recurring events | Currently manual — host emails an admin to repeat. Hearth replaces this with `recurrence_rule` (RRULE). |

The Hearth `events` table is a strict superset of these fields (see `Product.md §7`), so the import maps cleanly and adds enrichment (description, category, mode/location, cost, image, host link).

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
