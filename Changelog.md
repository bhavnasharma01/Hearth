# Changelog

*All notable changes to Hearth, newest at top. Grouped by build under the current version. Build number increments each work session; version changes only on explicit instruction.*

---

## v0.1.0 — Build 41 (2026-07-08)

*Admins can now edit any listing and hand back a lost edit link, straight from the admin panel. Builds clean; lint passes.*

### Added
- **Edit a listing from the admin panel.** Each row on `/admin/listings` gets an **Edit** button that opens `/manage/<token>` — the practitioner's own full editor — so a steward can fix a typo or change a contact without asking the owner. Reuses the existing manage page + `updateListing` action (which re-runs the content check), so there's **no separate admin edit form** to maintain.
- **Copy someone's private edit link.** A **Copy edit link** button (`ShareButton`) on each row copies that listing's `/manage/<token>` URL, so when a practitioner loses their link (a recurring theme in the July 6 call), the steward can send it back instead of the owner deleting + re-adding.

### Security
- `listPractitionersAdmin` now selects the secret **`manage_token`** (service-role read). This is safe **only** because that read is rendered exclusively inside the auth-gated `/admin` area — the token is still column-revoked from `anon`/`authenticated` and never appears in a public/anon read. Documented the invariant in `Security.md` §3 and `Claude.md`.

### Docs
- `Security.md` (§3 manage-token bullet), `Architecture.md` (admin capabilities), `Claude.md` (admin panel section). `Readme.md`, `Changelog.md` → Build 41.

---

## v0.1.0 — Build 40 (2026-07-08)

*Admin "Hide" appeared not to work — diagnosed as a feedback/UX gap, not a data bug, and fixed the feedback. Builds clean; lint passes.*

### Fixed
- **Admin "Hide" gave no visible feedback on `/admin/listings`.** Reported as "Hide does nothing, Delete works." Confirmed by reproducing the exact service-role `update({ status: 'hidden' })` against the live DB — it persists correctly, and a hidden listing is already removed from the **public** directory (public reads are `status = 'live'` only). The confusion: on the admin screen a hidden row **stays** (so a steward can restore it) and only a small "LIVE → HIDDEN" label changed, whereas Delete removes the row — so Hide looked inert by comparison.
  - `/admin/listings` now shows a **coloured status badge** (live / hidden / pending / rejected), **dims** hidden/rejected rows, and adds a summary line (*"N total · N live · N hidden. Hidden listings stay here so you can restore them, but they don't show in the public directory."*).
  - `setPractitionerStatus` and `setEventStatus` now **surface DB errors** (log + throw) instead of swallowing them, so a genuine future failure can't masquerade as "the button did nothing."

### Docs
- `Bugs.md` — logged as Resolved (Build 40). `Readme.md`, `Changelog.md` → Build 40.

---

## v0.1.0 — Build 39 (2026-07-08)

*First batch of action items from the July 6 feedback call with Curtis & Anat (transcript at the repo root). Builds clean; lint passes.*

### Fixed
- **Category cap removed** (call decision). The form let testers tick more than 3 categories and then blocked the submit ("Please choose up to 3 categories") — bit Josh and others. Both `submitPractitioner` and `updateListing` now require only **at least one** category, no maximum; the form hint reads "choose all that apply". Logged in `Bugs.md` → Resolved.

### Added
- **Category rail swipe affordance** (Anat's "arrows" feedback: testers assumed the visible categories were all there were). New client `ScrollRail` wrapper (`src/components/scroll-rail.tsx`): a soft edge fade + a round ‹ › chevron button on whichever side hides more content, hidden at the ends; tapping nudges the rail by ~70% of its width. Only the affordance is client-side — the rail's links stay server-rendered (`CategoryRail` keeps its `build` function prop, which can't cross the client boundary).
- **Emoji auto-match for admin-added categories.** `KEYWORD_ICONS` in `category-rail.tsx` matches words in a category's name to an icon (e.g. "Voice Activation" → 🎤, "…Retreats" → ⛺), so new categories no longer render the neutral `✻` (now only a last resort). Seeded categories keep their hand-picked `CATEGORY_META` entries.
- **10 new palette explorations (31–40, "Earthy heart")** on `/palette-explorations.html` (root + `public/` copies in sync; page now says 40 directions in four moods). Per the call: the middle path — mid-tone headers, neither the deep night of round one nor the pale tints, in heart-and-earth colors (terracotta, rose clay, cedar, ochre, olive, sage, stone, adobe, rosewood, moss). For choosing a direction only; no live reskin yet.

### Changed
- **Home is orientation-only** (Anat's feedback: the first page confused people with categories + practitioner previews). The ceremonial hero stays at full scale, now with exactly two doors in: a gold **"Find a practitioner"** button and the outline **"＋ Add your practice"** button (plus a quiet events link when `EVENTS_ENABLED`). The in-hero search, "Browse by need" rail, and directory peek were removed — search + rail already live on `/practitioners`. Home no longer fetches data (static page; `force-dynamic` dropped).

### Docs
- `Product.md` — form says category "(one or more)"; taxonomy cap note; Home description; **new open question §11.7: retreats parked** (no directory category — likely home is the events layer when it returns; WhatsApp channel as stopgap).
- `Architecture.md` — join-table note, Home line in the app structure, §9 current-build blurb refreshed.
- `Design.md` — §3 rail bullet (ScrollRail + keyword icons), §4 Home rewritten as orientation-only.
- `Claude.md` — category conventions (no cap, keyword icons, ScrollRail/server-component constraint), `EVENTS_ENABLED` surface list.
- `Bugs.md` — category-cap bug logged as Resolved (Build 39). `Readme.md`, `Changelog.md` → Build 39.

---

## v0.1.0 — Build 38 (2026-07-02)

*Removed every em dash from user-visible copy (69 of them), per Bhavna's editorial rule. Builds clean; lint passes.*

### Changed
- Swept all UI strings, form hints, placeholders, empty states, error messages, success messages, page titles, and steward-email bodies for em dashes and replaced each with sentence-appropriate punctuation: periods for two-thought sentences, commas or colons for asides, "·" for title joins ("Add your practice · Hearth"), and "Choose a category…" style placeholders in selects.
- Examples: "Thank you — your listing was received…" → "Thank you. Your listing was received…"; "Optional — shown on your profile" → "Optional: shown on your profile"; "No practitioners are listed yet — the directory fills in…" → two sentences.
- Scope note: **code comments and the internal `.md` docs still contain em dashes** (invisible to users); happy to sweep those too on request.
- Rule recorded in `Design.md` (tone of copy): no em dashes in UI copy.

### Docs
- `Design.md`, `Readme.md`, `Changelog.md` → Build 38.

---

## v0.1.0 — Build 37 (2026-07-02)

*Copy audit — say each thing once. Builds clean; lint passes.*

### Changed — copy across the public surface
- **Home hero:** replaced the vague "Search, discover, and connect — the practitioners our community is building together" with a concrete line: *"Bodywork, breathwork, ceremony, counselling — find the right person for what you need."* Eyebrow trimmed to *"Our gathering place"* — "community" now appears **once** in the hero (the headline), not three times.
- **De-duplicated the reassurances:** "free / no account / no cost" was repeated across the directory banner, the add-practitioner page + its metadata, and the site description. Each spot now states at most one practical fact ("takes about two minutes"); openness is evident from using the thing.
- **Footer** simplified to one line — *"A volunteer-run community resource, offered in a spirit of respect, care, and mutual support."* — which also removes the lingering **"practitioners our community trusts"** over-claim the honest-copy pass (Build 15) had missed there.
- **Site meta description** tightened: *"Find healers, facilitators, and conscious businesses — a warm, phone-friendly directory."*
- **Kept deliberately:** the member-badge checkbox and the community agreement (functional meaning), and the one "(no account needed)" note on the private edit link (it carries real information — the link *is* the access).
- Recorded the editorial rule in `Design.md`: **say each thing once**; every line must carry information or warmth, or it gets cut.

### Docs
- `Design.md`, `Readme.md`, `Changelog.md` → Build 37.

---

## v0.1.0 — Build 36 (2026-07-02)

*Home fixes per feedback: category rail back above the directory peek; "Add your practice" is a visible button again. Builds clean; lint passes.*

### Changed — Home
- **"Browse by need" moved back up** — directly under the hero, above "From the directory." Having browse paths *after* the content preview was the wrong order (a Build 35 over-correction).
- **"＋ Add your practice" is a proper outline button in the hero again** (gold-bordered pill beside the quiet "Browse all →" link) — as a small text link it wasn't discoverable enough for practitioners, and recruiting them is the pilot's whole point.

### Docs
- `Design.md`, `Readme.md`, `Changelog.md` → Build 36.

---

## v0.1.0 — Build 35 (2026-07-02)

*Restore the homepage's warmth (Build 34 made it feel "industrial/transactional") while keeping the in-hero search. Builds clean; lint passes.*

### Changed — Home
- **Diagnosed the coldness:** Build 34 traded away the four warmth-carriers — headline **scale** (4xl→3xl), **breathing room** (py-14/20→10/14), the **one human sentence** (cut), and **gold** (the CTA became a utility-green icon). Restored all four: full-size headline, taller hero, the warm line back above the search, and a **gold** search button.
- **Placeholder softened:** "What are you looking for? massage, reiki, grief support…" (was the clinical "What do you need? e.g. …").
- **Category rail moved below the directory peek** — an emoji icon strip pressed against the hero was the most marketplace-feeling element; lower down it reads as gentle "more ways in" rather than a storefront aisle.
- Net: the hero is ceremonial again *and* the search stays one glance away — warmth first, utility held inside it. Lesson recorded in `Design.md`.

### Docs
- `Design.md`, `Readme.md`, `Changelog.md` → Build 35.

---

## v0.1.0 — Build 34 (2026-07-02)

*Site-wide UX sweep — every page reviewed through the Build 33 lens; the ones with real gaps redesigned. Builds clean; lint passes.*

### Changed — Home (`/`)
- **The hero is now a front door, not a billboard:** trimmed height, dropped the redundant paragraph + button wall, and put a **search pill directly in the hero** (submits to the directory — the #1 task no longer requires a page hop). Quiet links below it ("Browse all practitioners →", gold "＋ Add your practice"). A **"Browse by need" category rail** sits right under the hero. The directory peek stays.

### Changed — Profile (`/p/[slug]`)
- **The primary action moved above the fold:** the header card now carries the **primary contact button** (WhatsApp → email → website → Instagram, first available) beside a compact **Share** — who is this + how to reach them, on the first screen. The `✓ Taking new clients` signal now sits beside the `✦ member` badge in the header. The full "Get in touch" card below is unchanged.

### Changed — Add + Manage forms
- **Categories are now selectable chips** (tap to toggle, forest fill when selected) instead of an 11-row checkbox grid — roughly half the height, and consistent with the feedback form's type picker.
- **Chapter labels** (slim gold uppercase: "What you offer" · "Where & how you work" · "Ways to reach you" · "The details" · "What I offer") break the long forms into scannable sections.

### Changed — Admin
- **The nav now highlights the active tab** (new `AdminNav` client component) — a steward always knows where they are.

### Reviewed, deliberately unchanged
- `/report` and `/feedback` — already single-task, compact, and consistent (the feedback type-pills were the pattern the forms now follow). `/events` + `/add-event` — hidden behind the pilot flag; will get the same lens when events return. Deeper admin polish deferred ("function over polish" holds).

### Docs
- `Design.md` (home/profile/forms/admin patterns), `Readme.md`, `Changelog.md` → Build 34.

---

## v0.1.0 — Build 33 (2026-07-02)

*Directory redesign — task-first, patterned on the best consumer search apps. Builds clean; lint passes.*

### Changed — `/practitioners`, viewed through a designer's lens
- **Task-first header:** the page now opens with **"Find a practitioner"** (what you're here to *do*), one slim line. The subtitle is gone — the search placeholder ("What do you need? e.g. massage, reiki, grief support") carries that meaning. The big green "Add your practice" button is **demoted to a quiet "＋ Add yours" outline pill** so it stops competing with search.
- **Command bar:** one search pill (44px, soft shadow, 🔍 as the round submit inside it) + a round **📍 icon button** (new `compact` variant of `LocationControl`). Two controls, one row.
- **Category rail** (new `src/components/category-rail.tsx`): Airbnb-style **icon + short label** items on one scrolling line (💆 Massage · 🧘 Somatic · ✨ Energy…), active = forest underline. Replaces the row of identical long text pills. Slug→icon/label map for the 11 seeded categories with a safe fallback (`✻` + first words) for admin-added ones. Still pure links — filtering stays URL-driven, zero client JS.
- **Recruitment banner** after the list — a night-gradient "Are you a practitioner?" section with a gold *Add your practice* CTA: the invitation lands **after** a visitor has seen the community, using previously dead end-of-page real estate.
- **Smarter empty states:** filtering → "Clear search & filters"; truly empty → "Be the first — add your practice." Results line notes "· nearest first" when 📍 is active.
- Card polish: avatar 44→48px with the contact row re-aligned.
- **On shadcn/ui (considered, deliberately not adopted here):** the directory's filtering is intentionally server-rendered link navigation — fast on cheap phones, no hydration; shadcn/Radix would add a client dependency layer this page doesn't need, and Hearth has its own token system. Its *patterns* (icon rail, command bar, disclosure filters, recovery empty-states) are applied with zero new dependencies. Revisit shadcn for genuinely interactive surfaces (filter bottom-sheets, admin dialogs) if wanted.

### Docs
- `Design.md`, `Claude.md`, `Readme.md`, `Changelog.md` → Build 33.

---

## v0.1.0 — Build 32 (2026-07-02)

*Simplify the directory search row (Build 31 follow-up) — fewer controls, clearer. Builds clean; lint passes.*

### Changed
- The search row had four things competing (search input + a "Search" button + "Near me" + a "type a place" link). Now it's **two**: a search pill with the **🔍 as its own submit button** (no separate Search button — Enter / the icon submits), and the **📍 Near me** button. The **"type a place"** fallback now appears **only if location access is denied**, instead of always cluttering the row. The collapsible **"Filters"** (mode) — which was working well — stays as-is.

### Docs
- `Readme.md`, `Changelog.md` → Build 32.

---

## v0.1.0 — Build 31 (2026-07-02)

*Cleaner directory: the four stacked filter blocks are consolidated into one search row + a chip strip. Builds clean; lint passes.*

### Changed — directory filter bar (`/practitioners`)
- Was **four stacked blocks** (near-me, search, category chips, mode chips) pushing results down. Now:
  - **One row:** a search bar (with a 🔍 icon) + a compact **📍 Near me** button.
  - **Category chips** on a single scrolling line below.
  - **Mode** moved into a slim collapsible **"Filters"** disclosure (`<details>`, auto-opens when a mode is active) — no client JS, still URL-driven.
- **`LocationControl` rewritten to be compact:** inactive = a single "📍 Near me" pill (with a reveal-on-demand "type a place" fallback); active = a slim pill with an **inline radius dropdown** + clear ✕ (was a full box with a separate radius chip row). Also used by the (hidden) events page.
- Tidied the page subtitle (dropped the "we trust" over-claim, matching the honest-copy pass).

### Docs
- `Design.md`, `Readme.md`, `Changelog.md` → Build 31.

---

## v0.1.0 — Build 30 (2026-07-02)

*UX: settled on a larger avatar centered above the name/practice fields — the classic profile-creation look. Builds clean; lint passes.*

### Changed
- Moved the photo to a **centered "hero" avatar at the top** of the add + manage forms (enlarged to 112px), with **Name + Practice full-width below**. This is the conventional, phone-friendly profile-creation layout — no side-by-side width squeeze on a narrow screen, symmetric by nature, and gives the photo the prominence that suits a mini-site. `AvatarUploader` enlarged accordingly.

### Docs
- `Design.md`, `Readme.md`, `Changelog.md` → Build 30.

---

## v0.1.0 — Build 29 (2026-07-02)

*UX: the header photo is now vertically centered against **both** the Name and Practice fields (per feedback). Builds clean; lint passes.*

### Changed
- Put Name + Practice back together in the header's right column and **vertically centered the avatar against the pair** (`items-center`) — a balanced "photo beside name/practice" identity block, rather than Build 28's photo-beside-just-the-name. Applies to both the add + manage forms.

### Docs
- `Readme.md` (+ fixed a stale `migrations` range in the repo-layout tree), `Changelog.md` → Build 29.

---

## v0.1.0 — Build 28 (2026-07-02)

*UX refinement: the identity header now pairs the photo with just the name (vertically centered), balanced instead of clunky. Builds clean; lint passes.*

### Changed
- The Build 27 header stacked **name + practice** beside a top-aligned avatar, which looked off-balance. Now the **avatar is vertically centered next to the single Name field** (a clean "photo + name" row) and **Practice name moves to its own full-width field** below — reads tidier on both the add and manage forms.

### Docs
- `Readme.md`, `Changelog.md` → Build 28.

---

## v0.1.0 — Build 27 (2026-07-02)

*UX: the photo now sits at the top of the add/manage forms, next to the name (an identity header), instead of buried mid-form. Builds clean; lint passes.*

### Changed
- **`AvatarUploader` is now a compact tap-to-upload avatar** — a clickable circle (with a `＋` placeholder) + an "Add photo / Change · Remove" caption — placed in an **identity header** at the top of both the **add-practitioner** and **manage** forms, right beside the Name + Practice fields. Previously the photo field sat mid-form (after the bio), which felt illogical and out of place. Now it reads like a normal profile-creation flow. Stacks cleanly on a phone.

### Docs
- `Design.md`, `Readme.md`, `Changelog.md` → Build 27.

---

## v0.1.0 — Build 26 (2026-07-02)

*Bugfix: the Instagram contact button now actually opens Instagram. Builds clean; lint passes.*

### Fixed
- **Instagram button led to a broken link.** Practitioners usually enter a **handle** (`@sarah` or `sarah`), but the button used `externalHref`, which turned that into `https://sarah` — a dead link. New **`instagramUrl()`** (`src/lib/format.ts`) normalizes any form — `@handle`, `handle`, `instagram.com/handle`, or a full pasted URL — into `https://instagram.com/<handle>`. Used on the practitioner **card** and **profile**. No data change needed (values are normalized at render).

### Docs
- `Bugs.md`, `Readme.md`, `Changelog.md` → Build 26.

---

## v0.1.0 — Build 25 (2026-07-02)

*Profiles as mini-sites — Phase 1c: a "what I offer" services menu. **Phase 1 (mini-site core) complete.** Builds clean; lint passes.*

### Added — services menu
- **`practitioner_services`** table (migration `0007`) — `title` (req), optional `description`/`price_note`, `sort_order`. Public-read for **live** practitioners (mirrors `practitioner_categories`); writes via the service-role manage action.
- **`ServicesEditor`** on the `/manage/<token>` page — a dynamic add/remove list (rows are parallel-named `service_title` / `service_price` / `service_desc`, zipped by index in `updateListing` and replaced on save; empty-title rows dropped).
- **"What I offer"** section on `/p/[slug]` (title · price on a line, optional blurb). Data via `getPractitionerServices` (anon = live-only; `useAdmin` for the owner's manage view).
- The free-text keyword chips on the profile were relabelled **"Specialties"** to distinguish them from the structured services menu.

### Setup required
- **Run `supabase/migrations/0007_practitioner_services.sql`** in Supabase before this ships. Safe to re-run.

### Milestone
- **Phase 1 (mini-site core) is complete:** editable listings (manage link) + avatar upload + services menu + "accepting clients." **Next: Phase 2 — solicited testimonials** (positive, practitioner-requested — not open reviews).

### Docs
- `Architecture.md`, `Product.md`, `Design.md`, `Hearth - Database Schema.md` + `.mermaid`, `Claude.md`, `Readme.md`, `Changelog.md` → Build 25.

---

## v0.1.0 — Build 24 (2026-07-02)

*Profiles as mini-sites — Phase 1b: real photo (avatar) uploads. Builds clean; lint passes.*

### Added — avatar uploads
- **`AvatarUploader`** (`src/components/forms/avatar-uploader.tsx`) replaces the paste-a-link photo field on **both** the add-practitioner form and the manage/edit page. It **compresses the image on-device** (canvas → ~512px JPEG, EXIF-orientation-aware, ~100–200 KB) so phones don't upload multi-MB files.
- **`uploadAvatar`** (`src/lib/actions/upload-avatar.ts`, **service-role**) validates content-type (JPG/PNG/WebP) + size (≤2 MB) and stores the image in the public **`avatars`** Storage bucket (migration `0006`), returning a public URL that flows into `photo_url` via the existing submit/update actions.
- Live preview + "Change/Remove"; graceful if the bucket isn't set up yet (shows an error, form still works).

### Security / cost
- The `avatars` bucket is public-**read** but has **no anon write policy** — uploads only happen through the service-role action (validated). Storage/egress ≈ **$0** at community scale with the on-device compression. *(Open-endpoint flood is on the rate-limit watchlist — `Bugs.md`.)*

### Setup required
- Create the **`avatars`** Storage bucket: run `supabase/migrations/0006_avatars_bucket.sql`, **or** in the dashboard: Storage → New bucket → name `avatars` → toggle **Public** → Create.

### Next (Phase 1)
- **1c:** services menu. Then **Phase 2:** testimonials (solicited + positive).

### Docs
- `Architecture.md`, `Security.md`, `Bugs.md`, `Product.md`, `Claude.md`, `Readme.md`, `Changelog.md` → Build 24.

---

## v0.1.0 — Build 23 (2026-07-02)

*Profiles as mini-sites — Phase 1a: listings are now editable without an account, via a private "manage" link. Builds clean; lint passes.*

### Added — editable listings (the manage link)
- **`/manage/<token>` edit page** — a practitioner can update their whole listing **any time, with no account**, via a secret per-listing capability link (a uuid `manage_token`, migration `0005`). It's surfaced on the add-practitioner **success screen** ("your private edit link — bookmark it, keep it to yourself") and marked `noindex`.
- **`updateListing`** (`src/lib/actions/manage-listing.ts`, service-role) saves edits, re-geocodes the area, and **re-runs the content-check** — a flagged *live* listing is quietly held for review + stewards notified, so the link can't push spam public. The slug stays stable (shared links keep working).
- **"Accepting new clients"** toggle (migration `0005`), shown on the profile's "Get in touch" card.
- `getListingByManageToken` (service-role lookup) + `AddressAutocomplete` gained a `defaultValue` prop (to prefill the area when editing).

### Security
- `manage_token` is **column-revoked from the `anon`/`authenticated` roles** (`revoke select (manage_token) …`) so it can't leak through a public `select *`; it's read only via the service-role and isn't in the `Practitioner` type. It grants edit to one listing — never admin.

### Setup required
- **Run `supabase/migrations/0005_manage_and_status.sql`** in the Supabase SQL editor before this ships. Safe to re-run — existing listings get a token automatically.

### Next (Phase 1)
- **1b:** compressed **avatar upload** (one Supabase Storage bucket). **1c:** **services menu**. Then Phase 2 **testimonials** (solicited + positive only — not open reviews).

### Docs
- `Architecture.md`, `Security.md`, `Product.md`, `Hearth - Database Schema.md` + `.mermaid`, `Claude.md`, `Readme.md`, `Changelog.md` → Build 23.

---

## v0.1.0 — Build 22 (2026-07-02)

*Documentation audit (`/updatestructure`) — re-verified every doc against the code after Builds 20–21. **No runtime/app code changed.***

### Documentation — fixed drift from the palette page (Build 20) + `NOTIFY_EMAILS` (Build 21)
- **`Design.md`:** noted the in-progress **palette exploration** (Build 20) — 30 directions at `public/palette-explorations.html`; the current tokens stay the live system until a direction is chosen.
- **`Readme.md`:** added `public/` (+ the palette page) and `vercel.json` to the repo-layout tree; broadened the `src/app` / `src/lib` descriptions; clarified the local-setup env comment.
- **`Architecture.md`:** added `public/` + `vercel.json` to the structure tree; **disambiguated the "Event seed" row** — the `/public/basic.ics` shorthand meant Google's iCal feed path, not our new `public/` dir, so it now clearly reads "Google's public iCal feed."
- **`Claude.md`:** documented the non-`.md` artifacts in the map (`public/palette-explorations.html`, the now-tracked `.env.example`, `vercel.json`).
- Confirmed everything else is current: the `NOTIFY_EMAILS` decouple and tracked `.env.example` (Build 21) are already in the docs, no stray `.md` files to move, `planning-archive/` preserved for provenance.

### Docs
- `Design.md`, `Readme.md`, `Architecture.md`, `Claude.md`, `Changelog.md` → Build 22.

---

## v0.1.0 — Build 21 (2026-07-02)

*Decouple steward alert recipients from admin-panel access. Builds clean; lint passes.*

### Changed
- **New `NOTIFY_EMAILS` — who gets alerted, separate from who can log in.** `notifyAdmins` now emails **`NOTIFY_EMAILS`** (comma-separated) if set, otherwise falls back to `ADMIN_EMAILS` (`notifyEmails()` in `src/lib/notify.ts`; shared `parseEmails()` extracted in `src/lib/auth.ts`). This lets several people have admin-panel access (`ADMIN_EMAILS`) without all of them receiving alert emails — and, on Resend's onboarding sender, keeps the recipient list to a single Resend-account inbox so adding more admins doesn't break email delivery.
- **No behaviour change when `NOTIFY_EMAILS` is unset** — alerts still go to `ADMIN_EMAILS`, exactly as before.

### Setup (optional but recommended before onboarding more admins)
- Set `NOTIFY_EMAILS` in Vercel to the address(es) that should receive alerts (for now, your Resend-account inbox). `ADMIN_EMAILS` stays the login allowlist. Then a second steward can log in without breaking alerts.

### Fixed (repo hygiene)
- **`.env.example` is now actually committed.** The `.gitignore` pattern `.env*` was over-broad and had been silently ignoring the `.env.example` template too — so env-var docs added in earlier builds never reached the repo. Added `!.env.example` so the (secret-free, placeholder-only) template is tracked; this commit brings it in, up to date through `NOTIFY_EMAILS`.

### Docs
- `Security.md`, `Architecture.md`, `Claude.md`, `.env.example` (now tracked), `Readme.md`, `Changelog.md` → Build 21.

---

## v0.1.0 — Build 20 (2026-07-02)

*Design exploration session — no runtime/app code changed.*

### Design — palette exploration for the visual refresh
- Added **`palette-explorations.html`** (repo root): a standalone, shareable page with **30 palette/design directions** across three moods (warm & grounded · unexpected · light & airy), each with a mini app mockup and hex swatches. Built for reviewer feedback (reply with numbers).
- Copied it to **`public/palette-explorations.html`** so it's served at `/palette-explorations.html` on the next deploy (easy link for reviewers, e.g. Greg). Remove from `public/` once a direction is chosen.
- No decision yet — `Design.md` unchanged until a direction is picked; a full token hand-off spec will follow.

---

## v0.1.0 — Build 19 (2026-07-02)

*Documentation audit (`/updatestructure`) — brought every doc in line with the code through Build 18. **No runtime/app code changed**; builds clean.*

### Documentation — verified every `.md` against the code and fixed drift from Builds 14–18
- **`Architecture.md`:** rewrote the app-structure tree to match reality (there is no `(public)` route group; added `/p/[slug]`, `/feedback`, `/admin/feedback`; marked the Events pages hidden; real `src/lib` layout; all four migrations). Reordered + completed the "Built so far" log (added 15/16/17, fixed the stale "(Build 4)" header). Corrected the §2 diagram and §9 "current build" (Build 18; public iCal feed, not the "Google Calendar API").
- **`Hearth - Database Schema.mermaid`:** added the **`feedback`** entity and the missing `latitude`/`longitude`/`geocoded_at` (+ `languages`/`keywords`) columns.
- **`Bugs.md`:** logged the Instagram-contact, "near me" location, and share-link fixes as **resolved**; broadened the spam item to all public-write paths (`/add-practitioner`, `/report`, `/feedback`); added watchlist items (steward alerts reach one inbox on Resend's onboarding sender; the `middleware`→`proxy` Next.js deprecation).
- **`Readme.md`:** corrected the tech-stack table (public iCal feed via `node-ical`, not "Google Calendar API"; added the email row) and the schema-apply step (run all four migrations in order).
- **`Claude.md`:** updated the schema-apply command to run all four migrations in order.
- Confirmed the structure is already correct — living docs in `documentation/`, `planning-archive/` preserved for provenance, **no stray `.md` files to move**.

### What each doc is for (the map)
- **Root:** `Readme.md` (overview · stack · repo layout · version/build) · `Changelog.md` (this log, newest-first by build) · `Claude.md` (assistant working notes & nuances) · `Bugs.md` (known issues / watchlist).
- **`documentation/`:** `Architecture.md` (system, tech, structure, data flow) · `Security.md` (auth, RLS, abuse-resistance, privacy, secrets) · `Product.md` (North Star, personas, forms, scope) · `Design.md` (visual system, mobile-first UX) · `Hearth - Database Schema.md` + `.mermaid` (authoritative data model / ER diagram) · `planning-archive/` (original planning docs — provenance only, don't edit).

---

## v0.1.0 — Build 18 (2026-07-02)

*A private feedback channel for the user-testing phase: an unlisted `/feedback` form feeding a steward status board. Builds clean; lint passes.*

### Added — feedback (user-testing phase)
- **Unlisted `/feedback` form** — gated by a new **`FEEDBACK_ENABLED`** flag (`src/lib/features.ts`, on now). **Never in the public nav**; flip the flag off at launch and it 404s. Fields: type (🐛 bug / 💡 idea / 😕 confusing / ❤️ love it / other), the message (required), optional "where in the app," and optional name + contact for follow-up. Marked `noindex` so it stays out of search.
- **`feedback` table** (migration **`0004_feedback.sql`**) — RLS **admin-only** (no anon policy, so a leaked anon key can't read or write it); public submissions go through a **service-role** action (`submitFeedback`) and land as `status = 'new'`. No content-check (feedback is never published).
- **Admin status board** at **`/admin/feedback`** — a kanban of columns **New → Looking into it → Planned → Done / Declined**; per card you can move status, set **priority** (low/med/high), add a private **note**, or delete. New **"Feedback"** admin nav tab + a **"new feedback"** count on the dashboard. Actions in `src/lib/actions/admin.ts` (`setFeedbackStatus` / `setFeedbackPriority` / `setFeedbackNote` / `deleteFeedback`, each `requireAdmin`).

### Setup required
- **Run `supabase/migrations/0004_feedback.sql`** in the Supabase SQL editor before this ships — otherwise feedback inserts fail. Safe to re-run.

### Docs
- `Architecture.md`, `Security.md`, `Product.md`, `Hearth - Database Schema.md`, `Claude.md`, `Readme.md`, `Changelog.md` → Build 18.

---

## v0.1.0 — Build 17 (2026-07-02)

*Bugfix: Instagram now counts as a contact, so an Instagram-only practitioner can list. Builds clean; lint passes.*

### Fixed
- **Instagram-only listings were blocked.** The "at least one contact" rule counted WhatsApp / Email / Website but **not** Instagram — yet the form groups all four under "at least one is required," so entering only an Instagram failed with *"you need to enter one of the four fields above"* and wouldn't submit. Instagram now counts (which also realigns with the original directory spec's *"…or social link"*). Fixed in **two places that must agree**: the server validation (`submitPractitioner`) and the database constraint.
- **⚠️ One DB migration to run:** `supabase/migrations/0003_instagram_contact.sql` — paste it into the Supabase SQL editor. It updates `practitioners_contact_check` to include `instagram`. Until it's run, an Instagram-only submit passes app validation but the DB rejects the insert (generic "something went wrong"). Safe to re-run.
- Note: no form change was needed — the add-practitioner form already presented all four (WhatsApp/Email/Website/Instagram) as an equivalent "at least one required" group; only the validation + DB were stricter.

### Docs
- `Product.md`, `Architecture.md`, `Hearth - Database Schema.md`, `Claude.md`, `Readme.md`, `Changelog.md` → Build 17.

---

## v0.1.0 — Build 16 (2026-07-02)

*Practitioners must now add a location — with easy type-ahead — so they reliably show up in "near me." Builds clean; lint passes.*

### Changed
- **`area` is now required** on the add-practitioner form. It was optional, so a practitioner who skipped it (or typed something ungeocodable) silently dropped out of "near me," making them hard to find. Now enforced **client-side** (required field) **and server-side** (`submitPractitioner`). This aligns the code with `Product.md §7`, which already specified it as required.
- **Easy location entry:** the practitioner form now uses the same **type-ahead `AddressAutocomplete`** as the event form — pick a suggestion and it **pins area-level coordinates** for reliable "near me" placement; free-typing still geocodes on submit. Generalized the component with `name` / `placeholder` / `required` props (events keep `location_text`, practitioners use `area`). Framed as a **neighbourhood/city, not a home address** (keeps the area-level privacy norm).

### Refactor
- Extracted **`resolveCoordsFromForm`** into `src/lib/geocode.ts` (prefer the picked autocomplete coords, else geocode the typed text) and used it in **both** `submitPractitioner` and `submitEvent` — removing the duplicated resolver that lived in the event action.

### Docs
- `Product.md`, `Claude.md`, `Readme.md`, `Changelog.md` → Build 16.

---

## v0.1.0 — Build 15 (2026-07-02)

*Polish pass on the practitioner pilot: Hearth-flame favicon, warmer honest copy, shareable-link buttons, and richer profiles (+ a photo field). Builds clean; lint passes.*

### Added
- **Hearth-flame favicon** — replaced the default Next.js/Vercel tab icon with `src/app/icon.svg` (the gold flame from `logo.tsx` on a deep "night" tile, so it reads on any browser theme); removed `src/app/favicon.ico`.
- **Share / copy-link** — new `ShareButton` (`src/components/share-button.tsx`): opens the phone's native share sheet (Web Share API) or copies the link + confirms. It takes an absolute `url` built with `siteUrl()` so it shares the canonical deployed link (no `window`/effect, no hydration mismatch). Placed on the **practitioner profile** ("Share this profile") and on the **"you're live" screen** after adding a practice — which now shows the practitioner **their own `/p/…` link to copy** plus a "View your profile" button (previously there was no way to grab it).
- **Photo/logo on the add-practitioner form** — a new optional `photo_url` field (stored only if it's an `http(s)` link; the card/profile already render it). Direct uploads are the **next build** (see below).
- **Richer profile layout** (`/p/[slug]`) — a header card with a gradient banner + larger rounded avatar, an **Offerings** chip row from the `keywords` field (previously not shown), and a dedicated **"Get in touch"** contact card. A step toward the "profile-as-mini-site" vision.

### Changed
- **Honest, warmer copy** — dropped the "our community *trusts / vouches for*" claim (anyone can post, so it over-claimed) in the hero headline/subheading (`app/page.tsx`) and the browser-tab title/description (`app/layout.tsx`). Hero now: *"A warm home for our community's healers."*

### Planned next (not yet built)
- **Practitioner profiles as mini-websites:** real photo **uploads** (Supabase Storage bucket + RLS, replacing URL-paste), a small **gallery**, and a fuller profile redesign. Scoped for the next build.

### Docs
- `Readme.md`, `Design.md`, `Product.md`, `Changelog.md` → Build 15.

---

## v0.1.0 — Build 14 (2026-07-02)

*Practitioner-only pilot: email alerts to stewards, report-a-practitioner everywhere, and the Events layer hidden behind one flag. Builds clean; lint passes.*

### Added — steward email notifications (the missing "notify a human")
- **`src/lib/notify.ts`** (`notifyAdmins`, server-only) — emails everyone in `ADMIN_EMAILS`, using whichever provider is configured (no code change to switch): **Resend** (`RESEND_API_KEY` — no email account/domain/app-password needed; onboarding sender delivers to your Resend-account inbox until a domain is verified) or **Gmail SMTP** (`nodemailer`, from a Gmail you control via a Google App Password — no recipient limit). Degrades gracefully: with neither configured it logs to the server console instead of sending, so the app still builds/runs without credentials, and it **never throws** (a failed alert can't break a submission).
- **Report threshold now emails** (`submitReport`): when a practitioner crosses **3 distinct reporters**, stewards get one email (fires once, on crossing — no alert fatigue) with the listing name, reason, and links to the listing + `/admin/reports`. Replaces the previous silent `console.warn`. *Flags still never auto-hide.*
- **Held submissions now email** (`submitPractitioner`): a listing held `pending` by the content check emails stewards the name, the reason it was held, and a link to `/admin/moderation` — delivering the "notify the admin immediately" the docs always promised.
- **`siteUrl()`** helper (`src/lib/url.ts`) for absolute links inside emails; `NEXT_PUBLIC_SITE_URL` env (defaults to the production domain).

### Added — report a practitioner from anywhere
- **"Report" link on every practitioner card** (`PractitionerCard`), matching the event cards — previously the only entry point was a buried link on the profile page. The backend, `/report` page, and admin inbox already handled practitioners; this closes the discoverability gap.

### Changed — practitioner-only pilot (Events hidden, reversibly)
- **`src/lib/features.ts`** — new `EVENTS_ENABLED` flag (`false`). One switch hides the whole public Events layer; no code deleted. Gated: the **Events nav** link, the home **"Coming up"** peek + hero events CTA/copy, the **"events they host"** section on profiles, and the **`/events` + `/add-event`** routes (→ 404 while hidden). Footer copy softened to practitioners-only.
- **Daily import cron** (`/api/cron/import`) short-circuits when events are disabled — no wasted import/geocoding of events no one can see; resumes automatically when re-enabled.
- Admin-side event management is intentionally left intact (behind auth, invisible to the public, ready for when events return).

### Setup required
- Turn on email delivery (local + Vercel) with **either** `RESEND_API_KEY` (easiest — no email account/domain needed) **or** `GMAIL_USER` + `GMAIL_APP_PASSWORD` (a Google App Password on a 2-Step-Verification account); optionally `NEXT_PUBLIC_SITE_URL`. Without either, alerts log to the server console.

### Docs
- `Readme.md`, `Architecture.md`, `Security.md`, `Product.md`, `Design.md`, `Claude.md`, `.env.example` → Build 14.

---

## v0.1.0 — Build 13 (2026-06-26)

*Admin panel — the v1 feature set is complete. Builds clean; lint passes.*

### Added — #3 admin panel
- **Auth:** Supabase Auth login (`/admin/login`, `LoginForm`), `src/middleware.ts` session refresh on `/admin`, `src/lib/auth.ts` gate by **`ADMIN_EMAILS`** allowlist. Pages under `app/admin/(protected)/` redirect non-admins to login (verified: `/admin*` → 307 login when unauthenticated).
- **Security model:** admin reads (`src/lib/data/admin.ts`) + mutations (`src/lib/actions/admin.ts`) use the **service role**; every mutation calls `requireAdmin()` — admin power never depends on broad `authenticated` RLS.
- **Pages:** Dashboard (counts) · Moderation (approve/reject pending practitioners + events) · Reports (open reports grouped by target with distinct-reporter counts; hide / dismiss) · Practitioners (hide/feature/delete) · Events (hide/feature/delete + **Run import now**) · Categories (add / rename / activate-deactivate).
- Reusable `ActionButton` + `SignOutButton`.

### Setup required
- Add `ADMIN_EMAILS` (local + Vercel) and create the matching user(s) in Supabase Auth; keep public sign-ups disabled.

### Docs
- `Architecture.md`, `Security.md`, `Claude.md`, `.env.example`, `Readme.md` → Build 13.

---

## v0.1.0 — Build 12 (2026-06-26)

*Community report / flagging flow. Builds clean; lint passes.*

### Added — #2 report flow
- **`/report?type=&id=`** page + **`ReportForm`** (no login): reason, reporter email/WhatsApp (for dedupe), optional details, with private/quiet framing.
- **`submitReport`** server action (service-role): one report per contact per target (dedupe), denormalizes the **distinct-reporter `flag_count`** onto practitioners, and logs a steward alert when distinct reporters reach **3** (flags never auto-hide).
- **"Report" links** on practitioner profiles ("Report this listing") and event cards (subtle "Report").
- Verified end-to-end: inserts for both target types, distinct-count/flag-count update, and the one-target `CHECK` rejecting bad rows.

### Docs
- `Architecture.md`, `Readme.md` → Build 12.

---

## v0.1.0 — Build 11 (2026-06-26)

*Shareable practitioner profile pages. Builds clean; lint passes.*

### Added — #1 practitioner profiles
- **`/p/[slug]`** profile page: avatar/photo, name + practice, `✦` member badge, all categories, description + bio, area/mode/languages/pricing, full contact buttons, and **upcoming events they host**. Per-profile share metadata (`generateMetadata`) for clean WhatsApp link previews.
- Data: `getPractitionerBySlug` + `getEventsByHost`.
- Directory cards now **link the name to the profile**.
- The add-event form has an optional **"Are you a Hearth practitioner?"** selector (`getPractitionerOptions` → `host_practitioner_id`), so events cross-link to a profile and surface there. `submitEvent` stores it.

### Docs
- `Architecture.md`, `Readme.md` → Build 11.

---

## v0.1.0 — Build 10 (2026-06-26)

*The daily cron now auto-geocodes new addressed events/practitioners. Builds clean; lint passes.*

### Added
- **`src/lib/import/geocode-pending.ts`** (`geocodePending`) — geocodes events (`location_text`) and practitioners (`area`) that have a location but no coordinates, reusing `geocodeAddress` (same cleaning/fallbacks as the submit path). Capped at 20 addresses/run and throttled ~1/sec (Nominatim-friendly; repeated addresses geocoded once); the rest roll to the next run.
- **`/api/cron/import`** now runs `geocodePending` right after the import, so freshly-imported addressed events join **"near me"** with no manual step. Response shape is now `{ ok, import, geocode }`.

### Verified
- End-to-end: a temp addressed event imported coordinate-less was auto-geocoded by the cron (Nathan Phillips Square → 43.65, -79.38), `geocode:{attempted:1,geocoded:1}`, then cleaned up.

### Docs
- `Bugs.md` (limitation resolved), `Architecture.md`, `Claude.md`, `Readme.md` → Build 10.

---

## v0.1.0 — Build 9 (2026-06-26)

*Automatic daily Google Calendar import (Vercel Cron) + "Add to calendar" on events. Builds clean; lint passes.*

### Added — #4 auto-import (the transition mechanism)
- **Shared import core** `src/lib/import/ics-core.mjs` (+ `ics-core.d.mts` types): parse/recurrence-expand/clean/dedupe/insert — one implementation now used by **both** the standalone script and the cron.
- **Server module** `src/lib/import/calendar.ts` (`runCalendarImport`, service-role, reads `process.env`).
- **`/api/cron/import`** route — `CRON_SECRET`-guarded (Vercel Cron sends the Bearer; open locally for manual runs).
- **`vercel.json`** — daily cron at 09:00 UTC, so events still added via the legacy Google Form sync into Hearth automatically during the transition.
- Rewrote `scripts/import-calendar.mjs` to a thin wrapper over the shared core (no duplicated logic). Added `serverExternalPackages: ["node-ical"]` (the route otherwise fails to build with a `BigInt` bundling error).

### Added — #5 add to calendar
- **"+ Calendar"** link on every event (`googleCalendarUrl`) — opens a pre-filled Google Calendar event (works on desktop + mobile), alongside Register / Directions.

### Notes
- Cron import does **not** geocode; new addressed events need `npm run geocode` to join "near me" (tracked in `Bugs.md`).
- Needs a one-time `CRON_SECRET` env var added in Vercel.
- Docs updated: Architecture, Claude, Bugs (recurring-horizon resolved), `.env.example`, Readme → Build 9.

---

## v0.1.0 — Build 8 (2026-06-26)

*Deployed to production; near-me recurring-duplicate bug fixed; copy + logo polish; documentation refreshed (`/updatestructure`). Builds clean; lint passes.*

### Deployed
- Live on **Vercel at https://hearthto.vercel.app** (auto-deploys from `main`), connected to the live Supabase project. Verified end-to-end in production (browse, submit, near-me over HTTPS). URL recorded in `Readme.md`.

### Fixed
- **"Near me" repeated one event.** Imported recurring events are stored one row per occurrence; the two addressed weekly yoga series (14 + 15 rows) dominated the distance-sorted list. `getEvents` now **collapses each series to its next upcoming occurrence** (`collapseSeries`, keyed by the `external_id` UID prefix); the `limit` is applied after collapse + distance sort. Also declutters the time agenda.

### Changed
- **Homepage copy:** hero now "Find the **events and practitioners** our community trusts" (events first); subline trimmed to "A lasting, searchable home for the healers, facilitators, and conscious events we love."
- **Logo pop:** richer gold gradient, brighter inner ember, and a soft glow on the flame mark.

### Docs (`/updatestructure` refresh)
- Verified all root + `documentation/` files against the code. Brought `Bugs.md` current (removed the stale "no code yet" note; reorganized Open/Resolved; logged the near-me fix). Updated `Architecture.md` (series collapse), `Claude.md` (collapse gotcha), `Design.md` (logo), `Readme.md` (Build 8 + live status).

---

## v0.1.0 — Build 7 (2026-06-26)

*"📍 Near me" for both events and practitioners — distance, nearest-sort, radius, directions. Builds clean; lint passes.*

### Added — location feature
- **Schema (migration 0002):** `latitude`/`longitude`/`geocoded_at` on `events` and `practitioners`.
- **Geocoding (free, no key):** `src/lib/geocode.ts` (OpenStreetMap Nominatim, `server-only`, with venue/postal cleaning + fallback variants + cache) and `/api/geocode` autocomplete proxy. Geocoding happens **only on write**.
- **Distance:** `src/lib/geo.ts` — haversine `distanceKm`, `formatDistance`, and `withDistance` (attach distance, sort nearest-first, filter by radius).
- **Geocode on submit:** events geocode `location_text` (or use the autocomplete's picked coords); practitioners geocode `area`.
- **Address autocomplete** (`AddressAutocomplete`) on the Add-an-event form — pick a suggestion to capture precise coordinates.
- **"Near me" UI** (`LocationControl`, shared by both pages): GPS button + "type a neighbourhood" box, distance chips on each result, nearest-first ordering, radius chips (5/10/25/50 km), and **"Directions"** links (open the maps app) on events.
- **Backfill:** `scripts/geocode-events.mjs` (`npm run geocode`) — geocoded the **29 addressed events**; practitioners geocode as they're added.

### Notes
- Geolocation needs HTTPS, so "Near me" (GPS) works on localhost + Vercel but not the plain-http LAN URL on a phone — the "type a place" box works everywhere. Practitioner coordinates are area-level (never a home address) and "near me" location is never stored server-side.
- Docs updated: Architecture, Security (privacy), Schema, Design, Claude, Readme → Build 7.

---

## v0.1.0 — Build 6 (2026-06-26)

*Design pass: a "rich & sacred" identity + a mobile-first rethink from user feedback. Builds clean; lint passes.*

### Changed — visual identity
- New **"rich & sacred"** palette in `globals.css` (Tailwind v4 `@theme`): warm parchment base, deep emerald + plum jewel tones, antique gold accents, deep "night" hero/header/footer. Added a `.gold-rule` divider.
- **Crafted SVG flame mark + wordmark** (`src/components/logo.tsx`) replacing the emoji; deep-night header & footer with gold accents; dramatic gradient hero on Home.

### Changed — mobile-first UX (from feedback)
- **Events → date-led agenda** (Luma-inspired): single-column rows with a date badge + one clean meta line, under slim gold bucket labels — replacing the two-column tiles that were hard to read.
- **Practitioners → compact rows:** avatar (photo or gold-ringed initial), name + small `✦ member` mark, one-line description, a single meta line, condensed contact actions — replacing pill-heavy cards.
- **Filters → one slim horizontal-scroll strip** (`FilterChips` reworked) instead of a wrapping wall of pills.
- **Lists not grids:** rows sit in a single rounded `bg-card` container with `divide-y`. Trimmed the hero and section copy.

### Fixed
- **Raw `href` / HTML showing in event descriptions.** `scripts/import-calendar.mjs` now strips HTML + decodes entities and extracts the registration link from `<a href>`; added a `--reset` flag and re-imported (553 events) to clean existing rows.

### Docs
- `Design.md` rewritten for the new palette, mobile patterns, and "what to avoid"; `Readme.md` → Build 6.

---

## v0.1.0 — Build 5 (2026-06-26)

*The Events page is now alive with the real community calendar. Builds clean; lint passes.*

### Added — Google Calendar import
- **`scripts/import-calendar.mjs`** + **`npm run import:calendar`** — reads the community calendar's **public iCal feed** (`…/public/basic.ics`) with **no API key needed**, parses via **`node-ical`**, and inserts events through the service-role client.
  - Maps the form's registration link out of the event DESCRIPTION (Eventbrite/Luma) into `registration_link`; infers `mode`; carries `recurrence_rule`.
  - **Non-recurring** events import from `EVENT_IMPORT_FROM` (2026-01-01) forward; **recurring** series are expanded into upcoming occurrences (today → +120 days), each keyed `external_id = UID:<occurrenceISO>`.
  - **Idempotent** — skips already-imported `external_id`s, safe to re-run during the transition.
- **First run result:** 553 events imported, **229 upcoming** — now rendering on `/events` (This week / Next week / Later) and the Home "Coming up" peek.

### Changed
- Simplified the calendar approach to the **public ICS feed** (dropped the Google Calendar API-key requirement): updated `.env.example` / `.env.local`, `Architecture.md` (stack + §6 import detail), `Security.md` (no key to leak — ticked), `Bugs.md` (API-key + dedupe items resolved; added a recurring-horizon note), `Product.md` (open Q3 resolved), `Claude.md` (import command), `Readme.md` (Build 5 + import step).
- Added `node-ical` dependency.

---

## v0.1.0 — Build 4 (2026-06-26)

*Native submission — the community can now add practitioners and events directly into Hearth. Builds clean (zero warnings); lint passes.*

### Added — submission flow
- **Service-role write client** `src/lib/supabase/admin.ts` (guarded by `server-only`, bypasses RLS) — used only by trusted server actions. Installed the `server-only` package.
- **Content check** `src/lib/moderation/content-check.ts` — flagged-term + link-density scan returning `ok` / `needs_review`.
- **Helpers** — `src/lib/slug.ts` (slugify + unique practitioner slug) and `src/lib/datetime.ts` (convert a `datetime-local` wall time in America/Toronto to a UTC ISO).
- **Server actions** `src/lib/actions/submit-practitioner.ts` & `submit-event.ts` — validate required fields + the at-least-one-contact rule, run the content check, **set `status`/`auto_check` server-side** (clean → `live`, suspicious → `pending`), insert via the service role (+ `practitioner_categories`), and `revalidatePath`. Shared `FormState` in `src/lib/actions/types.ts`.
- **Forms** `src/components/forms/practitioner-form.tsx` & `event-form.tsx` (client, `useActionState`): all Product.md fields — practitioner (name, up-to-3 categories, description, bio, area, mode, the four contacts, pricing, languages, keywords, member flag, agreement) and event (title, type, start/end, mode, location, registration link, cost, host, **repeats → RRULE**, description, agreement). Inline error + success/thank-you states (instant-publish vs held-for-review messaging).
- **Pages** `/add-practitioner` & `/add-event` (load categories, render the forms).

### Changed
- **Practitioners** page now has a **➕ Add your practice** button; **Events** page's **➕ Add an event** now points to the native `/add-event` form (the Google form remains available externally during the transition).
- Docs: `Architecture.md` (built-so-far → Build 4), `Security.md` (write-path + content-check ticked; rate-limit/bot-check still open), `Bugs.md` (server-controlled status resolved; spam/bot flood now the live open item), `Claude.md` (two-clients rule, submissions, datetime), `Readme.md` (Build 4 + status).

---

## v0.1.0 — Build 3 (2026-06-25)

*First application code — the project foundation and the public browse experience. Builds clean (zero warnings); lint passes.*

### Added — Next.js app
- Scaffolded **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4**, merged into the repo root (kept our existing docs; dropped the scaffold's colliding `README/CLAUDE/AGENTS`).
- **Database:** `supabase/migrations/0001_initial_schema.sql` — all v1 tables (`practitioners`, `categories`, `practitioner_categories`, `events`, `reports`; `users`/`registrations` modelled dormant), enums, `updated_at` triggers, `search_vector` full-text columns, the at-least-one-contact `CHECK`, the `(source, external_id)` dedupe index for imports, **RLS policies** (anon read-only & live-only; admin full access), and the **11 seeded categories**.
  - **Shared taxonomy decision implemented:** added `events.category_id → categories` so events reuse the practitioner taxonomy.
- **Supabase wiring:** `src/lib/supabase/server.ts` (RLS-respecting anon client; returns null + empty states when env is unset so builds/dev never crash), typed schema in `src/lib/types/database.ts`, and data-access in `src/lib/data/{practitioners,events,categories}.ts` (full-text search + category/mode filters).
- **Brand & layout:** soft-green/cream Tailwind theme + Fraunces/Nunito fonts (`globals.css`), root layout, sticky `SiteHeader` nav, `SiteFooter`.
- **Components:** `PractitionerCard` (member badge, category tags, WhatsApp/email/website/Instagram contact buttons), `EventCard` (Toronto-time formatting, recurring flag, register link), `FilterChips` (no-JS, URL-driven filtering).
- **Pages:** Home (warm hero + peeks at both worlds), `/practitioners` (search + category + mode filters), `/events` ("This week / Next week / Later" grouping + filters; **"Add an event" links to the existing Google form** during the transition).
- **Config:** `.env.example` (Supabase + Google Calendar vars), pinned Turbopack `root` in `next.config.ts` to silence the stray-lockfile warning.

### Changed — docs
- `documentation/Security.md` — documented the hardened write model (anon read-only; public writes via service-role server actions) and ticked the RLS watchlist item.
- `documentation/Architecture.md` — "built so far" note + version bump; `documentation/Design.md` — concrete palette tokens + fonts; `documentation/Hearth - Database Schema.md` — recorded `events.category_id`.
- `Claude.md` — dev commands, server-rendered-filter note, resolved open questions (#1, #2 confirmed/resolved). `Bugs.md` — RLS item resolved.
- `Readme.md` — Build 2 → **Build 3**, status, repo layout (now shows `src/` + `supabase/`), and a "Running locally" section.

### Infra
- `git init`, wired GitHub remote `git@github.com:bhavnasharma01/Hearth.git` (SSH auth verified).

---

## v0.1.0 — Build 2 (2026-06-25)

*Captured the real existing event pipeline as the seed source and mapped it to Hearth's model.*

### Added
- **`documentation/Architecture.md §6`** — new "Existing pipeline being replaced" reference: the live Google Form (`Add an Event to the Conscious Events TO Calendar`, https://forms.gle/fzgQ7s43udWcFaSr6) and the seed-source calendar **Conscious Events TO Calendar** (`consciouseventsto@gmail.com`, `America/Toronto`), with its current fields.
- **`documentation/Product.md §7`** — field-by-field mapping of today's 6-field form → Hearth's superset `events` model, showing the import loses nothing and `recurrence_rule` replaces the manual "email an admin to repeat" workaround.

### Changed
- **`Claude.md`** — recorded the real calendar ID/timezone and form link in the import gotcha; marked open question #3 (which calendar) partially **resolved**.
- **`documentation/Product.md`** open questions — #3 updated with the identified calendar.
- **`Readme.md`** — Build 1 → Build 2.

### Still open (from this)
- Confirm the "Conscious Events TO Calendar" is publicly API-readable (needed for the seed import via an API key).
- Confirm the 2026-01-01-forward import window.

---

## v0.1.0 — Build 1 (2026-06-25)

*Project inception — vision consolidation & documentation scaffolding. No application code yet.*

### Added — project scaffolding
- **Root docs:**
  - `Readme.md` — high-level overview, tech stack, repo layout, version/build (0.1.0 / Build 1).
  - `Changelog.md` — this file; the running log of all changes.
  - `Claude.md` — working notes, conventions, locked decisions, gotchas, and the document map for the AI assistant.
  - `Bugs.md` — known bugs/risks; seeded with the security/abuse watchlist to design against.
- **`documentation/` folder** with the four living source-of-truth docs:
  - `Architecture.md` — system diagram, Next.js + Supabase stack, app structure, data flow, moderation-in-app design.
  - `Security.md` — no-login model, Supabase Auth for admins, RLS backstop, content checks, abuse-resistant flagging, secrets, privacy, security watchlist.
  - `Product.md` — North Star, personas, core experience, practitioner & event form field sets, taxonomy, moderation philosophy, scope staging.
  - `Design.md` — mobile-first intent, soft greens/whites visual system, component inventory, interaction principles, what to avoid.

### Changed — organization
- Moved the original planning material into `documentation/planning-archive/` (preserved for provenance; assimilated into the living docs above): North Star, Product Brief, Detailed Implementation Spec, both Proposals (`.md`/`.docx`/`.pdf`), and Anat & Curtis's message.
- Relocated the data model — `Hearth - Database Schema.md` and `.mermaid` — into `documentation/` as the authoritative schema reference.

### Decisions locked (from the vision call + clarifying Q&A)
- **Database-backed app** (Next.js + Supabase/Postgres), superseding the original "$0 static site reading Google Sheets/Calendar" plan.
- **Native events** in Hearth (DB-stored), seeded by a one-time **Google Calendar import** (2026-01-01 forward); the Hearth form replaces the Google Form flow.
- **Trust signal = community-member badge only** — no public upvotes or written reviews in v1.
- **No public login**; admin-only Supabase Auth; `users`/`registrations` modelled but dormant until v2/v3.
- **v1 scope = Directory + Events together** *(pending explicit confirmation)*; accounts/endorsements/registrations/education-blog staged for v2/v3.

### Notes
- Earlier this session also produced the standalone product brief, now living at `documentation/planning-archive/Hearth - Product Brief.md` and assimilated into `documentation/Product.md`.
- No build/compile step yet — there is no application code. The first code build begins after the v1 plan is approved.
