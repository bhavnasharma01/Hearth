# Hearth — Database Schema (v1 design)

*A future-ready relational schema for Hearth. Designed for Postgres (Supabase), the recommended backend. The v1 product only needs a few of these tables live; the rest are modelled now so the database can grow into the fuller vision — practitioners self-adding, events submitted through Hearth, registrations/tickets — without a painful migration later.*

**Companion file:** `Hearth - Database Schema.mermaid` (the ER diagram).

---

## Design principles baked into this schema

- **Two layers, one home.** Practitioners and events are linked (`events.host_practitioner_id`), so an event run by someone in the directory surfaces the practitioner, and vice versa. This is the "discover one through the other" value, enforced in the data model.
- **Provenance everywhere.** Every practitioner and event carries a `source` field (`hearth_form`, `google_calendar`, `whatsapp`, `manual`). This is what lets Hearth *coexist with and gradually replace* the existing Google pipeline — we can import from Nayla's calendar, tag it, and dedupe via `external_id`.
- **Moderation, not gatekeeping.** Mirrors the spec's model: open posting → auto-check → instant publish → community reporting → human decides. Captured via `status`, `auto_check`, and the `reports` table with reporter de-duplication.
- **No-login first, accounts later.** Submitting and reporting never require an account (`reporter_contact`, `attendee_email` are plain fields). The `users` table and the `owner_user_id` / `submitted_by_user_id` foreign keys are nullable, so the account layer can switch on later without reworking anything.
- **Search-native.** Practitioners and events carry a `search_vector` (Postgres full-text), so search/filter is a database feature, not a hack.

---

## Tables

### `users` — accounts (future member layer)

Nullable everywhere it's referenced, so v1 can ship with zero accounts. With Supabase this pairs with the managed `auth.users`; this is effectively the profile table.

| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| email | text, unique | |
| display_name | text | |
| phone | text | WhatsApp number, optional |
| role | enum | `member` / `practitioner` / `steward` / `admin` |
| avatar_url | text | |
| created_at | timestamptz | default now() |

### `practitioners` — the directory (the core, unique value)

| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| owner_user_id | uuid FK → users | nullable; set when a practitioner claims/edits their own listing |
| name | text, required | person's name |
| practice_name | text | optional; defaults to name |
| slug | text, unique | for a shareable profile URL, e.g. `/p/jane-smith` |
| description | text, required | ~300 chars, "what you offer" |
| area | text | e.g. "Oakville", "Toronto + online" |
| latitude / longitude | double precision | **added Build 7** — geocoded from `area` (coarse/area-level, not a home address) for "near me" |
| geocoded_at | timestamptz | when coordinates were last set |
| mode | enum | `in_person` / `online` / `both` |
| whatsapp | text | at least one contact required (app-level rule) |
| email | text | |
| website | text | |
| instagram | text | social link |
| photo_url | text | optional photo/logo |
| pricing_note | text | e.g. "sliding scale" |
| is_member | boolean | community-member trust signal |
| status | enum | `pending` / `live` / `hidden` / `rejected`; site shows only `live` |
| auto_check | enum | `ok` / `needs_review` (set by content check) |
| flag_count | int | denormalized count of *distinct* reporters |
| featured | boolean | for the Home page peek |
| source | enum | `hearth_form` / `import` / `whatsapp` / `manual` |
| search_vector | tsvector | generated from name, practice, description, category |
| created_at / updated_at | timestamptz | |

### `categories` — taxonomy

Seeded from the spec's starter set (Bodywork & Massage, Somatic & Movement, Energy Healing, Manual & Physical Therapies, Mental & Emotional Wellbeing, Ceremony & Plant Medicine, Spiritual Guidance, Nutrition & Herbalism, Classes/Workshops & Facilitation, Creative & Expressive Arts, Conscious Business & Other). A table (not a hardcoded list) so Anat/Curtis can add categories like "medicine people" over time.

| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text, unique | |
| slug | text, unique | |
| description | text | examples of what fits |
| sort_order | int | display ordering |
| active | boolean | hide without deleting |

**Seed rows (insert at setup — starter set from the spec):**

| sort_order | name | slug |
|---|---|---|
| 1 | Bodywork & Massage | bodywork-massage |
| 2 | Somatic & Movement | somatic-movement |
| 3 | Energy Healing | energy-healing |
| 4 | Manual & Physical Therapies | manual-physical-therapies |
| 5 | Mental & Emotional Wellbeing | mental-emotional-wellbeing |
| 6 | Ceremony & Plant Medicine | ceremony-plant-medicine |
| 7 | Spiritual Guidance | spiritual-guidance |
| 8 | Nutrition & Herbalism | nutrition-herbalism |
| 9 | Classes, Workshops & Facilitation | classes-workshops-facilitation |
| 10 | Creative & Expressive Arts | creative-expressive-arts |
| 11 | Conscious Business & Other | conscious-business-other |

> Adding a category later = inserting one row here (via Supabase/Airtable's built-in table editor — no custom admin screen needed in the near term). A friendly "manage categories" UI is a v2+ nicety, not a v1 requirement.

### `practitioner_categories` — join (many-to-many)

A practitioner can hold up to ~2–3 categories.

| Field | Type | Notes |
|---|---|---|
| practitioner_id | uuid FK → practitioners | part of composite PK |
| category_id | uuid FK → categories | part of composite PK |

### `events` — the events layer

A **superset** of the current Google form (which only captures name, registration link, start, end). The extra fields are optional, so importing today's sparse events still works; Hearth-native submissions can be richer.

| Field | Type | Notes · maps to current form |
|---|---|---|
| id | uuid PK | |
| host_practitioner_id | uuid FK → practitioners | nullable; **links event to a directory practitioner** (cross-discovery) |
| submitted_by_user_id | uuid FK → users | nullable |
| recurrence_parent_id | uuid FK → events | nullable; self-ref for recurring series |
| category_id | uuid FK → categories | nullable; **added in Build 3** — events reuse the SAME taxonomy as practitioners (shared-categories decision), so the same filter chips work on both tabs and admins manage one list |
| title | text, required | = **Event name** |
| description | text | enrichment (not in current form) |
| registration_link | text | = **Event registration link** |
| start_at | timestamptz, required | = **Event start date + time** |
| end_at | timestamptz | = **Event end date + time** |
| location_text | text | enrichment |
| mode | enum | `in_person` / `online` / `both` |
| host_name | text | free-text host if not a registered practitioner |
| cost_note | text | e.g. "PWYC", "donation-based", price |
| image_url | text | event flyer/photo |
| recurrence_rule | text | iCal RRULE — replaces "ask the admin to repeat it" |
| status | enum | `pending` / `live` / `hidden` / `cancelled` |
| featured | boolean | |
| source | enum | `hearth_form` / `google_calendar` / `whatsapp` / `manual` |
| external_id | text | Google Calendar event id, for dedupe during transition |
| latitude / longitude | double precision | **added Build 7** — geocoded from `location_text` (precise) for "near me" |
| geocoded_at | timestamptz | when coordinates were last set |
| search_vector | tsvector | |
| created_at / updated_at | timestamptz | |

### `reports` — community flagging

Polymorphic via two nullable FKs (exactly one set). Reporter is identified by contact for de-duplication — a field, **not** a login.

| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| practitioner_id | uuid FK → practitioners | nullable |
| event_id | uuid FK → events | nullable |
| reporter_user_id | uuid FK → users | nullable |
| reporter_contact | text | email/WhatsApp; dedupes distinct reporters |
| reason | enum | `spam` / `inappropriate` / `not_real` / `outdated` / `other` |
| details | text | optional |
| status | enum | `open` / `reviewed` / `dismissed` / `actioned` |
| created_at | timestamptz | |

> Flag logic (app/automation layer, not the DB): count *distinct* `reporter_contact` per target; crossing a threshold of **3 distinct reporters** notifies a steward. Flags never auto-hide — a human sets `status = hidden`.

### `registrations` — RSVP / tickets (future, Luma-like)

Modelled now so the "register from within Hearth" idea has a home, but **not** needed for v1. Reflects the community's real payment behaviour: mostly cash/e-transfer with uploaded proof, card optional.

| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| event_id | uuid FK → events | |
| user_id | uuid FK → users | nullable; no-login registration allowed |
| attendee_name | text | |
| attendee_email | text | |
| status | enum | `registered` / `waitlist` / `cancelled` / `attended` |
| ticket_code | text | generated ticket / QR payload |
| payment_method | enum | `free` / `cash` / `etransfer` / `card` |
| payment_status | enum | `none` / `pending` / `confirmed` |
| proof_url | text | uploaded proof-of-payment screenshot |
| created_at | timestamptz | |

> Note: this keeps Hearth out of handling money — payment happens off-platform, attendees upload proof. If real ticketing is ever wanted, lean on Luma rather than expanding this table into a payment processor.

---

## What's needed for v1 vs. later

- **v1 (directory, the unique core):** `practitioners`, `categories`, `practitioner_categories`, `reports`. Events can keep flowing through Nayla's Google Calendar and simply be *read* by the site — so `events` need not be populated by Hearth yet.
- **v2 (accounts + Hearth-native events):** turn on `users`, populate `events` from a native form (with `source` import from the Google calendar during transition), enable practitioner self-edit via `owner_user_id`.
- **v3 (registration/tickets):** `registrations`, only if the community wants it and only in the off-platform-payment shape above.

---

## Resolved decisions (locked 2026-06-24)

1. **Categories** — separate `categories` table, pre-seeded with the 11 starter rows above. New categories are added via the backend's built-in table editor; a custom "manage categories" UI is deferred to v2+.
2. **Report flag threshold = 3.** When **3 distinct** reporters (deduped by `reporter_contact`) flag the same listing, the steward/admin is notified. Flags never auto-hide — a human sets `status = hidden`.
3. **Suspicious submissions are held for review.** A new listing that fails the auto content-check (`auto_check = needs_review`) is saved as `status = pending` (not shown publicly) **and the admin is notified immediately**. Clean submissions publish instantly (`status = live`). So only the small suspicious fraction waits; legitimate users get instant publish.
4. **Contact requirement — at least one.** Every practitioner must provide at least one of WhatsApp / email / website. Enforced app-side and with a DB constraint: `CHECK (whatsapp IS NOT NULL OR email IS NOT NULL OR website IS NOT NULL)`.
5. **Historical events — import year-to-date.** Import Google Calendar events from **2026-01-01** forward as an archive (manageable volume, clean boundary). The public site still defaults to an *upcoming* view; the history simply lives in the database. Fall back to start-of-month only if the year-to-date import proves messy.
