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

> **DECIDED (2026-07-10, live since Build 73): "Clementine & Juniper" (finalist F6) with the heart-flame mark (L2).** The two-tone rule: **juniper carries** (buttons, links, ink, the deep stage) and **clementine sparks** (the mark, member ✦, eyebrows) — clementine never paints a big surface. Two stage pairs: `night` = the light peach stage (header, hero, profile band), `night-deep` = juniper (footer, recruitment banner, admin bar). **AODA/WCAG-AA:** all text pairings ≥4.5:1 (pure clementine `#ef6c33` is 3.1:1 and therefore reserved for the mark/large graphics; text accents use burnt clementine `--color-gold #b54e1e`, 5.2:1); global `:focus-visible` outline, a skip-link, chip inputs with visible focus rings, `prefers-reduced-motion` respected. Active tokens live in `globals.css`; the exploration pages (`/palette-explorations.html`, `/brand-preview.html`) are historical and removable.
>
> **The palette system (how reskins work):** every colour in the app is a **role token** in `src/app/globals.css` (`@theme`) — components never hardcode hexes. The file holds one **ACTIVE PALETTE** block plus a **library** of full value-sets (the original "rich & sacred" is preserved there); switching skins = swapping the block. Two semantic tokens make palettes with *light* stage surfaces possible: **`on-night`** (text on the header/hero/footer "stage") and **`on-gold`** (text on gold fills) — components use those instead of assuming night is dark. The logo flame reads its gradient/glow from `flame-*` tokens. Known static exception: the favicon (`src/app/icon.svg`) keeps the old night/gold tile until a palette is final.

- **Original direction: "rich & sacred."** Warm parchment base, deep emerald + plum **jewel tones**, **antique gold** accents, and dramatic deep **"night"** surfaces for the hero/header/footer. Elevated and ceremonial, but still light and readable on a phone. Light-only (no dark mode). Its full value-set lives in the `globals.css` palette library. Historical token table (rich & sacred values):

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

  *(Historical — superseded by Clementine & Juniper above.)* **The mark (since Build 73): the heart-flame** — a heart holding a flame-shaped cutout (`src/components/logo.tsx`, clementine gradient via the `flame-*` tokens, soft glow). The identity lives in that cutout: **never simplify it to a plain heart.** The favicon (`src/app/icon.svg`) is the heart-flame in peach on a rounded juniper tile, readable on light and dark browser chrome. `.gold-rule` dividers, eyebrows, links, and the member ✦ use burnt clementine (`gold`).

- **Type:** **Fraunces** (warm display serif) for headings + **Nunito Sans** for body — loaded via `next/font`.

### Mobile patterns (the heart of the redesign)

Phone-first, inspired by apps that do this well (Luma for events). The goals: **less text, fewer pills, more scannable content.**

- **Events = a date-led agenda, not tiles.** Single column, grouped under slim gold uppercase labels (This week / Next week / Later). Each event is a compact **row**: a left date badge (gold month · big day · weekday), the title, and **one** clean meta line (`time · place · cost`), with a gold ›‑chevron when it links out. Far easier to read than two-column tiles.
- **Directory = compact rows, not pill-heavy cards.** Avatar (photo or gold-ringed initial), name + a small gold `✦ member` mark, a one-line description, and **one** meta line (single primary category · area · mode). Contact actions are small (a primary "Message", then slim Email/Website/Instagram).
- **The directory is task-first**, patterned on the best consumer search apps (Airbnb/Maps): a slim **"Find a practitioner"** header (with a demoted "＋ Add yours" outline pill), then a **command bar** — one search pill (task-oriented placeholder, 🔍 as the submit) with a round **📍 icon button** beside it — then the **category rail**: a single scrolling line of **icon + short label** items (`CategoryRail`, active = forest underline; far more scannable than identical text pills), wrapped in a client **`ScrollRail`** that shows an **edge fade + a round chevron button** on whichever side hides more content (July 6 feedback: testers assumed the visible categories were all there were). Seeded categories get hand-picked icons (`CATEGORY_META`); admin-added ones get an icon **matched from the words in their name** (`KEYWORD_ICONS`), so a new category never renders the bare `✻`. The **mode** filter tucks into a slim collapsible **"Filters"** disclosure (auto-opens if active). Results begin within ~3 slim rows. Filtering is still pure links, server-rendered — the only client JS is the scroll affordance; never a wrapping wall of pills.
- **Recruitment moment** — after the list, a deep night-gradient banner ("Are you a practitioner?" → *Add your practice*) invites practitioners in **after** they've seen the community, instead of a loud button competing with search at the top. Empty states offer recovery: "Clear search & filters" when filtering, "Be the first — add your practice" when the directory is empty.
- **Lists, not grids.** Rows live in a single rounded `bg-card` container with `divide-y` separators — calm and uniform.
- **Restrained copy.** The hero is one deep panel with a short line; section intros are a single short sentence. Content, not prose, fills the screen.
- **"Near me"** is a compact **📍 pill** in the search row (with a reveal-on-demand "type a place" fallback). When active it becomes a slim pill with an **inline radius dropdown** + a clear ✕; each row shows a forest-green distance chip and the list sorts nearest-first (events also get a "Directions" link) — distance never adds clutter when it's off.
- **Shape:** rounded cards, soft shadows, generous spacing and white space (room to breathe).
- **Type:** friendly, highly legible; comfortable line-length and size for reading on a phone.
- **Imagery:** practitioner photos and event flyers are first-class; graceful placeholders when absent (no broken-image gaps).
- **Tone of copy:** warm, human, first-person-plural, never bureaucratic. **No em dashes (—) in UI copy** (Bhavna's rule, Build 38): use a period, comma, or colon instead; page titles join with "·". **Vocabulary (Build 57):** the thing a practitioner owns is their **practice** ("Add your practice", "My practice", one per account); its public page is their **profile** (`/p/slug`); **"listing" is steward/admin language only** (the admin panel manages many, so the plural-flavoured word is accurate there). Don't mix the three. **Say each thing once:** "community" earns its place in the headline — don't echo it in the eyebrow, subline, and footer too. Don't over-reassure ("free, no account, no cost" repeated everywhere reads as selling); state a practical fact at most once where it matters ("takes about two minutes"). Every line must carry information or warmth — a line that does neither ("Search, discover, and connect…") gets cut.

> **Open item:** confirm whether Anat & Curtis have existing brand colours/logo, or we design this system from scratch. (See `Product.md` open questions.)

---

## 4. Information architecture

- **Home** — **orientation only** (July 6 call, Build 39). The hero keeps its full ceremonial scale (big display headline, gold rule, the one warm sentence, generous breathing room) and offers exactly **two doors in**: a gold **"Find a practitioner"** button and an outline **"＋ Add your practice"** button (plus a quiet events link when that layer is on). The in-hero search, the category rail, and the directory peek moved to `/practitioners` — Anat's feedback: showing them on the first screen split attention ("do I look at practitioners? categories? add myself?") before a visitor knew where they were. The Build 35 lesson still holds: the heartiness lives in **scale, breath, the human sentence, and gold** — trimming those makes the page feel transactional.
- **Practitioners** — search + category chips + mode filter → cards → profile page (`/p/slug`).
- **Events** — "Upcoming" feed grouped by time → cards → event detail; optional month grid.
- **Add flows** — `Add your practice`, `Add an event` (prominent), `Report a listing` (subtle).
- Two clear top-level tabs (Practitioners / Events) + Home. Nothing else competes for attention.

---

## 5. Key components

- **Practitioner card** — name/practice, category tag(s), short description, area + mode, **Community-member badge**, optional photo, contact buttons (*Message on WhatsApp* via `wa.me`, Email, Website, Instagram), and a subtle right-aligned **Report** link. **The whole tile is tappable** (Build 74): a stretched-link `::after` on the name covers the card (with a soft hover wash), while the contact buttons + Report stay their own targets — one keyboard tab stop, no nested links.
- **Practitioner profile (`/p/slug`)** — a **header card** (gradient "night" banner + large rounded avatar/photo) with name, `✦ member` + `✓ taking new clients` signals, category chips, and — critically — **the primary contact button + Share right in the header** (the top screen answers *who is this* and *how do I reach them*; no scrolling for the main action). Below: an **About** block, **Specialties** chips (from `keywords`), a **"Where & how"** card (Build 58 — labelled rows for Location with a **Get directions** link to Google Maps via area-level coords, Sessions mode, Languages, Pricing; replaced the old jumbled `area · mode · languages · pricing` one-liner), the **"What I offer"** services menu, a full **"Get in touch"** card, and **upcoming events this person hosts** (hidden while the events pilot is off). Long pasted URLs in user text `break-words` so they can't overflow the phone edge, and are rendered as **tappable links** at display time (`Linkify`, Build 64 — description, bio, service blurbs; no HTML injection, `nofollow` on user content; directory cards keep plain text since they're clamped one-liners for scanning). Designed to grow into a profile-as-mini-site.
- **Share button (`ShareButton`)** — opens the phone's native share sheet (Web Share API) or copies the link with a calm "Link copied!" confirmation. Also shown on the "you're live" screen so a practitioner can grab their own `/p/…` link.
- **Owner "manage" page (`/manage/<token>`)** — a private, no-login edit page (secret capability link) where a practitioner tends their mini-site: all profile fields, an **avatar upload** (`AvatarUploader`, compressed on-device), a **"what I offer" services menu** (`ServicesEditor`), and an "accepting new clients" toggle. The profile renders these as a **"What I offer"** list + an accepting-clients line.
- **Event card** — title, date & time, in-person/online + location, short description, cost note ("PWYC"/price), flyer, **View / Register** button.
- **Event feed grouping** — *This week / Next week / Later* headers; an optional month-grid toggle for traditionalists.
- **Filter chips** — tappable categories; In person / Online / Both; date range. Search bar over name/practice/description/keywords.
- **Forms** — single-screen where possible (required fields minimal), clear optional sections, friendly validation, a warm "thanks — you're live!" confirmation. The **photo upload is a tap-to-upload avatar centered at the top** (the classic profile-creation position), with Name + Practice full-width below — not buried mid-form. Long forms are broken into **chapters with slim gold uppercase section labels** ("What you offer" / "Where & how you work" / "Ways to reach you" / "The details"), and **categories are selectable chips** (tap to toggle, forest fill when chosen) instead of a tall checkbox grid — the add/manage forms read as a handful of small steps, not a wall. Each chip carries an explicit selection marker so state is never ambiguous: an unselected chip shows a muted **`＋`** ("tap to add"), a selected one shows a **`✓`** plus the fill (Build 42) — colour alone was doing too much work, and a filled pill could read as a button rather than a choice. (The chip is still a real `<input type="checkbox">`, hidden and used as a `peer`; the marker reflects its `:checked` state.)
- **Account surfaces** — the header's quiet corner: "Sign in" (carrying the current page as `next`) ↔ an avatar with a **menu panel** (identity header + plain hover rows: My practice / My recommendations / Sign out — a controlled popover that closes on selection/outside-click/Escape; no `<details>`, no pill buttons, no emoji glyphs). **`/my-practice` is tabbed** — *Edit practice* | *Recommendations* (gold count pip when approvals wait) — so a long list of kind words never buries the editor. Profiles carry a **"Kind words"** card + a quiet ♡ Recommend button (the sign-in gateway).
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

Function over polish, but still calm and clear: simple lists with status badges, a moderation queue, a reports inbox with distinct-reporter counts (each card shows the target's status badge, and acting on a report — "Hide listing" — resolves it so the card clears, which is the steward's feedback that it worked), a feedback board, and straightforward category management. The **nav highlights the active tab** (`AdminNav`) so a steward always knows where they are. Optimized for "one steward, one minute, when pinged."
