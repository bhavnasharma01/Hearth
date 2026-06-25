# Changelog

*All notable changes to Hearth, newest at top. Grouped by build under the current version. Build number increments each work session; version changes only on explicit instruction.*

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
