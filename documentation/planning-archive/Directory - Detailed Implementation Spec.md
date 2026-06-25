# Hearth — Implementation Spec

*Hearth: the warm center of a home people gather around — a hub for practitioners and conscious events in our community.*

**Purpose:** This document describes, in detail, how the Hearth community hub is built and operated. The hub has two layers in one website: a **practitioner directory** and a **beautiful, phone-friendly view of upcoming community events**. It is written so that an AI assistant (or a developer) can use it to build everything, while remaining readable for Anat or Curtis if they'd like to see the inner workings.

**Status:** Draft for review. Categories, form fields, and copy are starting points meant to be refined.

---

## 1. Overview & principles

A free, low-maintenance, phone-first website that does two things in one place:

- **Find practitioners** — a searchable directory of healers, therapists, facilitators, and conscious businesses in our community.
- **See what's happening** — a clean, easy-to-read list of upcoming conscious events, pulled live from the community Google Calendar (much friendlier than the calendar itself on a phone).

Design principles:

- **Free forever** — only tools with genuinely free tiers, no surprise paywalls.
- **No login** — no accounts or passwords for anyone, submitting or browsing.
- **Two layers, one home** — practitioners and events live together, so people coming for one discover the other.
- **Reuse what already works** — events keep flowing through the existing events form and calendar; nothing changes for event hosts or for Naila.
- **Open posting, community-policed** — anyone can add a listing instantly; the community flags problems; a human only steps in on flagged items.
- **Non-technical to operate** — all day-to-day content lives in Google Forms, a Google Sheet, and the existing Google Calendar that a non-technical steward can run. A developer is only needed for the initial build and rare redesigns.
- **Mobile-first** — most members live on WhatsApp on their phones, so the experience is designed for a phone screen first.

---

## 2. Architecture (how the pieces connect)

```
PRACTITIONER DIRECTORY
Practitioner ──▶ Directory Form ──▶ Google Sheet ──┐
Seeker reports a listing ──▶ Report Form ──────────┤
                                                   ├──▶  WEBSITE  ──▶ Community
EVENTS                                             │   (one site,
Event host ──▶ Events Form (existing) ──▶ Google ──┘    two views)
                                          Calendar
                                          (curated by Naila, as today)
                              │
                  Google Apps Script (free)
                  • content checks on new listings
                  • counts distinct reporters
                  • emails Anat/Curtis when a listing crosses the flag threshold
```

**Data flow in words:**

- *Directory:* practitioners submit through a Google Form → a Google Sheet. The website reads the sheet live and renders the directory. The site never writes data, so there is no server to maintain and no open database to attack.
- *Events:* event hosts keep using the **existing** events Google Form, which feeds the **existing** community Google Calendar (curated by Naila exactly as today). The website reads that public calendar and displays upcoming events as beautiful, mobile-friendly cards. We change nothing about how events are added — we just present them better.

---

## 3. Tech stack (all free)

| Layer | Tool | Why / notes |
|---|---|---|
| Directory submissions | **Google Forms** | Free, unlimited responses, built-in spam protection, familiar. |
| Directory data store | **Google Sheets** | Free. Published read-only so the website can read it. Data is public by design. |
| Events input | **Existing events Google Form** | Unchanged — hosts already use it. |
| Events data store | **Existing Google Calendar** | Unchanged — curated by Naila. Must be public for the site to read it (it already is, since members view it). |
| Reading the sheet | Sheets "Publish to web" (CSV) or the gviz JSON endpoint | No API key needed for a public sheet. ~5-min cache (fine). |
| Reading the calendar | **Google Calendar API v3** (`events.list` with an API key) | Free, ~1M requests/day. Works for public calendars with no login. API key is restricted to our site's domain. Supports browser (CORS) requests. |
| Events rendering | **FullCalendar.js** (open source) or a custom card list | Free. FullCalendar has a built-in Google Calendar source; or we render our own pretty "upcoming" list. |
| Website hosting | **Cloudflare Pages / Netlify / GitHub Pages** | Free static hosting; nothing to maintain server-side. |
| Automation | **Google Apps Script** | Free, runs inside the sheet. Content checks, reporter dedupe, notifications. |

**Cost ceiling:** $0. None of the hub's needs (a few hundred listings, a calendar of events, a few hundred visitors) come close to any free-tier limit.

> Note on the calendar API key: in a static site the key is visible in the page, which is normal and safe for a *public, read-only* calendar — we restrict the key to our site's domain so it can't be reused elsewhere. (Alternative if we ever want to avoid an API key entirely: read events from the events form's response sheet, the same way we read the directory. Trade-off: that wouldn't reflect Naila's manual curation, so reading the calendar is preferred.)

---

## 4. The practitioner submission form

Google Form, kept short. Fields:

1. **Your name** *(short text, required)*
2. **Practice or business name** *(short text, optional — defaults to your name)*
3. **Category** *(dropdown / checkboxes, required — see Section 5)* — allow selecting up to 2–3.
4. **Short description of what you offer** *(paragraph, required, ~300 characters)*
5. **Area / location** *(short text, required)* — e.g., "Oakville," "Toronto + online."
6. **How do you work?** *(multiple choice, required)* — In person / Online / Both.
7. **Best way to reach you** *(required — at least one of:)* WhatsApp number / Email / Website or social link.
8. **Are you a member of the community group?** *(yes/no, required)* — light trust signal.
9. **Optional: a photo or logo link** *(short text)*
10. **Optional: pricing note** *(short text)* — e.g., "sliding scale available."
11. **Community agreement** *(checkbox, required)* — "I offer this in good faith and agree to the community's spirit of respect and care."

> Keep it to one screen. Every extra field lowers completion.

---

## 5. Category taxonomy (starter set)

Designed for this community; expandable as people sign up.

- **Bodywork & Massage** — massage therapy, deep tissue, Thai, lymphatic, reflexology
- **Somatic & Movement** — somatic therapy, dance/movement, yoga, breathwork, Qigong
- **Energy Healing** — Reiki, energetic alignment, sound healing, crystal healing
- **Manual & Physical Therapies** — osteopathy, chiropractic, physiotherapy, acupuncture
- **Mental & Emotional Wellbeing** — counselling, coaching, psychotherapy, hypnotherapy
- **Ceremony & Plant Medicine** *(where legal)* — cacao ceremonies, medicine people, facilitators
- **Spiritual Guidance** — astrology, tarot, intuitive readings, shamanic practice
- **Nutrition & Herbalism** — holistic nutrition, herbalism, Ayurveda
- **Classes, Workshops & Facilitation** — workshop facilitators, retreat organisers, teachers
- **Creative & Expressive Arts** — art therapy, music, voice
- **Conscious Business & Other** — eco/ethical products, services that don't fit above

> Anat & Curtis to review and adjust; categories can grow over time (e.g., "medicine people" was specifically requested).

---

## 6. Google Sheet structure

**Tab 1 — `Listings`** (fed by the directory form; one row per practitioner):

| Column | Source | Notes |
|---|---|---|
| Timestamp | auto | submission time |
| Name | form | |
| Practice name | form | |
| Category | form | one or more |
| Description | form | |
| Area | form | |
| Mode | form | in person / online / both |
| WhatsApp | form | |
| Email | form | |
| Website/social | form | |
| Member? | form | yes/no |
| Photo link | form | optional |
| Pricing note | form | optional |
| **Status** | script/manual | `Live` (default) or `Hidden`. Website shows only `Live`. |
| **Auto-check** | script | `OK` or `Needs review` (Section 7) |
| **Distinct flags** | script | count of unique reporters |
| **Notes** | manual | steward notes |

**Tab 2 — `Reports`** (fed by the report form; one row per flag): Timestamp · Listing reported · Reporter email/WhatsApp (for dedupe) · Reason · Details.

---

## 7. Moderation & flagging logic

Model: **open posting → automated check → instant publish → community reporting → human only when needed.** No listing is ever auto-punished.

**At submission (automatic, free):** Apps Script content-checks each new listing — banned words, spam patterns (e.g., many URLs), required-field completeness. Clean rows go `Live` immediately; suspicious rows are marked `Needs review` and email the steward. (Optional stricter mode: hold `Needs review` rows as `Hidden` until a human approves — Anat's call.)

**Reporting (community as the eyes):**
- A "Report a listing" link opens the report form, which asks for the reporter's email or WhatsApp number — a field, **not** a login.
- Apps Script **counts distinct reporters per listing** (deduped by contact). One person = one flag, regardless of how many times they submit.
- **Flags never change a listing automatically.** Crossing a threshold of *distinct* reporters (suggested: **3**) emails Anat/Curtis to take a look; a human decides whether to set `Status = Hidden`.
- **No public flag count** is shown — reporting is private. Nothing to brigade, no public shaming.
- **Reporter-pattern check:** if one reporter is flagging many different listings, the script notes it — that pattern points to the reporter, whose flags can be discounted.

**Why this resists abuse:** a disgruntled person can't inflate a count (deduped) and can't trigger an automatic consequence (human decides). Honest limit: with no real accounts, nothing free is fully sybil-proof, but for a ~550-person trust-based community this is more than enough.

**Removal / edit requests:** a practitioner contacts the steward, who edits the sheet. Low volume at this scale.

---

## 8. The events layer

**Goal:** show upcoming community events in a warm, mobile-friendly format that's far easier to scan than Google Calendar on a phone — without changing how events are added.

**Input (unchanged):** Event hosts continue to use the existing events Google Form, which adds events to the community Google Calendar, curated by Naila exactly as today. No new admin work is created.

**Reading the events:** The website fetches upcoming events from the public community calendar via the **Google Calendar API** (`events.list`, single API key, `timeMin = now`, ordered by start time, limited to e.g. the next ~30–60 events). No login for viewers.

**Display:**
- Default **"Upcoming" list view** — a clean vertical feed of event cards, each showing: title, date & time, location (in person/online), short description, and a "View / RSVP" or source link if present.
- Grouping by day or week ("This week," "Next week," "Later").
- Optional **month grid view** (via FullCalendar) for those who want the traditional calendar layout.
- A clear **"Add an event" button** linking to the existing events form, so the hub also drives event submissions.

**Honesty note:** the calendar must remain public (it already is). Event detail fields shown depend on what's captured today; if hosts don't enter a location or description, those simply don't appear. We can suggest small tweaks to the events form later to enrich the cards, but it's not required for v1.

---

## 9. The website (one site, two views)

**Type:** single-page, static, mobile-first. Reads the published `Listings` sheet and the public calendar live.

**Look & feel:** clean and calm, consistent with the community's WhatsApp aesthetic — soft greens/whites, rounded cards, generous spacing, friendly type. Warm and uncluttered, not corporate.

**Top-level navigation (two tabs + a home):**

- **Home** — a short welcome line, plus a peek at both worlds: a few featured/just-added practitioners and the next handful of upcoming events, each linking into its full view.
- **Practitioners (Directory):**
  - Search bar (name, description, category) + tappable category filter chips + In person/Online/Both filter.
  - **Listing cards:** name/practice, category tag(s), description, area + mode, contact buttons ("Message on WhatsApp" via `wa.me`, Email, Website), optional photo.
  - Prominent **"➕ Add your practice"** button → directory Google Form.
  - Subtle **"Report a listing"** link → report form.
- **Events:**
  - **"Upcoming" card feed** grouped by day/week, with optional month grid view.
  - **"Add an event"** button → existing events form.

**Footer:** one line that this is a volunteer community resource + a short community-guidelines note.

**Behaviour notes:** only `Status = Live` listings display; data refreshes on page load (subject to Google's ~5-min cache and calendar API freshness); fully responsive, phone-first; no tracking, no ads, no accounts.

---

## 10. The report form (fields)

Short Google Form: (1) Which listing are you reporting? (2) Your email or WhatsApp number *(required — counts unique reports; not shown publicly)* (3) Reason *(Spam / Inappropriate / Not a real practitioner / Wrong or outdated info / Other)* (4) Anything else? *(optional)*.

---

## 11. Automation summary (Google Apps Script)

One script bound to the directory sheet, free, no server: (1) on new listing → content checks → set `Auto-check`, email steward if needed; (2) on new report → recount distinct reporters → update `Distinct flags`, email Anat/Curtis if threshold crossed; (3) optional weekly digest of new listings and pending reviews. *(Events need no automation — they flow through the existing calendar.)*

---

## 12. Operating model & handoff

- **Day-to-day:** runs itself. Directory listings post automatically; events flow through the existing calendar. The steward is pinged only for flagged/suspicious listings.
- **Steward role:** Bhavna initially, then a community steward (like Naila for the calendar). About a minute, only when prompted.
- **No tech dependency for operations:** listings are managed in the Google Sheet; events in the existing Google Calendar. A developer is needed only for the initial build and rare redesigns.
- **Linking from WhatsApp:** the hub is shared as a single link in the relevant channel(s), and — under Option A — pinned in a dedicated practitioner WhatsApp group alongside the "add yourself" form.

---

## 13. Build checklist (for whoever builds it)

1. Create the **directory Google Form** (Section 4) linked to a new **Google Sheet**; set up tabs/columns (Section 6).
2. Create the **report form** (Section 10) feeding a `Reports` tab.
3. Write the **Apps Script** (Section 11): content checks, reporter dedupe, threshold notifications.
4. **Publish the `Listings` sheet** (CSV) or use the gviz endpoint.
5. Confirm the **community Google Calendar is public**; get its calendar ID; create a **restricted Calendar API key**.
6. Build the **static site** (Section 9): Home, Practitioners, Events views.
   - Directory view reads the sheet (search, filters, contact buttons).
   - Events view reads the calendar via the API (upcoming card feed + optional month grid), with an "Add an event" button to the existing form.
7. Deploy to free static hosting (Cloudflare Pages / Netlify / GitHub Pages).
8. Test end-to-end: submit a listing → it appears; file 3 reports → dedupe + notification fire; confirm upcoming events render correctly from the calendar.
9. Hand over: short "how to run it" note for the steward.

---

*Open questions for Anat & Curtis: final category list; flag threshold (suggested 3 distinct reporters); whether suspicious listings publish instantly or wait for review; events default view (list vs. month grid); and whether to lightly enrich the events form fields later.*
