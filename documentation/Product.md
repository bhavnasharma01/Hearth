# Hearth — Product Overview

*High-level product overview. Living document — update as the product evolves.*

> **Source material:** assimilated from `planning-archive/Hearth - Value Proposition (North Star).md`, `planning-archive/Hearth - Product Brief.md`, `planning-archive/Directory - Detailed Implementation Spec.md`, `planning-archive/*Proposal*`, and `planning-archive/anat-message.md`. Those originals are preserved for provenance; **this file is the living source of truth.**

---

## 1. The North Star (never lose this)

Our community's trusted knowledge — *who the good practitioners are, and what's happening* — keeps evaporating, because it only lives in WhatsApp (which forgets) and a clunky calendar (which nobody reads on a phone).

> **Hearth is the lasting, searchable home for the practitioners and events that *our* community vouches for.**

That knowledge has two defining properties:
- **Ephemeral** — a great recommendation scrolls away in a day; an event vanishes once the message is buried.
- **Trust-bound** — the value *is* that someone in our circle vouched for them. Strip the trust and it's just a name.

**The moat is not software — it's the trusted membership and the curation.** A better-built generic directory (Heallist, SoulSearch, etc.) can't replicate "vetted by our community." Luma owns events; WhatsApp owns the live moment; **nobody owns "the lasting, searchable directory our community trusts."** That gap is Hearth's entire reason to exist.

**The honest caveat:** the directory problem is *real but not acute* — WhatsApp "works well enough" and people need a practitioner only occasionally. So **adoption is the whole game.** Every decision is measured against one test:

> *Does this make Hearth lower-friction and more trusted, or just bigger? Are we strengthening the trusted home — or rebuilding what Luma/WhatsApp already do?*

---

## 2. What Hearth is

A free, **phone-first** community website with two layers in one home:

1. **Practitioner Directory** *(the defensible core)* — a searchable directory of healers, therapists, facilitators, and conscious businesses our community vouches for.
2. **Events** *(the warm, high-frequency front door)* — a beautiful, scannable view of upcoming conscious events, far easier on a phone than Google Calendar.

The two are **linked**: an event can reference its host practitioner, and a practitioner profile shows the events they host — so people who come for one discover the other.

---

## 3. Operating principles

- **Free & open to all** — no paywall; the public never logs in to browse or submit.
- **Login gates contributing, never consuming** *(evolved July 8 2026, accounts Phase A)* — browsing, searching, and contacting never need an account; sign-in (Google) exists so practitioners can own and manage their listing (and, later, request testimonials). Reporting stays accountless.
- **Two layers, one home** — directory and events cross-reference each other.
- **Open posting, community-policed** — anyone posts instantly; the community quietly flags problems; a human acts only when needed.
- **Mobile-first** — most members live on WhatsApp on their phones.
- **Low-maintenance to operate** — a non-technical steward runs day-to-day via the admin panel; a developer is needed only for builds/redesigns.

---

## 4. Personas

- **The Seeker** — needs "a good osteopath / breathwork facilitator" occasionally; searches/filters and taps to contact someone trusted.
- **The Browser** — opens Hearth to see "what's happening this week"; events are the habit-forming hook, directory is the discovery.
- **The Practitioner** — signs in (Google or email), adds themselves in ~2 minutes, gets a shareable `/p/slug` profile to post in WhatsApp, and edits (or deletes) it anytime from **"My listing"** — no link to remember. **One listing per account** (Build 56): the listing is the person's page; more offerings go inside it (categories, services, keywords), and stewards handle the rare genuine second practice on request. Pre-account listings still work via their private `/manage/<token>` link, which doubles as a claim path. Future events will attach to the same account (an event is a separate object linked via `host_practitioner_id`, not a second listing).
- **The Host** — adds an event in ~2 minutes; if a listed practitioner, the event links to their profile.
- **The Steward / Admin** (Bhavna initially; Anat & Curtis) — manages categories, reviews the small suspicious fraction, acts on flags. ~1 minute, only when pinged.

---

## 5. Core experience

**Home** — orientation only (July 6 call, Build 39): the warm hero says what Hearth is, then two doors in — **Find a practitioner** and **＋ Add your practice** (plus a quiet events link when that layer is on). Search, categories, and content previews live on the tabs themselves, so the first screen never competes for attention. Two tabs: **Practitioners** and **Events**.

**Events tab** — default "Upcoming" card feed grouped *This week / Next week / Later*; cards show title, date/time, in-person/online + location, short description, cost note (e.g. "PWYC"), flyer, and a **View / Register** button. Search + filter by category/type, mode, date. Optional month-grid view. Prominent **➕ Add an event**.

**Practitioners tab** — search (name/practice/description/keywords) + category chips + In person/Online/Both filter. Cards: name/practice, category tags, description, area + mode, **Community-member badge**, photo, and contact buttons (*Message on WhatsApp* via `wa.me`, Email, Website, Instagram). Each card opens a **profile page** (`/p/slug`) with full bio, categories, contacts, a Where & how card (location + map + directions), services, **"Kind words"** (approved recommendations + the ♡ Recommend gateway), and **upcoming events this person hosts**. Prominent **➕ Add your practice**; subtle **Report a listing**.

---

## 6. Trust & social-proof model (v1)

- **Community-member badge** — the "one of us" signal (`is_member`).
- **Testimonials ("Kind words"), shipped Build 60:** a signed-in member writes a recommendation from a practitioner's profile, and it appears **only after the practitioner approves it** — visitor-initiated, **owner-curated, positive-by-construction**. No ratings, no reply threads, no links (content-checked), one per member per practitioner, and you can't recommend yourself. This deliberately is NOT open reviews: the practitioner curates their own page, so the Yelp dynamic (public complaints, star anxiety) can't take hold; concerns still go through the private **report** flow.
- Trust = curation + member badge + approved kind words + quiet flagging.

---

## 7. Forms (what we ask)

### Practitioner "add yourself" form
*(Since accounts Phase B: reached after sign-in — the listing binds to the account, so it's editable from "My practice" forever, one per account.)*
**Required (one screen):** Name · Category (one or more) · Short description (~300 chars) · **Area/location** (type-ahead autocomplete that pins coordinates so the listing reliably appears in "near me"; as specific as a street address or as general as a city, whatever the practitioner is comfortable sharing; the profile map stays neighbourhood-zoom either way) · Mode (in person/online/both) · At least one contact (WhatsApp/Email/Website/Instagram) · Community agreement.
**Optional enrichment:** Practice/business name · Longer bio · Photo/logo · Instagram · Website/booking link · Pricing note · Languages spoken · Keywords/offerings (search) · "Are you a community member?" (→ badge).
*Deliberately not asked in v1:* credential/certification gating (trust-based, not certificate-based).

### Event "add an event" form
**Required:** Title · Start date/time · Category/type · Mode + location · Community agreement.
**Optional:** End date/time · Description · Cost note · Registration/ticket link · Flyer · Host name *or* "I'm a Hearth practitioner" (link profile) · Recurring (RRULE) · Contact for questions.

**Our form is a superset of today's form** (`Add an Event to the Conscious Events TO Calendar`, [form link](https://forms.gle/fzgQ7s43udWcFaSr6)), so importing existing events loses nothing and Hearth-native submissions are richer:

| Today's Google Form field | Hearth field | Notes |
|---|---|---|
| Event name *(req)* | `title` *(req)* | direct |
| Event registration link *(req)* | `registration_link` | we make it optional (not every event has one) |
| Event start date *(req)* + time *(opt)* | `start_at` *(req)* | combined into one timestamp |
| Event end date *(req)* + time *(opt)* | `end_at` *(opt)* | |
| *(recurring → "contact an admin")* | `recurrence_rule` (RRULE) | **eliminates the manual workaround** — host sets it themselves |
| *(none)* | description, category/type, mode + location, cost_note, image, host link | **new enrichment** Hearth adds |

> The current form's own framing — *"events that support healing, connection, and growth"* — is the community-agreement spirit we carry into Hearth's agreement checkbox.

---

## 8. Category taxonomy (seeded, admin-extendable)

Stored as a **table**, not hardcoded, so admins add categories without a developer. v1 seed (11):
Bodywork & Massage · Somatic & Movement · Energy Healing · Manual & Physical Therapies · Mental & Emotional Wellbeing · Ceremony & Plant Medicine · Spiritual Guidance · Nutrition & Herbalism · Classes, Workshops & Facilitation · Creative & Expressive Arts · Conscious Business & Other.
A practitioner may hold as many categories as apply — the old 3-cap was removed in Build 39 (July 6 call decision: the form let testers tick more than 3, then blocked the submit).

---

## 9. Moderation philosophy (product view)

**Open posting → auto-check → instant publish → community reporting → human only when needed.** No listing is ever auto-punished. Clean submissions publish instantly; the small suspicious fraction is held and the admin is notified. Reporting is no-login (contact field for de-duplication, not an account). **3 distinct reporters** → notify a human, who decides. No public flag counts. *(Security/abuse detail in `Security.md`.)*

---

## 10. Scope staging

- **v1 — two layers, one home** *(current build):* Directory (add/browse/search/filter/profile/contact/member badge) · Events (native add/upcoming feed/filters/month view/seeded import) · moderation (auto-check + reporting) · admin panel · category management.
  - **Pilot note (Build 60) — accounts Phase C: testimonials.** "Kind words" on profiles: member-written from the profile's ♡ Recommend button (which doubles as the sign-in gateway), practitioner-approved from **My practice**, tracked by authors under **My recommendations** (avatar menu). Model detail in §6. Also: profiles gained an embedded neighbourhood map + Get-directions (Build 58–60).
  - **Pilot note (Build 47) — accounts Phase B.** Practitioners now *own* their listing: **"My listing"** (header menu) edits it with no link to remember; **claiming** connects the ~6 pre-account listings (matched by sign-in email, or via the manage link while signed in); owners can **delete their own listing** (the last July 6 call item); and **"Add your practice" asks for sign-in first** — the just-in-time login moment. Manage links stay valid as the bridge.
  - **Pilot note (Build 46) — accounts Phase A.** The July 6 call surfaced that lost manage-links create real friction (Josh, Greg, Angela) and that the trust features we want (testimonials) need identity. Decisions: **Google-only sign-in for the pilot** (email/password waits for a verified domain), **claim-by-signing-in** for pre-account listings (Phase B), **solicited positive-only testimonials** (Phase C; §6 unchanged). Phase A ships `/signin`, the header account control, and owner-binding on signed-in submissions. The "no login" principle is deliberately *evolved, not abandoned*: consuming stays open; contributing authenticates.
  - **Pilot note (Build 14):** we're launching the **directory first** — the Events layer is fully built but **hidden behind the `EVENTS_ENABLED` flag** while we validate adoption of the defensible core with the community. This keeps the pilot focused ("strengthen the trusted home, don't just make it bigger") and events switch back on with one flag when we're ready. Reporting now covers **practitioners** end-to-end (link on every card + profile), and stewards get an **email** when a listing is held for review or crosses the 3-reporter flag threshold.
  - **Pilot note (Build 18):** entering **user testing** — a small group of practitioners add their practice and try Hearth. To capture what they find, there's a private **feedback form** at an unlisted `/feedback` link (gated by `FEEDBACK_ENABLED`, never in the public nav, 404s once flipped off at launch). Feedback lands in the database and on a steward **status board** (`/admin/feedback`: New → Looking into it → Planned → Done / Declined, with priority + notes) — this is where we prioritize what to build next. Deliberately **not** a public feature.
  - **Pilot note (Build 25) — mini-sites Phase 1c (Phase 1 complete):** a **"what I offer"** services menu (title · optional blurb · price note) editable on the manage page and shown on the profile; keyword tags relabelled **"Specialties."** The mini-site core is now in place — editable listings, avatar, services, "accepting clients." **Next is Phase 2: solicited testimonials** (positive, practitioner-requested — still *not* open reviews; see §6).
  - **Pilot note (Build 24) — profiles as mini-sites, Phase 1b:** real **photo uploads** (avatar) on the add + manage forms — compressed on-device and stored in Supabase Storage (replacing the paste-a-link stopgap). Kept intentionally to a single avatar (warmth per KB; ~$0), gallery deferred until there's demand. **Next:** a **services menu** (1c), then Phase 2 **testimonials**.
  - **Pilot note (Build 23) — profiles as mini-sites, Phase 1a:** listings are now **editable without an account** via a private "manage your listing" link (`/manage/<token>`, shown on the success screen) — the foundation that lets practitioners *tend* their page over time. Added an **"accepting new clients"** toggle. This is a deliberate v1 evolution: we keep "no public login," but a **secret capability link** gives owners self-edit now (cleanly upgrades to real `owner_user_id` accounts in v2). **Next:** a compressed **avatar upload** (1b) and a **services menu** (1c) — with the same link later powering **testimonial requests** (Phase 2). *(Reviews stay out; testimonials will be solicited + positive — see §6.)*
  - **Pilot note (Build 15):** richer, more shareable practitioner profiles — a header card, an Offerings row, a "Get in touch" card, a **Share/copy-link** button, and a **photo/logo** field on the add form. Public copy was also made **more honest**: we dropped "our community *trusts / vouches for*" (anyone can post in the open directory, so it over-claimed vetting) — the `✦ member` badge stays the real trust signal. **Next up:** profiles as mini-websites — real photo **uploads** (Supabase Storage), a small **gallery**, and a fuller profile redesign.
- **v2 — accounts & richer trust: ✅ shipped early, during the v1 pilot (July 2026, Builds 46–63):** member sign-in (Google + email/password) · practitioner claim & self-edit/delete (`owner_user_id`, "My practice") · testimonials (practitioner-approved "Kind words") · notification emails. What remains v2-flavoured: flipping events back on.
- **v3 — registrations & education:** off-platform-payment RSVP/registrations (cash/e-transfer + uploaded proof; lean on Luma for real ticketing) · education/blog ("What is Kundalini yoga?" + curated resources).

---

## 11. Open product questions

1. Confirm **v1 = Directory + Events together** (implied by choosing native events).
2. Event taxonomy — reuse practitioner categories as event types, or a small dedicated list?
3. ~~Seed import~~ **Done (Build 5):** imported from the public iCal feed of "Conscious Events TO Calendar" (no API key), 2026-01-01 forward — 553 events (229 upcoming).
4. ~~Brand/palette~~ **✓ RESOLVED (Builds 73–84):** the full identity shipped — **Clementine & Juniper** palette, the **heart-flame** mark, **Zilla Slab + Source Sans 3** type, branded emails, favicon. Chosen deliberately against the other "Hearth" app's look (warm flame mark, Fraunces type) after finding hearthapp.ca; the name itself stays (common word; the mark and look differentiate).
5. Initial admins — add Anat + Curtis to `ADMIN_EMAILS` (and optionally `NOTIFY_EMAILS`) when ready.
6. ~~Endorsements~~ **Resolved (Build 60):** testimonials — member-written, practitioner-approved, positive-by-construction (§6).
7. **Retreats — parked (July 6 call).** A real community need (people host retreats in Ontario and abroad) with no good home yet. Decided **against** a practitioner-directory category: a directory row can't carry dates, and seekers don't look for retreats in a directory (Anat's end-user argument). Likely home is the events layer when it returns; a WhatsApp retreats-only channel is the stopgap. Revisit when `EVENTS_ENABLED` flips back on.
