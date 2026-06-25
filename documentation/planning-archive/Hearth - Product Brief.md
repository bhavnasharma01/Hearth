# Hearth — Product Brief

*The lasting, searchable home for the practitioners and events our community vouches for.*

**Status:** Draft v0.1 for review (2026-06-25). Written by Claude with Bhavna, consolidating the vision call, the North Star, the Implementation Spec, and the v1 Database Schema. This is the single document we brainstorm against; once we're aligned it becomes the source of truth that the build docs (`readme.md`, `documentation/Product.md`, etc.) are derived from.

---

## 1. Why Hearth exists (the one-line test)

Our community's trusted knowledge — *who the good practitioners are, and what's happening* — keeps evaporating, because it only lives in WhatsApp (which forgets) and a clunky calendar (which nobody reads on a phone).

> **Hearth is the lasting, searchable home for the practitioners and events that *our* community vouches for.**

Every feature below is checked against one question: *Does this strengthen the lasting, trusted, searchable home — or are we rebuilding something WhatsApp/Luma already does?*

The **directory is the defensible core** (no one else has *our* trusted, curated set of people). **Events are the warm front door** (high-frequency, the reason people open the site often) — and we're now building them natively so the on-phone experience is genuinely better than Google Calendar, not just a re-skin of it.

---

## 2. Decisions locked for this build

| # | Decision | Choice |
|---|---|---|
| 1 | **Foundation** | Database-backed app — **Next.js + Supabase (Postgres)**. Supersedes the original "$0 static site reading Google Sheets" plan. |
| 2 | **Events** | **Native creation in Hearth**, stored in the DB. One-time **import of the existing Google Calendar** (2026-01-01 forward) to seed and demonstrate. The Hearth "Add an event" form replaces the Google Form flow. |
| 3 | **Trust signal** | **Community-member badge only.** No public upvotes or written reviews in v1. Trust = curation + the "one of us" badge + quiet flagging. |
| 4 | **Login** | **No login for the public** (browse or submit). Admin/steward sign in via Supabase Auth. Member accounts are modelled in the schema but switched **off** until v2. |
| 5 | **v1 scope** | **Directory + Events together** *(to confirm)*. Accounts, endorsements, registrations, and the education/blog are staged for later. |
| 6 | **Cost** | Effectively **$0** at this scale (Supabase + Vercel free tiers comfortably cover a few hundred listings and visitors). A small departure from "literally zero infra," but no real spend. |

---

## 3. Who it's for (personas)

- **The Seeker** — a community member who occasionally needs "a good osteopath / breathwork facilitator / sound healer." Opens Hearth on their phone, searches or filters, taps to message someone *they can trust because the community vouches for them.*
- **The Browser** — opens Hearth to see "what's happening this week." Events are the habit-forming hook; while there, they discover practitioners.
- **The Practitioner** — a healer/facilitator/conscious business who adds themselves in two minutes, no account, and gets a shareable profile they can post in WhatsApp.
- **The Host** — adds an event in two minutes; if they're also a listed practitioner, the event links back to their profile (cross-discovery).
- **The Steward / Admin** (Bhavna, later a community steward; Anat & Curtis) — manages categories, reviews the small suspicious fraction, acts on flags. About a minute, only when pinged.

---

## 4. The experience (what a visitor does)

**Open the link → land on Home.** A warm one-line welcome, a peek at *both* worlds: the next few upcoming events and a handful of featured/just-added practitioners, each tapping into its full view. Two clear tabs: **Practitioners** and **Events**.

**Events tab** — the default-friendly view:
- A clean **"Upcoming" card feed**, grouped by *This week / Next week / Later*. Each card: title, date & time, in-person/online, location, short description, cost note (e.g. "PWYC"), flyer image, and a **View / Register** button.
- **Search + filter**: by category/type, by mode (in person/online/both), by date range, free-text search.
- Optional **month-grid view** for people who want the traditional layout.
- A prominent **"➕ Add an event"** button → the native Hearth event form.

**Practitioners tab** — the defensible core:
- **Search bar** (name, practice, description, keywords) + tappable **category chips** + **In person / Online / Both** filter.
- **Listing cards**: name/practice, category tag(s), short description, area + mode, a **"Community member"** badge where applicable, optional photo, and **contact buttons** — *Message on WhatsApp* (`wa.me`), Email, Website, Instagram.
- Each card opens a **profile page** (`/p/jane-smith`): full bio, all categories, contact options, and any **upcoming events this person is hosting** (the cross-discovery payoff).
- Prominent **"➕ Add your practice"** button → the native add form.
- Subtle **"Report a listing"** link → report flow (no login; asks contact for dedupe).

Everything is **mobile-first, calm and uncluttered** — soft greens/whites, rounded cards, generous spacing, friendly type. No ads, no tracking, no accounts in the way.

---

## 5. The practitioner "add yourself" form (full field set)

You asked me to think through *every* question worth asking. Here's the complete set — **required** kept minimal (one screen) so completion stays high; everything else optional and enriches the profile.

**Required**
1. **Your name**
2. **Category** — choose **up to 3** from the taxonomy (§7)
3. **Short description** — ~300 chars, "what you offer" (powers the card + search)
4. **Area / location** — e.g. "Oakville," "Toronto + online"
5. **How do you work?** — In person / Online / Both
6. **Best way to reach you** — at least **one** of: WhatsApp · Email · Website (enforced in the form *and* with a DB `CHECK` constraint)
7. **Community agreement** — "I offer this in good faith and agree to the community's spirit of respect and care."

**Optional (profile enrichment)**
8. **Practice / business name** (defaults to your name)
9. **Longer bio / about** — for the profile page
10. **Photo or logo**
11. **Instagram / social link**
12. **Website / booking link** (if different from contact)
13. **Pricing note** — e.g. "sliding scale," "PWYC," typical range
14. **Languages spoken** — meaningful for a diverse community
15. **Keywords / offerings** — free tags to sharpen search (e.g. "Thai massage, lymphatic, prenatal")
16. **Are you a member of the community group?** — yes/no → drives the **Community-member badge**

> Deliberately *not* asked in v1: certifications/credentials as a gate (we're trust-based, not credential-based), and anything requiring an account. These can become optional fields later if the community wants them.

**On submit:** an automated content check runs. Clean submissions **publish instantly** (`status = live`). Suspicious ones (banned words, many URLs, missing required fields) are held (`status = pending`) and the admin is notified — so legitimate people get instant publish and only the small risky fraction waits.

---

## 6. The event "add an event" form (full field set)

**Required**
1. **Event title**
2. **Start date & time**
3. **Category / type** (e.g. Ecstatic Dance, Breathwork, Ceremony, Workshop)
4. **Mode** — In person / Online / Both, plus **location** (text/address or link)
5. **Community agreement**

**Optional**
6. **End date & time**
7. **Description**
8. **Cost note** — "Free," "PWYC," "donation-based," or a price
9. **Registration / ticket link** (e.g. Luma, Eventbrite — we still happily link out)
10. **Flyer / image**
11. **Host name** — *or* **"I'm a Hearth practitioner"** → link to your profile (`host_practitioner_id`), so the event and the directory cross-reference each other
12. **Recurring?** — simple recurrence (weekly/monthly) stored as an iCal `RRULE`, replacing "ask the admin to repeat it"
13. **Contact for questions**

Same moderation model as practitioners: clean → instant publish; suspicious → held + admin notified.

---

## 7. Category taxonomy (seeded, admin-extendable)

Stored as a **table**, not a hardcoded list, so the admin can add categories (e.g. "medicine people") without a developer. v1 seed (11 starter categories):

Bodywork & Massage · Somatic & Movement · Energy Healing · Manual & Physical Therapies · Mental & Emotional Wellbeing · Ceremony & Plant Medicine · Spiritual Guidance · Nutrition & Herbalism · Classes, Workshops & Facilitation · Creative & Expressive Arts · Conscious Business & Other.

A practitioner may hold up to ~2–3. Events get a lighter event-type set (can reuse a subset or a small dedicated list — to decide in design).

---

## 8. Trust, moderation & keeping it healthy

**Trust signal (v1):** the **Community-member badge** — the "one of us" mark. No public votes, no written reviews. (Rationale: reviews are moderation-heavy and can feel transactional/Yelp-like, clashing with the warm, trust-bound ethos. We can revisit *positive-only endorsements* in v2 if there's appetite.)

**Open posting → auto-check → instant publish → community reporting → human only when needed.** No listing is ever auto-punished.

- **Reporting** is a no-login form that asks for the reporter's email/WhatsApp — a **field for de-duplication, not a login.**
- The system counts **distinct reporters** per listing. **3 distinct reporters** → the steward is **notified**; a **human** decides whether to hide. Flags never auto-hide.
- **No public flag counts** — nothing to brigade, no public shaming.
- **Reporter-pattern check:** one person flagging many listings is noted, and their flags can be discounted.

**Removal / edit requests** (v1): practitioner contacts the steward, who edits via the admin panel. Self-edit (via a claimed account) is a v2 feature.

---

## 9. Admin / steward panel

A lightweight authenticated area (Supabase Auth — only admins log in). Capabilities:

- **Moderation queue** — review `pending` listings/events flagged by the auto-check; publish or reject.
- **Reports inbox** — flagged items with distinct-reporter counts; hide / unhide / edit / dismiss.
- **Manage categories** — add, rename, reorder (`sort_order`), deactivate (hide without deleting).
- **Manage listings & events** — edit any field, hide/unhide, delete, toggle **Featured** (Home-page peek).
- **Import events** — one-time/occasional pull from the Google Calendar to seed/backfill (deduped via `external_id`).
- *(v2+)* manage blog posts; manage member roles.

---

## 10. Architecture (high level)

```
                       ┌─────────────────────────────┐
   Practitioner ─add─▶ │                             │
   Host        ─add─▶  │   Hearth (Next.js app)      │ ─▶ Community
   Seeker  ─browse/report─▶                          │    (phone-first
                       │   • public site (no login)  │     web)
   Admin   ─sign in─▶  │   • admin panel (auth)      │
                       └──────────────┬──────────────┘
                                      │
                         Supabase (Postgres + Auth + Storage)
                         • practitioners, events, categories,
                           practitioner_categories, reports
                         • full-text search (tsvector)
                         • Row-Level Security
                                      ▲
                         one-time import ─ Google Calendar API
                         (seed historical/upcoming events)
```

- **Frontend/Backend:** Next.js (App Router) — server components + server actions / API routes. Mobile-first, Tailwind for the calm visual system.
- **Data:** Supabase Postgres with the v1 schema (`practitioners`, `categories`, `practitioner_categories`, `events`, `reports`; `users`/`registrations` modelled, dormant). Row-Level Security: public read of `live` rows, inserts allowed for submissions, writes restricted to admins.
- **Storage:** Supabase Storage for photos/flyers (with an external-URL fallback, as the schema allows).
- **Search:** Postgres full-text via `search_vector` — search is a database feature, not a hack.
- **Auth:** Supabase Auth for admins only; public stays login-free.
- **Hosting:** Vercel (or Cloudflare) free tier. **Provenance** (`source`, `external_id`) on every row lets Hearth coexist with and gradually replace the Google pipeline cleanly.

---

## 11. Scope staging

**v1 — the two layers, one home** *(this build)*
Directory (add / browse / search / filter / profile pages / contact buttons / member badge) · Events (native add / upcoming feed / filters / month view / seeded import) · moderation (auto-check + reporting) · admin panel · category management.

**v2 — accounts & richer trust**
Member sign-in · practitioners **claim & self-edit** their listing (`owner_user_id`) · optional **positive-only endorsements** · richer notifications.

**v3 — registrations & education**
Off-platform-payment **RSVP/registrations** (cash/e-transfer with uploaded proof; lean on Luma for real ticketing) · the **education/blog** layer ("What is Kundalini yoga?" articles + curated resources, linked from relevant categories/events).

---

## 12. Open questions to brainstorm next

1. **v1 scope confirm** — Directory + Events together, as written? (Implied by choosing native events.)
2. **Event taxonomy** — reuse practitioner categories for event types, or a small dedicated list?
3. **Seed import** — which Google Calendar (ID/access), and confirm the 2026-01-01-forward window.
4. **Visual identity** — do we have brand colours/logo from Anat & Curtis, or do we design the "soft greens/whites" system from scratch?
5. **Admin accounts** — who are the initial admins (Bhavna + Anat + Curtis)?
6. **Profile URLs & sharing** — confirm the `/p/slug` shareable-profile pattern (great for posting a single practitioner into WhatsApp).
7. **Endorsements later?** — park "thumbs-up" for v2, or rule it out entirely?

---

*Next step after we align on this brief: I'll stand up the project doc scaffolding (`readme.md`, `changelog.md`, `documentation/{Architecture,Security,Product,Design}.md`) seeded from these decisions, then begin the v1 build.*
