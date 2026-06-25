# Hearth — Design Overview

*High-level design & UX overview. Living document — update as the app evolves.*

---

## 1. Design intent

*Hearth* is the warm center of a home people gather around. The interface should feel like that word: **calm, warm, uncluttered, and effortless on a phone.** It is the antidote to the clunky Google Calendar — the whole reason a visitor prefers Hearth is that it's *nicer to use on a phone.* If the design isn't beautiful and frictionless, the product fails its one job (adoption).

**Three feelings to evoke:** *trusted* (this is our community), *calm* (healing, not corporate/Yelp), *easy* (open it and immediately get value).

---

## 2. Mobile-first, always

- Designed for a **phone screen first**; desktop is the progressive enhancement, not the reverse. Most members live on WhatsApp on their phones.
- **Thumb-friendly:** large tap targets, bottom-reachable primary actions, no hover-dependent interactions.
- **Fast & light:** minimal payload, content visible immediately, no heavy calendar widget as the default.

---

## 3. Visual system (starting point — refine with Anat & Curtis)

- **Palette:** soft greens & warm whites/creams; gentle earthy accents. Calm, natural, healing — never neon or corporate-blue. **Light-only** (no dark mode — keeps the warm community feel). Implemented as Tailwind v4 `@theme` tokens in `src/app/globals.css`:

  | Token | Hex | Use |
  |---|---|---|
  | `cream` | `#faf6ed` | page background |
  | `sand` | `#f1ead9` | chips / subtle panels |
  | `card` | `#fffdf8` | card surfaces |
  | `line` | `#e7dfce` | hairline borders |
  | `forest` | `#3f5d49` | primary green (buttons, links) |
  | `forest-deep` | `#324a3a` | hover/active |
  | `sage` | `#7c9a83` | secondary / accents |
  | `clay` | `#c08457` | warm accent (sparingly) |
  | `ink` | `#2f2a23` | primary text |
  | `muted` | `#6f675a` | secondary text |

- **Type:** **Fraunces** (warm display serif) for headings + **Nunito Sans** for body — friendly and highly legible, loaded via `next/font`.
- **Shape:** rounded cards, soft shadows, generous spacing and white space (room to breathe).
- **Type:** friendly, highly legible; comfortable line-length and size for reading on a phone.
- **Imagery:** practitioner photos and event flyers are first-class; graceful placeholders when absent (no broken-image gaps).
- **Tone of copy:** warm, human, first-person-plural ("our community"), never bureaucratic.

> **Open item:** confirm whether Anat & Curtis have existing brand colours/logo, or we design this system from scratch. (See `Product.md` open questions.)

---

## 4. Information architecture

- **Home** — warm one-line welcome + a peek at *both* worlds (next few events, featured/just-added practitioners). Orients in one glance; routes to either layer.
- **Practitioners** — search + category chips + mode filter → cards → profile page (`/p/slug`).
- **Events** — "Upcoming" feed grouped by time → cards → event detail; optional month grid.
- **Add flows** — `Add your practice`, `Add an event` (prominent), `Report a listing` (subtle).
- Two clear top-level tabs (Practitioners / Events) + Home. Nothing else competes for attention.

---

## 5. Key components

- **Practitioner card** — name/practice, category tag(s), short description, area + mode, **Community-member badge**, optional photo, contact buttons (*Message on WhatsApp* via `wa.me`, Email, Website, Instagram).
- **Practitioner profile (`/p/slug`)** — full bio, all categories, contacts, **upcoming events this person hosts** (cross-discovery payoff). A shareable, WhatsApp-droppable URL.
- **Event card** — title, date & time, in-person/online + location, short description, cost note ("PWYC"/price), flyer, **View / Register** button.
- **Event feed grouping** — *This week / Next week / Later* headers; an optional month-grid toggle for traditionalists.
- **Filter chips** — tappable categories; In person / Online / Both; date range. Search bar over name/practice/description/keywords.
- **Forms** — single-screen where possible (required fields minimal), clear optional sections, friendly validation, a warm "thanks — you're live!" confirmation.
- **Empty/placeholder states** — calm, encouraging copy (e.g. "No events next week yet — check back, or add one"), never a blank void.

---

## 6. Interaction principles

- **Instant gratification on submit** — clean submissions appear live immediately; the confirmation says so.
- **Tap to contact, don't gatekeep** — contact is one tap (`wa.me`/`mailto:`), no login wall.
- **Quiet moderation** — reporting is a small, calm link; no scary "FLAG" buttons, no public counts.
- **Responsive feedback** — loading skeletons over spinners; optimistic, gentle transitions.
- **Accessibility** — sufficient contrast on the soft palette, semantic markup, keyboard-navigable, alt text on images, respects reduced-motion.

---

## 7. What to avoid

- ❌ Corporate/SaaS dashboard vibes; ❌ Yelp-style star ratings & review walls (clashes with trust-bound ethos); ❌ dense data tables on the public site; ❌ ads, tracking, pop-ups, cookie-consent clutter; ❌ a default month-grid calendar (the very thing we're improving on); ❌ anything that makes a phone user pinch-zoom.

---

## 8. Admin panel design

Function over polish, but still calm and clear: simple lists with status badges, a moderation queue, a reports inbox with distinct-reporter counts, and straightforward category management. Optimized for "one steward, one minute, when pinged."
