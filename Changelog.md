# Changelog

*All notable changes to Hearth, newest at top. Grouped by build under the current version. Build number increments each work session; version changes only on explicit instruction.*

---

## v0.1.0 — Build 8 (2026-06-26)

*Deployed to production; near-me recurring-duplicate bug fixed; copy + logo polish; documentation refreshed (`/updatestructure`). Builds clean; lint passes.*

### Deployed
- Live on **Vercel at https://hearthto.vercel.app** (auto-deploys from `main`), connected to the live Supabase project. Verified end-to-end in production (browse, submit, near-me over HTTPS). URL recorded in `Readme.md`.

### Fixed
- **"Near me" repeated one event.** Imported recurring events are stored one row per occurrence; the two addressed weekly yoga series (14 + 15 rows) dominated the distance-sorted list. `getEvents` now **collapses each series to its next upcoming occurrence** (`collapseSeries`, keyed by the `external_id` UID prefix); the `limit` is applied after collapse + distance sort. Also declutters the time agenda.

### Changed
- **Homepage copy:** hero now "Find the **events and practitioners** our community trusts" (events first); subline trimmed to "A lasting, searchable home for the healers, facilitators, and conscious events we love."
- **Logo pop:** richer gold gradient, brighter inner ember, and a soft glow on the flame mark.

### Docs (`/updatestructure` refresh)
- Verified all root + `documentation/` files against the code. Brought `Bugs.md` current (removed the stale "no code yet" note; reorganized Open/Resolved; logged the near-me fix). Updated `Architecture.md` (series collapse), `Claude.md` (collapse gotcha), `Design.md` (logo), `Readme.md` (Build 8 + live status).

---

## v0.1.0 — Build 7 (2026-06-26)

*"📍 Near me" for both events and practitioners — distance, nearest-sort, radius, directions. Builds clean; lint passes.*

### Added — location feature
- **Schema (migration 0002):** `latitude`/`longitude`/`geocoded_at` on `events` and `practitioners`.
- **Geocoding (free, no key):** `src/lib/geocode.ts` (OpenStreetMap Nominatim, `server-only`, with venue/postal cleaning + fallback variants + cache) and `/api/geocode` autocomplete proxy. Geocoding happens **only on write**.
- **Distance:** `src/lib/geo.ts` — haversine `distanceKm`, `formatDistance`, and `withDistance` (attach distance, sort nearest-first, filter by radius).
- **Geocode on submit:** events geocode `location_text` (or use the autocomplete's picked coords); practitioners geocode `area`.
- **Address autocomplete** (`AddressAutocomplete`) on the Add-an-event form — pick a suggestion to capture precise coordinates.
- **"Near me" UI** (`LocationControl`, shared by both pages): GPS button + "type a neighbourhood" box, distance chips on each result, nearest-first ordering, radius chips (5/10/25/50 km), and **"Directions"** links (open the maps app) on events.
- **Backfill:** `scripts/geocode-events.mjs` (`npm run geocode`) — geocoded the **29 addressed events**; practitioners geocode as they're added.

### Notes
- Geolocation needs HTTPS, so "Near me" (GPS) works on localhost + Vercel but not the plain-http LAN URL on a phone — the "type a place" box works everywhere. Practitioner coordinates are area-level (never a home address) and "near me" location is never stored server-side.
- Docs updated: Architecture, Security (privacy), Schema, Design, Claude, Readme → Build 7.

---

## v0.1.0 — Build 6 (2026-06-26)

*Design pass: a "rich & sacred" identity + a mobile-first rethink from user feedback. Builds clean; lint passes.*

### Changed — visual identity
- New **"rich & sacred"** palette in `globals.css` (Tailwind v4 `@theme`): warm parchment base, deep emerald + plum jewel tones, antique gold accents, deep "night" hero/header/footer. Added a `.gold-rule` divider.
- **Crafted SVG flame mark + wordmark** (`src/components/logo.tsx`) replacing the emoji; deep-night header & footer with gold accents; dramatic gradient hero on Home.

### Changed — mobile-first UX (from feedback)
- **Events → date-led agenda** (Luma-inspired): single-column rows with a date badge + one clean meta line, under slim gold bucket labels — replacing the two-column tiles that were hard to read.
- **Practitioners → compact rows:** avatar (photo or gold-ringed initial), name + small `✦ member` mark, one-line description, a single meta line, condensed contact actions — replacing pill-heavy cards.
- **Filters → one slim horizontal-scroll strip** (`FilterChips` reworked) instead of a wrapping wall of pills.
- **Lists not grids:** rows sit in a single rounded `bg-card` container with `divide-y`. Trimmed the hero and section copy.

### Fixed
- **Raw `href` / HTML showing in event descriptions.** `scripts/import-calendar.mjs` now strips HTML + decodes entities and extracts the registration link from `<a href>`; added a `--reset` flag and re-imported (553 events) to clean existing rows.

### Docs
- `Design.md` rewritten for the new palette, mobile patterns, and "what to avoid"; `Readme.md` → Build 6.

---

## v0.1.0 — Build 5 (2026-06-26)

*The Events page is now alive with the real community calendar. Builds clean; lint passes.*

### Added — Google Calendar import
- **`scripts/import-calendar.mjs`** + **`npm run import:calendar`** — reads the community calendar's **public iCal feed** (`…/public/basic.ics`) with **no API key needed**, parses via **`node-ical`**, and inserts events through the service-role client.
  - Maps the form's registration link out of the event DESCRIPTION (Eventbrite/Luma) into `registration_link`; infers `mode`; carries `recurrence_rule`.
  - **Non-recurring** events import from `EVENT_IMPORT_FROM` (2026-01-01) forward; **recurring** series are expanded into upcoming occurrences (today → +120 days), each keyed `external_id = UID:<occurrenceISO>`.
  - **Idempotent** — skips already-imported `external_id`s, safe to re-run during the transition.
- **First run result:** 553 events imported, **229 upcoming** — now rendering on `/events` (This week / Next week / Later) and the Home "Coming up" peek.

### Changed
- Simplified the calendar approach to the **public ICS feed** (dropped the Google Calendar API-key requirement): updated `.env.example` / `.env.local`, `Architecture.md` (stack + §6 import detail), `Security.md` (no key to leak — ticked), `Bugs.md` (API-key + dedupe items resolved; added a recurring-horizon note), `Product.md` (open Q3 resolved), `Claude.md` (import command), `Readme.md` (Build 5 + import step).
- Added `node-ical` dependency.

---

## v0.1.0 — Build 4 (2026-06-26)

*Native submission — the community can now add practitioners and events directly into Hearth. Builds clean (zero warnings); lint passes.*

### Added — submission flow
- **Service-role write client** `src/lib/supabase/admin.ts` (guarded by `server-only`, bypasses RLS) — used only by trusted server actions. Installed the `server-only` package.
- **Content check** `src/lib/moderation/content-check.ts` — flagged-term + link-density scan returning `ok` / `needs_review`.
- **Helpers** — `src/lib/slug.ts` (slugify + unique practitioner slug) and `src/lib/datetime.ts` (convert a `datetime-local` wall time in America/Toronto to a UTC ISO).
- **Server actions** `src/lib/actions/submit-practitioner.ts` & `submit-event.ts` — validate required fields + the at-least-one-contact rule, run the content check, **set `status`/`auto_check` server-side** (clean → `live`, suspicious → `pending`), insert via the service role (+ `practitioner_categories`), and `revalidatePath`. Shared `FormState` in `src/lib/actions/types.ts`.
- **Forms** `src/components/forms/practitioner-form.tsx` & `event-form.tsx` (client, `useActionState`): all Product.md fields — practitioner (name, up-to-3 categories, description, bio, area, mode, the four contacts, pricing, languages, keywords, member flag, agreement) and event (title, type, start/end, mode, location, registration link, cost, host, **repeats → RRULE**, description, agreement). Inline error + success/thank-you states (instant-publish vs held-for-review messaging).
- **Pages** `/add-practitioner` & `/add-event` (load categories, render the forms).

### Changed
- **Practitioners** page now has a **➕ Add your practice** button; **Events** page's **➕ Add an event** now points to the native `/add-event` form (the Google form remains available externally during the transition).
- Docs: `Architecture.md` (built-so-far → Build 4), `Security.md` (write-path + content-check ticked; rate-limit/bot-check still open), `Bugs.md` (server-controlled status resolved; spam/bot flood now the live open item), `Claude.md` (two-clients rule, submissions, datetime), `Readme.md` (Build 4 + status).

---

## v0.1.0 — Build 3 (2026-06-25)

*First application code — the project foundation and the public browse experience. Builds clean (zero warnings); lint passes.*

### Added — Next.js app
- Scaffolded **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4**, merged into the repo root (kept our existing docs; dropped the scaffold's colliding `README/CLAUDE/AGENTS`).
- **Database:** `supabase/migrations/0001_initial_schema.sql` — all v1 tables (`practitioners`, `categories`, `practitioner_categories`, `events`, `reports`; `users`/`registrations` modelled dormant), enums, `updated_at` triggers, `search_vector` full-text columns, the at-least-one-contact `CHECK`, the `(source, external_id)` dedupe index for imports, **RLS policies** (anon read-only & live-only; admin full access), and the **11 seeded categories**.
  - **Shared taxonomy decision implemented:** added `events.category_id → categories` so events reuse the practitioner taxonomy.
- **Supabase wiring:** `src/lib/supabase/server.ts` (RLS-respecting anon client; returns null + empty states when env is unset so builds/dev never crash), typed schema in `src/lib/types/database.ts`, and data-access in `src/lib/data/{practitioners,events,categories}.ts` (full-text search + category/mode filters).
- **Brand & layout:** soft-green/cream Tailwind theme + Fraunces/Nunito fonts (`globals.css`), root layout, sticky `SiteHeader` nav, `SiteFooter`.
- **Components:** `PractitionerCard` (member badge, category tags, WhatsApp/email/website/Instagram contact buttons), `EventCard` (Toronto-time formatting, recurring flag, register link), `FilterChips` (no-JS, URL-driven filtering).
- **Pages:** Home (warm hero + peeks at both worlds), `/practitioners` (search + category + mode filters), `/events` ("This week / Next week / Later" grouping + filters; **"Add an event" links to the existing Google form** during the transition).
- **Config:** `.env.example` (Supabase + Google Calendar vars), pinned Turbopack `root` in `next.config.ts` to silence the stray-lockfile warning.

### Changed — docs
- `documentation/Security.md` — documented the hardened write model (anon read-only; public writes via service-role server actions) and ticked the RLS watchlist item.
- `documentation/Architecture.md` — "built so far" note + version bump; `documentation/Design.md` — concrete palette tokens + fonts; `documentation/Hearth - Database Schema.md` — recorded `events.category_id`.
- `Claude.md` — dev commands, server-rendered-filter note, resolved open questions (#1, #2 confirmed/resolved). `Bugs.md` — RLS item resolved.
- `Readme.md` — Build 2 → **Build 3**, status, repo layout (now shows `src/` + `supabase/`), and a "Running locally" section.

### Infra
- `git init`, wired GitHub remote `git@github.com:bhavnasharma01/Hearth.git` (SSH auth verified).

---

## v0.1.0 — Build 2 (2026-06-25)

*Captured the real existing event pipeline as the seed source and mapped it to Hearth's model.*

### Added
- **`documentation/Architecture.md §6`** — new "Existing pipeline being replaced" reference: the live Google Form (`Add an Event to the Conscious Events TO Calendar`, https://forms.gle/fzgQ7s43udWcFaSr6) and the seed-source calendar **Conscious Events TO Calendar** (`consciouseventsto@gmail.com`, `America/Toronto`), with its current fields.
- **`documentation/Product.md §7`** — field-by-field mapping of today's 6-field form → Hearth's superset `events` model, showing the import loses nothing and `recurrence_rule` replaces the manual "email an admin to repeat" workaround.

### Changed
- **`Claude.md`** — recorded the real calendar ID/timezone and form link in the import gotcha; marked open question #3 (which calendar) partially **resolved**.
- **`documentation/Product.md`** open questions — #3 updated with the identified calendar.
- **`Readme.md`** — Build 1 → Build 2.

### Still open (from this)
- Confirm the "Conscious Events TO Calendar" is publicly API-readable (needed for the seed import via an API key).
- Confirm the 2026-01-01-forward import window.

---

## v0.1.0 — Build 1 (2026-06-25)

*Project inception — vision consolidation & documentation scaffolding. No application code yet.*

### Added — project scaffolding
- **Root docs:**
  - `Readme.md` — high-level overview, tech stack, repo layout, version/build (0.1.0 / Build 1).
  - `Changelog.md` — this file; the running log of all changes.
  - `Claude.md` — working notes, conventions, locked decisions, gotchas, and the document map for the AI assistant.
  - `Bugs.md` — known bugs/risks; seeded with the security/abuse watchlist to design against.
- **`documentation/` folder** with the four living source-of-truth docs:
  - `Architecture.md` — system diagram, Next.js + Supabase stack, app structure, data flow, moderation-in-app design.
  - `Security.md` — no-login model, Supabase Auth for admins, RLS backstop, content checks, abuse-resistant flagging, secrets, privacy, security watchlist.
  - `Product.md` — North Star, personas, core experience, practitioner & event form field sets, taxonomy, moderation philosophy, scope staging.
  - `Design.md` — mobile-first intent, soft greens/whites visual system, component inventory, interaction principles, what to avoid.

### Changed — organization
- Moved the original planning material into `documentation/planning-archive/` (preserved for provenance; assimilated into the living docs above): North Star, Product Brief, Detailed Implementation Spec, both Proposals (`.md`/`.docx`/`.pdf`), and Anat & Curtis's message.
- Relocated the data model — `Hearth - Database Schema.md` and `.mermaid` — into `documentation/` as the authoritative schema reference.

### Decisions locked (from the vision call + clarifying Q&A)
- **Database-backed app** (Next.js + Supabase/Postgres), superseding the original "$0 static site reading Google Sheets/Calendar" plan.
- **Native events** in Hearth (DB-stored), seeded by a one-time **Google Calendar import** (2026-01-01 forward); the Hearth form replaces the Google Form flow.
- **Trust signal = community-member badge only** — no public upvotes or written reviews in v1.
- **No public login**; admin-only Supabase Auth; `users`/`registrations` modelled but dormant until v2/v3.
- **v1 scope = Directory + Events together** *(pending explicit confirmation)*; accounts/endorsements/registrations/education-blog staged for v2/v3.

### Notes
- Earlier this session also produced the standalone product brief, now living at `documentation/planning-archive/Hearth - Product Brief.md` and assimilated into `documentation/Product.md`.
- No build/compile step yet — there is no application code. The first code build begins after the v1 plan is approved.
