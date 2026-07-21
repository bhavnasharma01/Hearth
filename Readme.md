# Hearth 🔥

*The lasting, searchable home for the practitioners and events that **our** community vouches for.*

**🌐 Live:** https://myhearthapp.ca — auto-deploys from `main` via Vercel (hearthto.vercel.app remains as an alias).

**Version:** 0.1.0 · **Build:** 95
*(Status: **deployed & live** at www.myhearthapp.ca (canonical host is **www**; apex + hearthto.vercel.app redirect/alias). Practitioner-only pilot — the Events layer stays behind one flag (`src/lib/features.ts`). Live today: browse/search/contact with **no account**; **member accounts** (Google + email/password via Supabase Auth) gate contributing — add your practice (one per account), edit/delete it from **My practice**, claim pre-account listings; **testimonials** ("Kind words": member-written, practitioner-approved, with email notification); rich profiles (Where & how card, embedded neighbourhood map + directions, tappable links, services, avatar); **Support & feedback** in the footer; steward email alerts from the verified `myhearthapp.ca` Resend domain; the final **Clementine & Juniper** identity — heart-flame mark, **Zilla Slab + Source Sans 3** type, branded emails with the logo, AODA-minded WCAG-AA accessibility (skip-link, visible focus, reduced motion) — on a one-block-swappable palette system; **comprehensive search** (categories, services, bio, prefix matching); public **/privacy** and **/disclaimer** pages; and the full **admin panel** (moderation, reports resolve-on-hide, listings edit/manage-link copy, categories with auto emoji).)*

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
| Email | One Resend account (verified `myhearthapp.ca` domain) carries everything: steward alerts + member notifications (branded HTML, `src/lib/email-html.ts`) via `notify.ts`, and Supabase auth emails via custom SMTP; Gmail SMTP remains a fallback transport |
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
│   │                                /signin, /my-practice, /recommend, /my-recommendations,
│   │                                /feedback, /report, /manage/[token], /admin, api routes)
│   ├── components/                ← UI (header, footer, cards, forms, share button)
│   └── lib/                       ← supabase clients, actions, data, auth, notify, geo…
├── public/                        ← static assets served at the site root
│   ├── logo.svg                   ← the heart-flame mark (standalone asset)
│   ├── email-logo.png             ← raster logo for emails (clients strip SVG)
│   ├── qr-card.html               ← printable QR cards for events (2 audiences: recruit practitioners + seekers)
│   ├── qr-find-practitioners.svg / .png   ← branded QR → /practitioners (scan-verified; PNG for WhatsApp/Canva)
│   ├── qr-add-practice.svg / .png         ← branded QR → /add-practitioner (scan-verified)
│   ├── palette-explorations.html  ← how the brand was chosen (historical; removable)
│   ├── brand-preview.html         ← the brand dress rehearsals (historical; removable)
│   ├── logo-rethink.html          ← flame-cutout redraw round (resolved Build 89; historical)
│   └── stone-ember-preview.html   ← F4 palette review page with live toggle (Anat's ask; removable after review)
├── supabase/
│   └── migrations/                ← SQL schema, RLS, seeds (0001 → 0010, run in order)
└── documentation/
    ├── Architecture.md            ← system & tech architecture (living)
    ├── Security.md                ← security, privacy, abuse-resistance (living)
    ├── Product.md                 ← product overview + North Star (living)
    ├── Design.md                  ← design & UX overview (living)
    ├── Hearth - Database Schema.md      ← full table-by-table data model
    ├── Hearth - Database Schema.mermaid ← ER diagram
    ├── Google Sign-In Setup.md          ← accounts Phase A: config guide (Google OAuth + Supabase)
    ├── Domain Setup.md                  ← myhearthapp.ca: Vercel, Supabase URLs, Resend, SMTP
    ├── email-templates/                 ← paste-ready Supabase auth emails (+ README)
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
bucket → `0007` services → `0008` public accounts Phase A → `0009`
testimonials → `0010` comprehensive search) against the Supabase project
(SQL editor or the Supabase CLI).

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

- **v1 (current):** Directory + Events (native add, search/filter, profiles, seeded import), moderation, admin panel, category management — **plus the account layer, shipped early during the pilot (July 2026):** member sign-in (Google + email/password), one owned practice per account with self-edit/delete/claim, and practitioner-approved **testimonials**. **Piloting practitioners only** — the Events layer is hidden behind the `EVENTS_ENABLED` flag (`src/lib/features.ts`); flip it to bring events back.
- **Next:** launch (brand is final: Clementine & Juniper + heart-flame, Build 73), then events return.
- **v3:** off-platform-payment registrations, education/blog.
