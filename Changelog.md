# Changelog

*All notable changes to Hearth, newest at top. Grouped by build under the current version. Build number increments each work session; version changes only on explicit instruction.*

---

## v0.1.0 — Build 72 (2026-07-10)

*The F6 + heart-flame dress rehearsal: a full brand preview page. Builds clean.*

### Added
- **`/brand-preview.html`** (root source + `public/` copy, like the palette page): every key surface wearing **Clementine & Juniper with the chosen heart-flame**, for the Greg conversation and the final call.
  - **Six app screens** in phone frames: Home (orientation hero + deep-juniper footer), Directory (search, category rail with the Women's 🌙, rows, deep recruitment banner), Profile (header card, Where & how with map, Kind words + ♡ Recommend), Sign in (Google + email), My practice (tabs + pending approval card), Admin (juniper bar, status badges).
  - **All three transactional emails** as inbox-style cards with real copy: **Confirm your email**, **Reset your password**, **Someone recommended you** — white bodies, heart-flame lockup, clementine rule, juniper button, "Sent with care from Hearth · myhearthapp.ca" footer. These become the Supabase templates on confirmation.
  - The two-tone rule stated on-page: juniper carries (buttons, links, ink, deep stage), clementine sparks (mark, ✦, eyebrows) and never paints a big surface.
- Cross-link from the exploration page's hint line. `Readme.md` repo layout notes both preview pages.

### Docs
- `Readme.md`, `Changelog.md` → Build 72.

---

## v0.1.0 — Build 71 (2026-07-10)

*Logo decided: the heart-flame. Clementine & juniper joins the palette finalists. Builds clean.*

### Decided
- **The mark is L2, the heart-flame** ✓ — a heart holding a flame cutout (the heart·earth·hearth wordplay made visible). Marked chosen on the exploration page; the old single-flame mark will not ship (hearthapp.ca similarity). Final refined SVG + favicon cut ship together with the palette decision.
- **Palette consult moves to Greg** (Bhavna's call); Anat & Curtis sit this one out.

### Added
- **F6 Clementine & juniper** added to the finalists (Bhavna's lean, promoted from round-four #59): full decision-grade card — app + email mockups, swatches, and a why/risk note (clementine heart + juniper earth = a genuine two-tone identity; clementine stays a pure accent, juniper carries buttons; differentiation from the other warm-toned Hearth rides on the mark + juniper, not the orange).
- The chosen heart-flame's favicon tiles extended with **F6 light & deep** treatments (clementine-on-white and peach-on-juniper).

### Docs
- `Claude.md` open-items #4 rewritten (logo locked, palette open, the combined brand-ship build defined). `Readme.md`, `Changelog.md` → Build 71.

---

## v0.1.0 — Build 70 (2026-07-10)

*Logo & favicon directions added to the decision page — differentiating from the other "Hearth" app's flame mark. Builds clean.*

### Context
- Bhavna found **hearthapp.ca** — an existing "Hearth"-branded app with a similar flame logo and warm palette (possibly the London-Ontario community app Curtis mentioned on the July 6 call — he's confirming). Decision so far: the **name stays** (common word; the concern is the *mark*), so the flame logo/favicon must be replaced with something ownable, chosen together with the palette.

### Added
- **"Logo & favicon directions"** section on `/palette-explorations.html`: five inline-SVG marks, each shown large, as a wordmark lockup, and — the key test — **as a 16px-style favicon tile in three finalist palettes (F1/F3/F4)**:
  - **L1 The Hearth arch** *(recommendation)* — a fireplace opening with a fire inside: the literal hearth + the "warm front door"; nobody's plain flame comes with a fireplace around it.
  - **L2 The heart-flame** — a heart holding a flame cutout (the heart·earth·hearth wordplay made visible).
  - **L3 The Gathering** *(community-first alternative)* — six points circling a flame: people around a fire.
  - **L4 Embers rising** — hearthstone bowl + lifting sparks; the most modern.
  - **L5 The lantern** — carried warmth; the seeker's mark.
- Each card carries a why + an honest risk note; page lede updated (logo + palette are one decision).

### Docs
- `Readme.md`, `Changelog.md` → Build 70.

---

## v0.1.0 — Build 69 (2026-07-10)

*The palette page gets a decision layer: five finalists with app + email mockups. Builds clean.*

### Added
- **"The finalists" section at the top of `/palette-explorations.html`** — Bhavna's honest feedback: 60 cards produced browsing, not a decision ("light too light, dark too dark"), and the choice must also cover **emails** and branding. Each finalist is a fully-considered direction shown as a **larger app mockup + a notification-email mockup side by side**, with a why-it-fits note and honest risk:
  - **F1 Ember & ivory** (the recommendation): white-space canvas, one live-ember accent, deep warm-brown ink — synthesizes every collected signal (white space, heart-and-earth, no heavy headers, strongest name-fit).
  - **F2 Terra stage**: same canvas, mid-terracotta stage moments — the literal middle register.
  - **F3 Forest & flame, aired out**: identity continuity — the green lightened two steps, white body.
  - **F4 Stone & ember**: Morning-Fog quiet + one ember spark.
  - **F5 Golden hour**: pale honey light, amber ink, rose heart.
- Page lede/hint rewritten around the decision process: pick two finalists → wear each live for a day (one-block palette swap) → decide.

### Docs
- `Readme.md`, `Changelog.md` → Build 69.

---

## v0.1.0 — Build 68 (2026-07-10)

*Documentation audit (per /updatestructure): every living doc reconciled with the Builds 39–67 sprint; learnings + carry-forward captured. Docs only; builds clean.*

### Changed — staleness swept from every living doc
- **`Hearth - Database Schema.md`** (the authoritative schema, untouched all sprint): `users` marked **live** (auth-linked, trigger, self-RLS — `0008`), new **`testimonials`** entry (`0009`), design principle + v1/v2 staging rewritten for the account era.
- **`Readme.md`**: status paragraph rewritten (www canonical, accounts, testimonials, Rice Paper trial, verified email domain); route list + palette-page note; **Scope at a glance** — v2 accounts marked shipped-early, "Next" = palette → launch → events.
- **`Architecture.md`**: system diagram + Auth/stack rows + "Add a practice" data flow + key-properties updated from "public never logs in" to "no login to consume, accounts to contribute"; §9 → Build 68.
- **`Security.md`**: §1 threat context rewritten for member auth (Hearth never stores passwords); §2 authorization-in-practice bullet (role enum governs nothing; ownership checks per-row) + the **www/subdomain allowlist gotcha**.
- **`Product.md`**: form §7 notes the sign-in gate; §10 v2 marked ✅ shipped early; open questions — palette is *the* open decision, endorsements resolved as testimonials.
- **`Design.md`**: palette note → 60 directions/six moods; new **Account surfaces** component entry (header menu panel, tabbed My practice, Kind words card).
- **`Domain Setup.md` + `Google Sign-In Setup.md`**: URL configuration corrected to the **www** canonical with both-forms allowlist entries and the why.
- **`Bugs.md`**: one-inbox alert limit → Resolved (domain verified); DNS outage + OAuth-homepage bugs logged as Resolved; new 🔵 watchlist item for **Resend caps + Supabase email rate limit** at launch.

### Added — learnings & carry-forward
- **`Claude.md` → "Learnings from the July 2026 sprint (Builds 39–67)"**: the debugging lessons worth their cost — www vs apex, the Porkbun nameserver rule, RLS viewer-dependence, plus-address testing, greylisting, env-var redeploys, email volume math, recurring UX findings, and "walk flows as a signed-out stranger."
- **`Claude.md` → "Open items & carry-forward"** refreshed: palette decision (unlocks favicon + branded auth emails), initial admins, retreats parked, and a **pre-launch checklist** (rate-limit/honeypot, Supabase email rate limit, Resend watch, test-data cleanup, www continuity re-test).
- Trust-signal convention updated (badge + approved testimonials), palette-page doc-map entry (60 directions + sync rule).

---

## v0.1.0 — Build 67 (2026-07-10)

*Root cause of the sign-in-lands-on-homepage bug found: the www subdomain. Builds clean; lint passes.*

### Root cause (config — Bhavna's fix)
- The site's **canonical host is `https://www.myhearthapp.ca`** (the apex 308-redirects to it), so browsers are on www. The Google `redirectTo` is therefore `https://www.myhearthapp.ca/auth/callback?...` — and the Supabase allowlist only had `https://myhearthapp.ca/**`, which **does not match the www subdomain** (globs cover paths, not subdomains). Supabase discarded the return address, fell back to the Site URL (homepage), and the browser client silently completed the login there — signed in, wrong page, and our `/auth/callback` (with the Build 66 cookie fallback) never ran at all.
- **Fix in Supabase → Authentication → URL Configuration:** add `https://www.myhearthapp.ca/**` to Redirect URLs, and set Site URL to `https://www.myhearthapp.ca`.

### Changed
- `siteUrl()` default (and `.env.example`) now point at the canonical **www** host, so email links skip the apex→www redirect hop.

### Docs
- `Readme.md`, `Changelog.md` → Build 67.

---

## v0.1.0 — Build 66 (2026-07-10)

*Sign-in continuity: land back where you were, not on the homepage. Builds clean; lint passes.*

### Fixed
- **Signing in mid-flow (e.g. tapping ♡ Recommend while signed out) dropped people on the homepage** instead of returning them to what they were doing. Likely root cause is config — landing on the homepage *signed in* is the signature of Supabase discarding a `redirectTo` that isn't on its **Redirect URLs allowlist** and falling back to the Site URL. **Bhavna to verify:** Supabase → Authentication → URL Configuration → Redirect URLs contains exactly `https://myhearthapp.ca/**`.
- **Code hardening shipped regardless (belt & suspenders):**
  - The Google sign-in button stashes `next` in a **short-lived cookie** (10 min, single-use) in addition to the callback URL; `/auth/callback` reads the query first, then the cookie — continuity survives even if the query is lost across the OAuth round-trip.
  - The header **"Sign in" link now carries the current page** as `next` (was a bare `/signin`), so even a spontaneous sign-in returns you to the page you were reading.

### Docs
- `Readme.md`, `Changelog.md` → Build 66.

---

## v0.1.0 — Build 65 (2026-07-10)

*Linkify reaches the pricing fields. Builds clean; lint passes.*

### Fixed
- **A URL in the Pricing field wasn't clickable** (found on a live profile with a booking link in pricing). `Linkify` now also covers the **"Where & how" Pricing row** and the **price note on "What I offer" service rows** (which also lost its `shrink-0` so a pasted URL wraps instead of forcing the row wide).

### Docs
- `Readme.md`, `Changelog.md` → Build 65.

---

## v0.1.0 — Build 64 (2026-07-10)

*URLs pasted into profile text are now tappable links. Builds clean; lint passes.*

### Added
- **`Linkify` (`src/components/linkify.tsx`)** — renders free text with any `http(s)://` or `www.` URL as a real, safe link: display-time detection (so every **existing** profile benefits, no data change), no HTML injection (text split into React elements, never `dangerouslySetInnerHTML`), `target="_blank"` + `rel="noopener noreferrer nofollow"` (user content), trailing sentence punctuation kept out of the link, `break-all` so long URLs wrap.
- Applied on the **profile page**: description, bio, and service blurbs (where a Spotify or website link pasted into text was showing as dead text). Directory **cards deliberately keep plain text** — they're clamped one-line rows for scanning; the profile is where people engage.

### Docs
- `Design.md` (§5 profile bullet). `Readme.md`, `Changelog.md` → Build 64.

---

## v0.1.0 — Build 63 (2026-07-10)

*My practice gets tabs: editing and recommendations no longer share one long page. Builds clean; lint passes.*

### Changed
- **`/my-practice` is now tabbed:** **Edit practice** | **Recommendations** (with a gold count pip when any await approval). Bhavna's feedback after the first live approval: the moderation list stacked on top of the full edit form reads clunky, and with many kind words it would only get worse. Each concern now has its own view (`?view=recommendations`), scaling independently; the Recommendations tab also gets a proper empty state.
- **The notification email deep-links straight to the Recommendations tab** (`/my-practice?listing=<id>&view=recommendations`) — from inbox to Approve in one tap.

### Docs
- `Readme.md`, `Changelog.md` → Build 63.

---

## v0.1.0 — Build 62 (2026-07-10)

*First live testimonial test: pending recommendations were invisible to multi-listing owners. Fixed. Builds clean; lint passes.*

### Fixed
- **A pending recommendation was hidden if the owner account holds several listings** (Bhavna's test: the recommendation sat pending on "New listing" but `/my-practice` showed the multi-listing chooser, which had no approval UI and no hint anything was waiting). Two fixes:
  - The **chooser rows now show a gold badge** — "N recommendation(s) to approve" — via `getPendingTestimonialCounts()`, so waiting kind words are visible at a glance.
  - The **notification email now deep-links the exact listing** (`/my-practice?listing=<id>`), landing the owner directly in the right editor's approval section instead of the generic page.
- Verified against live data: the testimonial itself was stored correctly (pending, right target) — the flow worked; the visibility didn't.

### Docs
- `Readme.md`, `Changelog.md` → Build 62.

---

## v0.1.0 — Build 61 (2026-07-10)

*Practitioners get an email when someone recommends them; the DNS-outage lesson is written into the domain guide. Builds clean; lint passes.*

### Added
- **"Someone recommended you" email.** On a successful testimonial submission, the practitioner is emailed the kind words plus the approve link (`/my-practice`). Recipient logic: the **owner account's email** when the practice is claimed; otherwise the **listing's contact email** with a sign-in-and-claim nudge (turning an unapprovable recommendation into an adoption prompt). Sent via the single email path; a failed email never blocks the submission. **No change to migration `0009`** — run it as-is.
- **`sendEmail()`** in `src/lib/notify.ts` — the one outgoing-email function (any recipient); `notifyAdmins` is now a thin wrapper. Same transports (Resend preferred / Gmail SMTP / console fallback), same never-throws guarantee.

### Fixed — docs (the July 10 outage)
- **`Domain Setup.md` Part 1 rewritten:** DNS lives at Porkbun, records only; the "move nameservers to Vercel" option is replaced with an explicit ⚠️ never-do-this note — that switch abandoned the Porkbun zone (site + Resend records) and took the domain dark; reverting nameservers fixed it.

### Docs
- `Claude.md` (single-email-path note). `Readme.md`, `Changelog.md` → Build 61.

---

## v0.1.0 — Build 60 (2026-07-09)

*Accounts Phase C: testimonials ("Kind words"), plus the Luma-style embedded map on profiles. Builds clean; lint passes.*

### Added — testimonials (migration `0009` — run it in the Supabase SQL editor before testing)
- **The model** (reconciles Bhavna's profile-page flow with the "no open reviews" North Star): any **signed-in member** writes a recommendation from a practitioner's profile, and it becomes public **only when the practitioner approves it** — visitor-initiated, owner-curated, positive-by-construction. No ratings, no reply threads.
- **On the profile (`/p/[slug]`):** a **"Kind words"** card — approved testimonials with author names, plus a **♡ Recommend** button (empty state: "Be the first to recommend them"). The button is the sign-in gateway: signed-out visitors go through `/signin` and return.
- **`/recommend?p=<slug>`** — the writing page (20–600 chars, name prefilled from the account, "X approves recommendations before they appear").
- **`/my-practice`:** a **Recommendations** section for owners — pending ones with **Approve / No thanks**, approved ones with **Hide**.
- **`/my-recommendations`** (avatar menu) — everything a member wrote, with status ("waiting for their approval" / "on their profile"), and a Remove button.
- **Guardrails** (`submitTestimonial`): sign-in required · content-check hard-blocks links/promo · can't recommend your own practice · one per member per practitioner · target must be live. RLS: public read = approved-on-live only; all writes service-role with session verification (owner-ship checked for approve/hide, authorship for delete).

### Added — profile map (Luma-style)
- The **"Where & how"** card now embeds a **Google neighbourhood map** under the Location row (keyless embed, `mapsEmbedUrl()`, lazy-loaded, zoom fixed at neighbourhood level because practitioner coords are area-level by design — never a home address). Documented as the one deliberate third-party exception in `Security.md` §7.

### Docs
- `Product.md` (§6 trust model rewritten + pilot note), `Architecture.md` (table, routes), `Security.md` (§3 RLS + §7 privacy exception), `Claude.md` (testimonials section + migration list). `Readme.md`, `Changelog.md` → Build 60.

---

## v0.1.0 — Build 59 (2026-07-09)

*Category emoji matcher: gendered + community patterns (the "Men's/Women's Work snowflake" report). Builds clean; lint passes.*

### Fixed
- **"Men's Work" and "Women's Work" showed the ✻ fallback** — the `KEYWORD_ICONS` matcher deliberately skipped gendered patterns when built (Build 39). Added: **women/sister → 🌙**, **men/brother → ⛰️** (word-bounded so "Mentorship" and "Shamanic" don't false-match), plus **circle/community/gathering → 🤝** and **couple/relationship/intimacy → 💞** while in there. Verified against trap cases.

### Noted (no code)
- **Branded auth emails are fully possible** — Supabase → Authentication → Email Templates accepts custom subject + full HTML per template (confirm signup, reset password, …), sent via the Resend SMTP already configured. Deliberately deferred until the palette is chosen; then Claude writes inline-styled branded templates and Bhavna pastes them into the dashboard.

### Docs
- `Readme.md`, `Changelog.md` → Build 59.

---

## v0.1.0 — Build 58 (2026-07-09)

*Profile page tidy-up + the feedback form becomes a surfaced Support & feedback channel. Builds clean; lint passes.*

### Changed — practitioner profile (`/p/[slug]`)
- **New "Where & how" card** replaces the jumbled one-liner (`area · mode · languages · pricing` all mashed together). Labelled rows: **Location** (area + a **"Get directions →"** link that opens Google Maps in directions mode, using the listing's area-level coords when present — new `directionsUrl()` in `format.ts`), **Sessions** (In person / Online / Both), **Languages**, **Pricing** — each only when present.
- **Long-URL overflow fixed**: a pasted link in a description/bio/service blurb now wraps (`break-words`) instead of running past the phone's right edge.
- "Report this **listing**" → "Report this **profile**" (a Build 57 vocabulary straggler).

### Changed — Support & feedback (was the unlisted testing feedback form)
- `/feedback` is reworded as **"Support & feedback"** ("Need a hand, spotted a problem, or have an idea? It goes straight to the stewards…"). Type chips relabelled — "I need help" now sits second (maps to the existing `other` enum value; **no migration needed**), emojis dropped from the chips.
- **Surfaced subtly in the footer** — a single quiet "Support & feedback" link (the footer's only link; things in the header stay out of the footer). Hidden automatically when `FEEDBACK_ENABLED` is off, which also still 404s the page.

### Docs
- `Design.md` (§5 profile card), `Claude.md` (feedback section rewritten). `Readme.md`, `Changelog.md` → Build 58.

---

## v0.1.0 — Build 57 (2026-07-09)

*Vocabulary: your "practice", not your "listing". Builds clean; lint passes.*

### Changed
- **Member-facing copy now says "practice" everywhere** (Bhavna's catch: "listing" implies you can have several, contradicting the one-per-account rule, and clashing with "Add your practice"). The vocabulary is now three consistent layers, recorded in `Design.md` §3:
  - **practice** = the thing you own and edit ("My practice", "Edit my practice", "Delete my practice", "Your practice is linked to your account", "Manage your practice" on the manage-link page).
  - **profile** = its public page (`/p/slug`, "View your public profile" — unchanged).
  - **listing** = steward/admin language only (the admin panel manages many, so it stays accurate there).
- **Route renamed: `/my-listing` → `/my-practice`**, with a redirect (preserving the `?listing=` selection) so old links keep working. Header menu, success screens, gates, claim banners, and reset-password all point at the new route.
- **`/report` retitled "Report a concern"** (was "Report a listing" — a viewer-facing surface shouldn't use admin vocabulary, and it covers events too when they return).

### Docs
- `Design.md` (§3 vocabulary rule), `Claude.md` (route + naming convention). `Readme.md`, `Changelog.md` → Build 57.

---

## v0.1.0 — Build 56 (2026-07-09)

*One listing per account, and My listing now shows everything an account owns. Builds clean; lint passes.*

### Fixed
- **An account could create unlimited listings, but My listing showed only the newest** — the rest were stranded (found in Bhavna's testing). `/my-listing` now lists **every** listing the account owns: exactly one goes straight to the editor as before; several show a chooser (name + status badge + View/Open), each opening the full editor + delete via `?listing=<id>` (owner-verified server-side). So stray duplicates from testing are now visible and removable.

### Added — the one-listing-per-account rule
- **Decided: one listing per account.** A listing is the person's page; more offerings belong inside it (unlimited categories, the services menu, keywords), not in duplicates. Future events attach to the same account as separate objects (`host_practitioner_id`), so this doesn't constrain the events layer.
- Enforced twice: the **add page** shows a friendly gate ("You already have a listing → Edit my listing"; stewards handle a genuine second practice on request), and **`submitPractitioner`** rejects a second create as the backstop.
- **Claims stay permissive** on purpose — claiming a duplicate is how you get to delete it.

### Docs
- `Product.md` (practitioner persona), `Claude.md` (accounts conventions). `Readme.md`, `Changelog.md` → Build 56.

---

## v0.1.0 — Build 55 (2026-07-09)

*The private edit link is no longer shown after adding a practice (accounts made it obsolete there), and the footer sheds its redundant links. Builds clean; lint passes.*

### Changed
- **Success screen: no more "your private edit link" box.** Since adding a practice requires sign-in (Build 47), every new listing is account-owned — so the screen now says *"Your listing is linked to your account. Update it anytime from My listing."* The manage token is **no longer returned to the client at all** (`submitPractitioner` keeps it server-side; `manageToken` dropped from `FormState`) — one less secret in the browser. Manage links still exist for pre-account listings, and admins can still copy them from `/admin/listings`.
- **Footer: removed the link row** (Browse practitioners · Add your practice) added in Build 49 — it duplicated the header nav. Back to the calm sign-off: flame, gold rule, one warm line. Future footer candidates (an About page, community guidelines, a steward contact) wait until those destinations exist.

### Docs
- `Architecture.md` (owner-edit data flow), `Claude.md` (manage-token bullet: no longer surfaced publicly). `Readme.md`, `Changelog.md` → Build 55.

---

## v0.1.0 — Build 54 (2026-07-09)

*Accounts Phase A2: email/password sign-in, beside Google. Builds clean; lint passes.*

### Added
- **Email + password on `/signin`** (`EmailSignInForm`, under an "or with email" divider below Google). Three modes in one calm form:
  - **Sign in** (friendly error on a bad match).
  - **Create an account** — name + email + password (min 6); Supabase sends a **confirmation link** (no made-up addresses), which lands via `/auth/callback` and signs the person in. The name flows into `user_metadata.full_name`, which the `0008` trigger writes to the profile row.
  - **Forgot your password?** — sends a reset link → `/auth/callback` → **`/reset-password`** (new, session-gated, noindex): set a new password (`ResetPasswordForm`) with a "Go to My listing" success state. An expired/used link bounces to `/signin` with a specific, gentle message.
- All auth emails send from the verified domain via Supabase custom SMTP through Resend.

### Config (Bhavna, Domain Setup.md Part 4 — now unblocked)
1. Supabase → Project Settings → Auth → enable **Custom SMTP** (host `smtp.resend.com`, port `465`, user `resend`, password = Resend API key, sender `alerts@myhearthapp.ca`).
2. Authentication → Sign In / Providers → enable **Email** (keep **Confirm email ON**).
3. Test: create an account with a non-Google email; try the reset flow.

### Docs
- `Security.md` (§2), `Claude.md` (accounts bullet), `Domain Setup.md` (Part 4 marked ready + test step), `Google Sign-In Setup.md` (superseded "leave alone" note). `Readme.md`, `Changelog.md` → Build 54.

---

## v0.1.0 — Build 53 (2026-07-09)

*Hearth has a real address: myhearthapp.ca. Builds clean.*

### Changed
- **Canonical URL is now `https://myhearthapp.ca`** — `siteUrl()` (`src/lib/url.ts`) defaults to it, so steward-alert emails, share/copy-link buttons, and manage links all use the real domain. `hearthto.vercel.app` keeps working as an alias. `.env.example`, `Readme.md`, and the Google Sign-In guide's URL section updated.

### Added
- **`documentation/Domain Setup.md`** — Bhavna's click-by-click guide, in dependency order: **Part 1** attach the domain in Vercel (+ DNS options; do this first, links already point at the new domain) → **Part 2** Supabase URL configuration (Google Cloud needs no change) → **Part 3** verify the domain in Resend + set `RESEND_FROM` (unlocks steward alerts to any inbox / multiple admins) → **Part 4** Supabase custom SMTP via Resend (the prerequisite for email/password sign-in, wait for the build).

### Docs
- Doc maps (`Readme.md`, `Claude.md`) + memory updated. `Readme.md`, `Changelog.md` → Build 53.

---

## v0.1.0 — Build 52 (2026-07-09)

*10 more palettes: the white space of round three, with heart-and-earth colour brought back. Builds clean.*

### Added
- **Palettes 51–60, "Heart & earth, fresh (round four)"** on `/palette-explorations.html` (now 60 directions, six moods; root + `public/` in sync). Bhavna liked round three's white space but wants heart-and-earth themes that aren't dull — so: clean bright grounds, white cards, and **vivid warm accents**. The set: **Ember on white** (coral ember on gallery white), **Marigold** (festival gold + deep leaf), **Rosewood fresh** (raspberry rose on porcelain), **Terra & sky** (terracotta with sky-washed chips), **Fig & fern** (fruit purple + young green), **Saffron & oxblood** (spice-market heat), **Moss & poppy** (deep moss, one red heart), **Cacao & rose gold** (ceremony, brightened), **Clementine & juniper** (citrus + evergreen), **Garnet & birch** (jewel warmth, Nordic bones).
- All applyable via the one-block palette system in `globals.css`.

### Docs
- `Readme.md`, `Changelog.md` → Build 52.

---

## v0.1.0 — Build 51 (2026-07-09)

*10 more palette explorations in the opposite direction: cool, clean, fresh. Builds clean.*

### Added
- **Palettes 41–50, "Cool & fresh (round three)"** on `/palette-explorations.html` (page now: 50 directions, five moods; root + `public/` copies in sync). Deliberately the opposite pole of everything before it — no cream, no candlelight, no earth: cool clean backgrounds, white cards, crisp modern accents. The set: **Glacier** (ice + sky blue), **Gallery white** (white/near-black/one vermilion dot), **Nordic slate**, **Mint fresh**, **Periwinkle air**, **Graphite & citron** (the one cool-dark header), **Sea salt** (navy + driftwood), **Lavender fog**, **Paper & ink** (pure-white editorial + cobalt), **Aqua glass**.
- All are applyable via the Build 50 palette system (one-block swap in `globals.css`), including the light and white headers, thanks to the `on-night`/`on-gold` tokens.

### Docs
- `Readme.md`, `Changelog.md` → Build 51.

---

## v0.1.0 — Build 50 (2026-07-08)

*Trial reskin: the whole app now wears "Rice paper" (#29), plus a palette system that makes the next swap a one-block change. Builds clean; lint passes.*

### Added — the palette system (the reusable tool)
- **`src/app/globals.css` restructured**: a documented role legend, one **ACTIVE PALETTE** `@theme` block, and a **palette library** (the original "rich & sacred" values preserved in full). Reskinning the entire app — public pages, admin panel, forms, feedback, manage/my-listing — is now literally swapping that one block.
- **Two new semantic tokens** so palettes may make the "stage" (header/hero/footer/banners) dark *or* light: **`on-night`** (text/controls on stage surfaces — replaces the baked-in assumption that stage text is `cream`) and **`on-gold`** (text on gold fills — replaces `text-night` there). All `bg-white/5` hover overlays became `bg-on-night/5`, and stage gradients now stay within the `night`/`night-2` pair.
- **The logo flame is tokenized** (`flame-hi/mid/lo/core/glow`) — a reskin recolours the mark too.

### Changed — Rice paper trial skin (Build 50)
- Applied **Rice paper** across the board: near-white warm page, white cards, shoji-tint header/hero/footer with warm-brown text, green-tea primary (`forest`), pale-wood accents (`gold`), japandi calm. Swaps touched only stage-text call-sites (header, footer, home hero, recruitment banner, profile header band, admin bar, account control, logo); everything else reskins via tokens alone.
- **Known static exception:** the favicon (`src/app/icon.svg`) keeps the night/gold tile until a palette is final.

### Docs
- `Design.md` §3 rewritten (palette system + Rice paper trial; rich & sacred table kept as history), `Claude.md` (reskinning convention + the on-night/on-gold rules). `Readme.md`, `Changelog.md` → Build 50.

---

## v0.1.0 — Build 49 (2026-07-08)

*Three pieces of Bhavna's feedback: menu without emojis, footer copy reworded + quiet links, My-listing empty state decluttered. Builds clean; lint passes.*

### Changed
- **Account menu: no more emoji glyphs.** The "✎ / ↪" icons in the avatar menu felt off-brand; the rows are now plain, quiet typography ("My listing", "Sign out" in clay) — the panel design carries itself without icons.
- **Footer reworded** from "A volunteer-run community resource, offered in a spirit of respect, care, and mutual support" to **"Made with care by our community, in a spirit of respect and mutual support."** — keeps the warmth, drops the volunteer-run emphasis. Also added a quiet footer link row (**Browse practitioners · Add your practice**) so the footer earns its space.
- **My-listing empty state simplified:** removed the "added yourself before accounts existed? open your private edit link…" paragraph — with account sign-in, new listings are always account-linked, and the email-match claim card covers the pre-account cases; the edge case didn't earn a permanent paragraph. (The claim-by-manage-link path still works; it's just not advertised here.)

### Docs
- `Readme.md`, `Changelog.md` → Build 49.

---

## v0.1.0 — Build 48 (2026-07-08)

*Account menu: fixed the popup that never closed, and restyled it as a real menu. Builds clean; lint passes.*

### Fixed
- **The avatar popup stayed open after choosing an option** (and after clicking elsewhere). Cause: it was a native `<details>` element, which only toggles via its own summary. Rebuilt as a controlled popover that closes on **item selection, any outside click/tap, and Escape**, with proper menu semantics (`aria-haspopup`/`aria-expanded`/`role="menu"`).

### Changed
- **Menu aesthetics: panel, not pills** (Bhavna's feedback that stacked pill buttons read as form controls, not a menu). Now a modern account panel: an identity header (name + email) above quiet full-width **hover rows** ("✎ My listing", "↪ Sign out" in clay), rounded-2xl card, soft shadow. The avatar button gains a gold ring state while the menu is open.

### Docs
- `Readme.md`, `Changelog.md` → Build 48.

---

## v0.1.0 — Build 47 (2026-07-08)

*Accounts Phase B: own, claim, edit, and delete your listing from your account. Builds clean; lint passes.*

### Added
- **`/my-listing`** — the signed-in practitioner's home (also in the header avatar menu). Shows your listing in the full editor (reuses `ManageForm` by passing the listing's own token server-side — rendered only to the verified owner), a **"View your public profile"** link, and the delete option. Signed out → redirected to `/signin`.
- **Claim flows** for pre-account listings (`src/lib/actions/account.ts`, all re-verified server-side, unowned listings only):
  - On `/my-listing`: if an unowned listing's contact email matches your sign-in email, an **"Is this you?"** card offers one-tap claim (match re-derived from the session, never a client id).
  - On `/manage/<token>`: signed-in visitors see **"Link to my account"** (holding the token already proves edit rights, so linking is a strict upgrade). Once linked, the page notes it and points to My listing.
- **Owner delete** (`DeleteListing`) — the last open July 6 call item. A quiet danger zone on **both** edit surfaces (`/my-listing` and `/manage/<token>`) with an arm-then-confirm step; deletion is permanent (categories/services cascade) and lands on the directory. Token-authorized, same trust model as editing.
- **"Add your practice" now asks for sign-in first** — the just-in-time login moment from the UX plan: a warm gate card (sign in → returned straight to the form), so every new listing binds to its owner's account from day one. Browsing stays accountless.

### Docs
- `Security.md` (§2 Phase B bullet), `Architecture.md` (structure + Phase B entry), `Product.md` (practitioner persona + pilot note), `Claude.md` (owner-edit section rewritten for the account era). `Readme.md`, `Changelog.md` → Build 47.

---

## v0.1.0 — Build 46 (2026-07-08)

*Accounts Phase A: member sign-in with Google. Builds clean; lint passes.*

### Added
- **`/signin`** — a calm sign-in card with **Continue with Google** (`GoogleSignInButton`, Supabase OAuth) and honest copy ("Browsing Hearth never needs an account"). Already-signed-in visitors are forwarded to `?next=` (same-site paths only).
- **`/auth/callback`** — exchanges the OAuth code for a session (sets the auth cookies) and forwards to `next`; failures land back on `/signin` with a gentle error.
- **Header account control** (`AccountControl`) — "Sign in" when logged out; a small avatar (Google photo or initial) with a signed-in-as menu + Sign out when logged in. Deliberately **client-side**: reading the session server-side in the header would force every page dynamic (home is static since Build 39).
- **Migration `0008_public_accounts.sql`** — the safety prerequisite for opening sign-ups:
  - **Drops every `*_admin_all` policy** (practitioners, events, categories, join, reports, registrations, users, feedback, services). v1 treated `authenticated` as admin, safe only while admins were the only people who could sign in. Admin panel is unaffected (service role + `ADMIN_EMAILS` throughout).
  - **Ties `users` to `auth.users`** (`id` FK), adds **self read/update** policies (`auth.uid() = id`), and a **sign-up trigger** that auto-creates the profile row (Google name + avatar) with an exception guard so a profile hiccup can never block sign-up.
- **Owner binding on submit** — a signed-in "Add your practice" sets `owner_user_id` (ensuring the profile row exists first; falls back to unowned rather than blocking). Anonymous submissions unchanged.

### Changed
- **`src/middleware.ts`** now refreshes the session on **all** routes (was `/admin` only), excluding static assets — members carry sessions site-wide.

### Bhavna's next steps (in order)
1. Run migration `0008` in the Supabase SQL editor.
2. Supabase → Authentication → Settings → turn **"Allow new users to sign up" ON** (Part 3 of the setup guide, now safe).
3. Test on the live site: Sign in → Google → back to Hearth with your avatar in the header.

### Docs
- `Security.md` (§2 member sign-in + §3 de-privileged `authenticated`, Build 43 note updated), `Architecture.md` (structure, users live, Phase A entry), `Product.md` (principle evolved + pilot note), `Claude.md` (conventions + migration list), `Readme.md` (principles, migrations, Build 46), `Changelog.md`.

---

## v0.1.0 — Build 45 (2026-07-08)

*Accounts (v2) decisions locked + the config guide for Phase A. Docs only; builds clean.*

### Decided — public accounts (the July 6 call's big item)
- **Login gates contributing, never consuming.** Browse/search/contact stay open with no account; sign-in is required to add a practice, edit a listing, or leave a testimonial.
- **Google-only for the pilot.** Email/password is deferred until a domain is bought and verified in Resend (auth emails must deliver to any inbox; the onboarding sender can't, and `vercel.app` can't be domain-verified). Google OAuth sends no email, so it has no such dependency. The Google Cloud OAuth client is created under Bhavna's existing personal account (her new-Gmail phone cap is not a blocker).
- **Existing listings: claim by signing in** (email match, manage-link fallback); manage links keep working as a bridge. **Testimonials: solicited + positive only** (per `Product.md §6`), not open reviews.
- **UX shape:** a subtle header account control (Sign in ↔ avatar menu with "My listing") plus just-in-time sign-in at the point of action.

### Added
- **`documentation/Google Sign-In Setup.md`** — click-by-click config guide (Google Cloud OAuth client → Supabase provider → URL configuration), with the **load-bearing ordering rule**: public sign-ups stay OFF until migration `0008` de-privileges `authenticated` — v1 RLS (`*_admin_all` policies) treats any signed-in user as an admin, which was safe only while admins were the sole users who could sign in.

### Docs
- Doc maps updated (`Readme.md` repo layout, `Claude.md` document map). `Readme.md`, `Changelog.md` → Build 45.

---

## v0.1.0 — Build 44 (2026-07-08)

*"Hide listing" on the Reports page now gives clear feedback. Builds clean; lint passes.*

### Changed
- **Reports inbox: hiding a listing now resolves its report (and the card leaves the list).** Before, "Hide listing" hid the listing but the report stayed `open`, so the card didn't change — no signal the hide worked. Now it's a single combined action (`hideReportedListing`): it hides the target **and** marks the target's open reports `actioned`, so the card clears from the inbox — that disappearance is the feedback. `Dismiss` still clears flags without hiding (records `dismissed`). Copy updated to explain the two paths.
- **Each report card shows the target's status badge** (live / hidden / pending), so if a reported listing is already hidden it's obvious, and the redundant "Hide listing" button is omitted for an already-hidden target.
- The combined action also **surfaces DB errors** (it can't silently no-op) and revalidates the public + listings/events pages so the hide propagates everywhere at once.

*(This is the Reports-side follow-up to Build 43, which fixed hidden listings still showing on the public site. The plain "Hide" on the Listings tab is unchanged — there the row stays so you can restore it.)*

### Docs
- `Architecture.md`, `Design.md` (admin reports inbox). `Readme.md`, `Changelog.md` → Build 44.

---

## v0.1.0 — Build 43 (2026-07-08)

*Real fix for "Hide doesn't remove a listing from the live site." Builds clean; lint passes.*

### Fixed
- **Hidden practitioners still appeared on the public directory — for a signed-in admin.** Hiding set `status = 'hidden'` correctly (the button flips to Publish), but the listing stayed on `/practitioners` when viewed **while logged into the admin panel**. Root cause: `getPractitioners` (and `getEvents`) filtered status via **RLS only**, with no explicit `.eq("status","live")`. RLS is viewer-dependent — the public server client uses the anon key **plus the visitor's session cookie**, so a logged-in admin is `authenticated`, and the `practitioners_admin_all` policy (`for all to authenticated using (true)`) grants them **every** status. So an admin saw hidden/pending rows that a real (logged-out) visitor never did. Confirmed: the anon key correctly hides them; the admin-level view (service role) leaked them.
  - Fix: both public reads now filter **`status = 'live'` explicitly in the query** (matching `getPractitionerBySlug`/`getEventsByHost`, which already did), so the public list is correct no matter who's viewing. RLS stays as the anon backstop. Verified the filtered query excludes the hidden row even for an admin-level viewer.
  - The **Reports tab "Hide listing"** button was never broken — it calls the same (working) hide action. It looked inert for the same reason, and because the report card stays in the inbox until you separately click **Dismiss reports** (that split is intentional: hiding a listing and clearing its flags are distinct steward decisions).

### Docs
- `Security.md` (§3 — RLS is viewer-dependent; public reads filter status explicitly), `Claude.md` (two-clients gotcha), `Bugs.md` (logged as Resolved, 🔴). `Readme.md`, `Changelog.md` → Build 43.

---

## v0.1.0 — Build 42 (2026-07-08)

*Category chips now show whether they're selected, not just a colour change. Builds clean; lint passes.*

### Changed
- **Category picker: explicit selection marker.** The chips relied on colour-fill alone to show selection, which is ambiguous (a filled pill can read as a button, not a choice) and leans entirely on colour (an accessibility gap). Each chip now shows a marker: an unselected chip a muted **`＋`** ("tap to add"), a selected one a **`✓`** with the forest fill. Applied to **both** the add-practitioner form and the manage (owner/admin) edit form. The chip is still a real `<input type="checkbox">` — hidden and used as a `peer` so the marker reflects its `:checked` state — so nothing changed about how categories submit; this is purely the visual affordance. *(Kept chips over reverting to a checkbox grid: with the 3-category cap gone people may pick many, so the compact layout matters more, not less.)*

### Docs
- `Design.md` (§5 Forms — chip selection marker). `Readme.md`, `Changelog.md` → Build 42.

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
