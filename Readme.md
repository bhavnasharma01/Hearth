# Hearth 🔥

*The lasting, searchable home for the practitioners and events that **our** community vouches for.*

**🌐 Live:** https://hearthto.vercel.app — auto-deploys from `main` via Vercel.

**Version:** 0.1.0 · **Build:** 13
*(Status: **deployed & live** at hearthto.vercel.app — browse + submit, daily auto-import + auto-geocode, "📍 near me", add-to-calendar, shareable profiles, report/flagging flow, and a full **admin panel** (moderation, reports, listings/events management, categories). A feature-complete v1.)*

---

## What Hearth is

A free, **phone-first** community website with two layers in one home:

1. **Practitioner Directory** *(the defensible core)* — a searchable directory of healers, therapists, facilitators, and conscious businesses our community trusts.
2. **Events** *(the warm front door)* — a beautiful, scannable view of upcoming conscious events, far easier on a phone than Google Calendar.

The two are **linked**: an event can reference its host practitioner, and a practitioner's profile shows the events they host — so people who come for one discover the other.

**Principles:** free & open to all · no login for the public (accounts modelled but dormant) · mobile-first · open posting, community-policed · low-maintenance for a non-technical steward to run.

> The full *why* lives in `documentation/Product.md` (North Star + product overview). Read that first.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + React + TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase Postgres (Row-Level Security) |
| Auth | Supabase Auth — **admins only** |
| Storage | Supabase Storage (photos, flyers) |
| Search | Postgres full-text (`tsvector`) |
| Hosting | Vercel (free tier) |
| Event seed | Google Calendar API (one-time import) |

Effectively **$0** at community scale. Architecture detail in `documentation/Architecture.md`.

---

## Repository layout

```
/                                  ← project root
├── Readme.md                      ← this file: high-level overview
├── Changelog.md                   ← every change, newest at top, by build
├── Claude.md                      ← working notes / tips for the AI assistant
├── Bugs.md                        ← known bugs & issues spotted while building
├── .env.example                   ← required env vars (copy to .env.local)
├── package.json / next.config.ts / tsconfig.json …   ← Next.js project config
├── src/
│   ├── app/                       ← App Router pages (Home, /practitioners, /events)
│   ├── components/                ← UI (header, footer, cards, filter chips)
│   └── lib/                       ← supabase clients, data access, types, helpers
├── supabase/
│   └── migrations/                ← SQL schema, RLS policies, category seed
└── documentation/
    ├── Architecture.md            ← system & tech architecture (living)
    ├── Security.md                ← security, privacy, abuse-resistance (living)
    ├── Product.md                 ← product overview + North Star (living)
    ├── Design.md                  ← design & UX overview (living)
    ├── Hearth - Database Schema.md      ← full table-by-table data model
    ├── Hearth - Database Schema.mermaid ← ER diagram
    └── planning-archive/          ← original planning docs (preserved for provenance;
                                      assimilated into the living docs above)
```

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Google Calendar values
npm run dev                  # http://localhost:3000
```

Without env values the app still runs and compiles — the pages render their
calm empty states until the Supabase project is connected. Apply the schema by
running `supabase/migrations/0001_initial_schema.sql` against the Supabase
project (SQL editor or the Supabase CLI).

Seed the community events from the public calendar (no API key needed):

```bash
npm run import:calendar     # import/refresh events from the public ICS feed
npm run geocode             # backfill coordinates for events/practitioners with a location
```

---

## Where to start reading

1. **`documentation/Product.md`** — the North Star and what we're building & why.
2. **`documentation/Architecture.md`** — how it's put together.
3. **`documentation/Hearth - Database Schema.md`** — the data model.
4. **`documentation/Security.md`** & **`documentation/Design.md`** — the two pillars.
5. **`Claude.md`** — nuances, conventions, and the working agreement.

---

## Scope at a glance

- **v1 (current):** Directory + Events (native add, search/filter, profiles, seeded import), moderation, admin panel, category management.
- **v2:** member accounts, practitioner self-edit, optional positive-only endorsements.
- **v3:** off-platform-payment registrations, education/blog.
