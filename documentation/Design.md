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

- **Direction: "rich & sacred."** Warm parchment base, deep emerald + plum **jewel tones**, **antique gold** accents, and dramatic deep **"night"** surfaces for the hero/header/footer. Elevated and ceremonial, but still light and readable on a phone. Light-only (no dark mode). Tailwind v4 `@theme` tokens in `src/app/globals.css`:

  | Token | Hex | Use |
  |---|---|---|
  | `parchment` | `#f3e9d2` | page background |
  | `card` | `#fdf8ee` | card / list surfaces |
  | `sand` | `#ece0c6` | subtle panels / chips |
  | `line` | `#e4d8bd` | hairline borders |
  | `cream` | `#f4ead6` | light text/elements on dark |
  | `night` / `night-2` | `#14342b` / `#102a23` | deep hero / header / footer |
  | `forest` / `forest-deep` | `#1f5547` / `#143a30` | primary jewel emerald |
  | `plum` | `#6d3557` | secondary jewel accent |
  | `gold` / `gold-soft` | `#c6a24a` / `#dcc187` | antique gold accents |
  | `sage` | `#7f9b8e` | soft accent |
  | `clay` | `#b4603f` | gentle error/warn |
  | `ink` / `muted` | `#2a211b` / `#6e6253` | text |

  Gold is used sparingly — eyebrows, the flame mark, thin `.gold-rule` dividers, active states, "view all" links, and the member mark. A **crafted SVG flame** wordmark (`src/components/logo.tsx`) replaces the emoji — a gold-gradient flame with a brighter inner ember and a soft glow (`drop-shadow`) so it pops on the deep night header.

- **Type:** **Fraunces** (warm display serif) for headings + **Nunito Sans** for body — loaded via `next/font`.

### Mobile patterns (the heart of the redesign)

Phone-first, inspired by apps that do this well (Luma for events). The goals: **less text, fewer pills, more scannable content.**

- **Events = a date-led agenda, not tiles.** Single column, grouped under slim gold uppercase labels (This week / Next week / Later). Each event is a compact **row**: a left date badge (gold month · big day · weekday), the title, and **one** clean meta line (`time · place · cost`), with a gold ›‑chevron when it links out. Far easier to read than two-column tiles.
- **Directory = compact rows, not pill-heavy cards.** Avatar (photo or gold-ringed initial), name + a small gold `✦ member` mark, a one-line description, and **one** meta line (single primary category · area · mode). Contact actions are small (a primary "Message", then slim Email/Website/Instagram).
- **Filters = one slim, horizontally-scrolling strip** (`FilterChips`), not a wrapping wall of pills. Categories scroll in a single line; mode is a second slim line.
- **Lists, not grids.** Rows live in a single rounded `bg-card` container with `divide-y` separators — calm and uniform.
- **Restrained copy.** The hero is one deep panel with a short line; section intros are a single short sentence. Content, not prose, fills the screen.
- **"Near me"** is a slim control (a 📍 button + a "type a place" box) above the list. When active, each row shows a forest-green distance chip, the list sorts nearest-first, radius chips appear, and events get a "Directions" link — distance never adds clutter when it's off.
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

- **Practitioner card** — name/practice, category tag(s), short description, area + mode, **Community-member badge**, optional photo, contact buttons (*Message on WhatsApp* via `wa.me`, Email, Website, Instagram), and a subtle right-aligned **Report** link (matching the event card, so a listing can be flagged straight from the list — not only from its profile).
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
- ❌ **Walls of pills** — wrapping rows of category/filter chips that eat the screen. Use one slim horizontal-scroll strip, and show at most one category per row.
- ❌ **Heavy tiles / multi-column card grids** on the public lists — they read poorly on a phone. Use single-column agenda/list rows.
- ❌ **Text-heavy hero/intros** — keep copy to a line; let the content fill the screen.
- ❌ **Raw HTML/links shown as text** — imported descriptions are stripped to clean text (the registration URL becomes the row's link/chevron, never visible markup).

---

## 8. Admin panel design

Function over polish, but still calm and clear: simple lists with status badges, a moderation queue, a reports inbox with distinct-reporter counts, and straightforward category management. Optimized for "one steward, one minute, when pinged."
