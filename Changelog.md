# Changelog

*All notable changes to Hearth, newest at top. Grouped by build under the current version. Build number increments each work session; version changes only on explicit instruction.*

---

## v0.1.0 — Build 17 (2026-07-02)

*Bugfix: Instagram now counts as a contact, so an Instagram-only practitioner can list. Builds clean; lint passes.*

### Fixed
- **Instagram-only listings were blocked.** The "at least one contact" rule counted WhatsApp / Email / Website but **not** Instagram — yet the form groups all four under "at least one is required," so entering only an Instagram failed with *"you need to enter one of the four fields above"* and wouldn't submit. Instagram now counts (which also realigns with the original directory spec's *"…or social link"*). Fixed in **two places that must agree**: the server validation (`submitPractitioner`) and the database constraint.
- **⚠️ One DB migration to run:** `supabase/migrations/0003_instagram_contact.sql` — paste it into the Supabase SQL editor. It updates `practitioners_contact_check` to include `instagram`. Until it's run, an Instagram-only submit passes app validation but the DB rejects the insert (generic "something went wrong"). Safe to re-run.
- Note: no form change was needed — the add-practitioner form already presented all four (WhatsApp/Email/Website/Instagram) as an equivalent "at least one required" group; only the validation + DB were stricter.

### Docs
- `Product.md`, `Architecture.md`, `Hearth - Database Schema.md`, `Claude.md`, `Readme.md`, `Changelog.md` → Build 17.

---

## v0.1.0 — Build 16 (2026-07-02)

*Practitioners must now add a location — with easy type-ahead — so they reliably show up in "near me." Builds clean; lint passes.*

### Changed
- **`area` is now required** on the add-practitioner form. It was optional, so a practitioner who skipped it (or typed something ungeocodable) silently dropped out of "near me," making them hard to find. Now enforced **client-side** (required field) **and server-side** (`submitPractitioner`). This aligns the code with `Product.md §7`, which already specified it as required.
- **Easy location entry:** the practitioner form now uses the same **type-ahead `AddressAutocomplete`** as the event form — pick a suggestion and it **pins area-level coordinates** for reliable "near me" placement; free-typing still geocodes on submit. Generalized the component with `name` / `placeholder` / `required` props (events keep `location_text`, practitioners use `area`). Framed as a **neighbourhood/city, not a home address** (keeps the area-level privacy norm).

### Refactor
- Extracted **`resolveCoordsFromForm`** into `src/lib/geocode.ts` (prefer the picked autocomplete coords, else geocode the typed text) and used it in **both** `submitPractitioner` and `submitEvent` — removing the duplicated resolver that lived in the event action.

### Docs
- `Product.md`, `Claude.md`, `Readme.md`, `Changelog.md` → Build 16.

---

## v0.1.0 — Build 15 (2026-07-02)

*Polish pass on the practitioner pilot: Hearth-flame favicon, warmer honest copy, shareable-link buttons, and richer profiles (+ a photo field). Builds clean; lint passes.*

### Added
- **Hearth-flame favicon** — replaced the default Next.js/Vercel tab icon with `src/app/icon.svg` (the gold flame from `logo.tsx` on a deep "night" tile, so it reads on any browser theme); removed `src/app/favicon.ico`.
- **Share / copy-link** — new `ShareButton` (`src/components/share-button.tsx`): opens the phone's native share sheet (Web Share API) or copies the link + confirms. It takes an absolute `url` built with `siteUrl()` so it shares the canonical deployed link (no `window`/effect, no hydration mismatch). Placed on the **practitioner profile** ("Share this profile") and on the **"you're live" screen** after adding a practice — which now shows the practitioner **their own `/p/…` link to copy** plus a "View your profile" button (previously there was no way to grab it).
- **Photo/logo on the add-practitioner form** — a new optional `photo_url` field (stored only if it's an `http(s)` link; the card/profile already render it). Direct uploads are the **next build** (see below).
- **Richer profile layout** (`/p/[slug]`) — a header card with a gradient banner + larger rounded avatar, an **Offerings** chip row from the `keywords` field (previously not shown), and a dedicated **"Get in touch"** contact card. A step toward the "profile-as-mini-site" vision.

### Changed
- **Honest, warmer copy** — dropped the "our community *trusts / vouches for*" claim (anyone can post, so it over-claimed) in the hero headline/subheading (`app/page.tsx`) and the browser-tab title/description (`app/layout.tsx`). Hero now: *"A warm home for our community's healers."*

### Planned next (not yet built)
- **Practitioner profiles as mini-websites:** real photo **uploads** (Supabase Storage bucket + RLS, replacing URL-paste), a small **gallery**, and a fuller profile redesign. Scoped for the next build.

### Docs
- `Readme.md`, `Design.md`, `Product.md`, `Changelog.md` → Build 15.

---

## v0.1.0 — Build 14 (2026-07-02)

*Practitioner-only pilot: email alerts to stewards, report-a-practitioner everywhere, and the Events layer hidden behind one flag. Builds clean; lint passes.*

### Added — steward email notifications (the missing "notify a human")
- **`src/lib/notify.ts`** (`notifyAdmins`, server-only) — emails everyone in `ADMIN_EMAILS`, using whichever provider is configured (no code change to switch): **Resend** (`RESEND_API_KEY` — no email account/domain/app-password needed; onboarding sender delivers to your Resend-account inbox until a domain is verified) or **Gmail SMTP** (`nodemailer`, from a Gmail you control via a Google App Password — no recipient limit). Degrades gracefully: with neither configured it logs to the server console instead of sending, so the app still builds/runs without credentials, and it **never throws** (a failed alert can't break a submission).
- **Report threshold now emails** (`submitReport`): when a practitioner crosses **3 distinct reporters**, stewards get one email (fires once, on crossing — no alert fatigue) with the listing name, reason, and links to the listing + `/admin/reports`. Replaces the previous silent `console.warn`. *Flags still never auto-hide.*
- **Held submissions now email** (`submitPractitioner`): a listing held `pending` by the content check emails stewards the name, the reason it was held, and a link to `/admin/moderation` — delivering the "notify the admin immediately" the docs always promised.
- **`siteUrl()`** helper (`src/lib/url.ts`) for absolute links inside emails; `NEXT_PUBLIC_SITE_URL` env (defaults to the production domain).

### Added — report a practitioner from anywhere
- **"Report" link on every practitioner card** (`PractitionerCard`), matching the event cards — previously the only entry point was a buried link on the profile page. The backend, `/report` page, and admin inbox already handled practitioners; this closes the discoverability gap.

### Changed — practitioner-only pilot (Events hidden, reversibly)
- **`src/lib/features.ts`** — new `EVENTS_ENABLED` flag (`false`). One switch hides the whole public Events layer; no code deleted. Gated: the **Events nav** link, the home **"Coming up"** peek + hero events CTA/copy, the **"events they host"** section on profiles, and the **`/events` + `/add-event`** routes (→ 404 while hidden). Footer copy softened to practitioners-only.
- **Daily import cron** (`/api/cron/import`) short-circuits when events are disabled — no wasted import/geocoding of events no one can see; resumes automatically when re-enabled.
- Admin-side event management is intentionally left intact (behind auth, invisible to the public, ready for when events return).

### Setup required
- Turn on email delivery (local + Vercel) with **either** `RESEND_API_KEY` (easiest — no email account/domain needed) **or** `GMAIL_USER` + `GMAIL_APP_PASSWORD` (a Google App Password on a 2-Step-Verification account); optionally `NEXT_PUBLIC_SITE_URL`. Without either, alerts log to the server console.

### Docs
- `Readme.md`, `Architecture.md`, `Security.md`, `Product.md`, `Design.md`, `Claude.md`, `.env.example` → Build 14.

---

## v0.1.0 — Build 13 (2026-06-26)

*Admin panel — the v1 feature set is complete. Builds clean; lint passes.*

### Added — #3 admin panel
- **Auth:** Supabase Auth login (`/admin/login`, `LoginForm`), `src/middleware.ts` session refresh on `/admin`, `src/lib/auth.ts` gate by **`ADMIN_EMAILS`** allowlist. Pages under `app/admin/(protected)/` redirect non-admins to login (verified: `/admin*` → 307 login when unauthenticated).
- **Security model:** admin reads (`src/lib/data/admin.ts`) + mutations (`src/lib/actions/admin.ts`) use the **service role**; every mutation calls `requireAdmin()` — admin power never depends on broad `authenticated` RLS.
- **Pages:** Dashboard (counts) · Moderation (approve/reject pending practitioners + events) · Reports (open reports grouped by target with distinct-reporter counts; hide / dismiss) · Practitioners (hide/feature/delete) · Events (hide/feature/delete + **Run import now**) · Categories (add / rename / activate-deactivate).
- Reusable `ActionButton` + `SignOutButton`.

### Setup required
- Add `ADMIN_EMAILS` (local + Vercel) and create the matching user(s) in Supabase Auth; keep public sign-ups disabled.

### Docs
- `Architecture.md`, `Security.md`, `Claude.md`, `.env.example`, `Readme.md` → Build 13.

---

## v0.1.0 — Build 12 (2026-06-26)

*Community report / flagging flow. Builds clean; lint passes.*

### Added — #2 report flow
- **`/report?type=&id=`** page + **`ReportForm`** (no login): reason, reporter email/WhatsApp (for dedupe), optional details, with private/quiet framing.
- **`submitReport`** server action (service-role): one report per contact per target (dedupe), denormalizes the **distinct-reporter `flag_count`** onto practitioners, and logs a steward alert when distinct reporters reach **3** (flags never auto-hide).
- **"Report" links** on practitioner profiles ("Report this listing") and event cards (subtle "Report").
- Verified end-to-end: inserts for both target types, distinct-count/flag-count update, and the one-target `CHECK` rejecting bad rows.

### Docs
- `Architecture.md`, `Readme.md` → Build 12.

---

## v0.1.0 — Build 11 (2026-06-26)

*Shareable practitioner profile pages. Builds clean; lint passes.*

### Added — #1 practitioner profiles
- **`/p/[slug]`** profile page: avatar/photo, name + practice, `✦` member badge, all categories, description + bio, area/mode/languages/pricing, full contact buttons, and **upcoming events they host**. Per-profile share metadata (`generateMetadata`) for clean WhatsApp link previews.
- Data: `getPractitionerBySlug` + `getEventsByHost`.
- Directory cards now **link the name to the profile**.
- The add-event form has an optional **"Are you a Hearth practitioner?"** selector (`getPractitionerOptions` → `host_practitioner_id`), so events cross-link to a profile and surface there. `submitEvent` stores it.

### Docs
- `Architecture.md`, `Readme.md` → Build 11.

---

## v0.1.0 — Build 10 (2026-06-26)

*The daily cron now auto-geocodes new addressed events/practitioners. Builds clean; lint passes.*

### Added
- **`src/lib/import/geocode-pending.ts`** (`geocodePending`) — geocodes events (`location_text`) and practitioners (`area`) that have a location but no coordinates, reusing `geocodeAddress` (same cleaning/fallbacks as the submit path). Capped at 20 addresses/run and throttled ~1/sec (Nominatim-friendly; repeated addresses geocoded once); the rest roll to the next run.
- **`/api/cron/import`** now runs `geocodePending` right after the import, so freshly-imported addressed events join **"near me"** with no manual step. Response shape is now `{ ok, import, geocode }`.

### Verified
- End-to-end: a temp addressed event imported coordinate-less was auto-geocoded by the cron (Nathan Phillips Square → 43.65, -79.38), `geocode:{attempted:1,geocoded:1}`, then cleaned up.

### Docs
- `Bugs.md` (limitation resolved), `Architecture.md`, `Claude.md`, `Readme.md` → Build 10.

---

## v0.1.0 — Build 9 (2026-06-26)

*Automatic daily Google Calendar import (Vercel Cron) + "Add to calendar" on events. Builds clean; lint passes.*

### Added — #4 auto-import (the transition mechanism)
- **Shared import core** `src/lib/import/ics-core.mjs` (+ `ics-core.d.mts` types): parse/recurrence-expand/clean/dedupe/insert — one implementation now used by **both** the standalone script and the cron.
- **Server module** `src/lib/import/calendar.ts` (`runCalendarImport`, service-role, reads `process.env`).
- **`/api/cron/import`** route — `CRON_SECRET`-guarded (Vercel Cron sends the Bearer; open locally for manual runs).
- **`vercel.json`** — daily cron at 09:00 UTC, so events still added via the legacy Google Form sync into Hearth automatically during the transition.
- Rewrote `scripts/import-calendar.mjs` to a thin wrapper over the shared core (no duplicated logic). Added `serverExternalPackages: ["node-ical"]` (the route otherwise fails to build with a `BigInt` bundling error).

### Added — #5 add to calendar
- **"+ Calendar"** link on every event (`googleCalendarUrl`) — opens a pre-filled Google Calendar event (works on desktop + mobile), alongside Register / Directions.

### Notes
- Cron import does **not** geocode; new addressed events need `npm run geocode` to join "near me" (tracked in `Bugs.md`).
- Needs a one-time `CRON_SECRET` env var added in Vercel.
- Docs updated: Architecture, Claude, Bugs (recurring-horizon resolved), `.env.example`, Readme → Build 9.

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
