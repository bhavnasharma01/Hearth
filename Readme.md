# Hearth 🔥

*The lasting, searchable home for the practitioners and events that **our** community vouches for.*

**🌐 Live:** https://myhearthapp.ca — auto-deploys from `main` via Vercel (hearthto.vercel.app remains as an alias).

**Version:** 0.1.0 · **Build:** 56
*(Status: **deployed & live** at myhearthapp.ca. Currently running a **practitioner-only pilot** — the Events layer is built but hidden behind one flag (`src/lib/features.ts`) and can be switched back on any time. Live today: browse + submit practitioners (with a photo/logo + a **required, type-ahead location** so they reliably show in "📍 near me"), **richer shareable profiles** with a Share/copy-link button, the Hearth-flame favicon, report/flagging on every listing, **email alerts to stewards** (Resend or Gmail SMTP) when a listing is held for review or crosses the report threshold, and a full **admin panel** (moderation, reports, listings/events management, categories).)*

---

## What Hearth is

A free, **phone-first** community website with two layers in one home:

1. **Practitioner Directory** *(the defensible core)* — a searchable directory of healers, therapists, facilitators, and conscious businesses our community trusts.
2. **Events** *(the warm front door)* — a beautiful, scannable view of upcoming conscious events, far easier on a phone than Google Calendar.

The two are **linked**: an event can reference its host practitioner, and a practitioner's profile shows the events they host — so people who come for one discover the other.

**Principles:** free & open to all · login gates contributing, never consuming (browse/contact with no account; Google sign-in for practitioners to own their listing) · mobile-first · open posting, community-policed · low-maintenance for a non-technical steward to run.

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
| Email | Steward alerts via Resend **or** Gmail SMTP (`nodemailer`) |
| Hosting | Vercel (free tier) |
| Event seed | Public iCal feed via `node-ical` (no API key) |

Effectively **$0** at community scale. Architecture detail in `documentation/Architecture.md`.

---

## Repository layout

```
/                                  ← project root
├── Readme.md                      ← this file: high-level overview
├── Changelog.md                   ← every change, newest at top, by build
├── Claude.md                      ← working notes / tips for the AI assistant
├── Bugs.md                        ← known bugs & issues spotted while building
├── .env.example                   ← required env vars (copy to .env.local); tracked
├── vercel.json                    ← Vercel Cron schedule (daily event import)
├── package.json / next.config.ts / tsconfig.json …   ← Next.js project config
├── src/
│   ├── app/                       ← App Router pages (Home, /practitioners, /p/[slug],
│   │                                /feedback, /report, /admin, api routes)
│   ├── components/                ← UI (header, footer, cards, forms, share button)
│   └── lib/                       ← supabase clients, actions, data, auth, notify, geo…
├── public/                        ← static assets served at the site root
│   └── palette-explorations.html  ← shareable palette-review page (temporary)
├── supabase/
│   └── migrations/                ← SQL schema, RLS, category seed (0001 → 0007)
└── documentation/
    ├── Architecture.md            ← system & tech architecture (living)
    ├── Security.md                ← security, privacy, abuse-resistance (living)
    ├── Product.md                 ← product overview + North Star (living)
    ├── Design.md                  ← design & UX overview (living)
    ├── Hearth - Database Schema.md      ← full table-by-table data model
    ├── Hearth - Database Schema.mermaid ← ER diagram
    ├── Google Sign-In Setup.md          ← accounts Phase A: config guide (Google OAuth + Supabase)
    ├── Domain Setup.md                  ← myhearthapp.ca: Vercel, Supabase URLs, Resend, SMTP
    └── planning-archive/          ← original planning docs (preserved for provenance;
                                      assimilated into the living docs above)
```

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in Supabase (+ optional admin/email vars)
npm run dev                  # http://localhost:3000
```

Without env values the app still runs and compiles — the pages render their
calm empty states until the Supabase project is connected. Apply the schema by
running the migrations in `supabase/migrations/` **in order** (`0001` schema +
RLS + category seed → `0002` geocoding → `0003` Instagram-as-contact → `0004`
feedback → `0005` manage-token + accepting-clients → `0006` avatars Storage
bucket → `0007` services → `0008` public accounts Phase A) against the
Supabase project (SQL editor or the Supabase CLI).

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

- **v1 (current):** Directory + Events (native add, search/filter, profiles, seeded import), moderation, admin panel, category management. **Piloting practitioners only** — the Events layer is temporarily hidden behind the `EVENTS_ENABLED` flag (`src/lib/features.ts`); flip it to bring events back.
- **v2:** member accounts, practitioner self-edit, optional positive-only endorsements.
- **v3:** off-platform-payment registrations, education/blog.
