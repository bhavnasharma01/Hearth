# Bugs & Issues

*Known bugs, risks, and issues spotted while thinking or building. Newest at top. Tick items off as they're resolved; note the build that fixed them.*

**Legend:** 🔴 blocker · 🟠 important · 🟡 nice-to-fix · 🔵 risk/watchlist (not yet a bug)

---

## Open

- [ ] 🟠 **Public-write spam/bot flood.** The public write paths (`/add-practitioner`, `/report`, `/feedback`) run a content-check on submissions but have **no rate-limiting or bot check yet** — add a honeypot field + per-IP throttle before wide public launch.
- [ ] 🔵 **Avatar upload is an unauthenticated write path.** `uploadAvatar` (service-role) is callable by anyone (no login) — it validates image type + caps size at 2 MB, but a script could still fill the `avatars` bucket. Fine for the small pilot (free tier is 1 GB); add rate-limiting / a bot check + periodic orphan-file cleanup before wide launch. *(Build 24.)*
- [ ] 🔵 **Steward alerts reach only one inbox (testing setup).** On Resend's onboarding sender, alert emails deliver only to the Resend-account address until a domain is verified; add a second admin and sends fail. Verify a domain, or switch to Gmail SMTP, before onboarding more stewards. *(See `Claude.md` → "Steward email alerts".)*
- [ ] 🟡 **`middleware.ts` → `proxy.ts` deprecation.** Next.js warns on every build that the `middleware` file convention is deprecated in favour of `proxy`. Rename `src/middleware.ts` (and its `config` matcher) before a future Next major; cosmetic today.
- [x] 🟡 **Recurring-event horizon.** *(Build 9)* The daily Vercel Cron import (`/api/cron/import`) re-runs automatically, keeping the 120-day recurrence window fresh.
- [x] 🟡 **Cron-imported events aren't geocoded.** *(Build 10)* The daily cron now runs `geocodePending` after the import — geocoding new addressed events + practitioners (capped 20/run, throttled ~1/sec), so they join "near me" automatically.
- [ ] 🔵 **Stored XSS in user text.** Descriptions/bios/event text are user-supplied; keep them escaped on render (React does this by default) and never inject via `dangerouslySetInnerHTML`. Imported HTML is stripped at import time.
- [ ] 🔵 **Service-role key leakage.** Must never reach the client bundle; it's confined to server actions/scripts (`server-only` guard on `src/lib/supabase/admin.ts`). The key was shared in chat during setup — rotate it before wide launch.
- [ ] 🔵 **Sybil limits of no-login flagging.** Accepted for v1 (dedupe + human-in-loop + no auto-action). Revisit if abuse escalates; v2 accounts raise the bar.

---

## Resolved

- [x] 🟠 **Category picker let you tick more than 3, then blocked the submit.** *(Build 39)* The "up to 3" cap lived only in the server actions, so the form happily accepted more selections and then failed on submit (bit at least two testers). Per the July 6 call decision the cap is **removed entirely**: both `submitPractitioner` and `updateListing` now require only ≥ 1 category, and the form hint reads "choose all that apply."
- [x] 🟠 **Instagram button went to a broken link.** *(Build 26)* A practitioner usually enters a handle (`@sarah` / `sarah`), and the contact button used `externalHref`, producing `https://sarah` (a dead link). Added `instagramUrl()` — normalizes a handle, `instagram.com/handle`, or a full URL into `https://instagram.com/<handle>`; used on the card + profile.
- [x] 🟠 **Instagram-only listings were blocked.** *(Build 17)* The at-least-one-contact rule (app validation + DB `CHECK`) counted WhatsApp/Email/Website but **not** Instagram, while the add-practitioner form grouped all four as "at least one required" — so an Instagram-only submit failed. Instagram now counts, in both the validation and the constraint (migration `0003_instagram_contact.sql`).
- [x] 🟠 **Practitioners could vanish from "near me".** *(Build 16)* `area` was optional, so a location-less (or ungeocodable) listing never got coordinates and dropped out of distance search. `area` is now required and entered via the type-ahead `AddressAutocomplete`, which pins area-level coords on submit.
- [x] 🟡 **No way to grab a shareable profile link.** *(Build 15)* Profiles were shareable URLs but had no copy affordance, and the "you're live" screen didn't reveal the link. Added a `ShareButton` (native share / copy) on the profile and the success screen.
- [x] 🟠 **"Near me" showed one recurring event repeated.** *(Build 8)* Imported recurring events are stored as one row per occurrence, so the two addressed weekly yoga series (14 + 15 rows) dominated the distance-sorted list. Fixed by collapsing each series to its next upcoming occurrence in `getEvents` (`collapseSeries`, keyed by the `external_id` UID prefix). Also declutters the time agenda.
- [x] 🟠 **Raw `href`/HTML in imported event descriptions.** *(Build 6)* Import strips HTML, decodes entities, extracts the link from `<a href>`.
- [x] 🔵 **RLS before any public write path.** *(Build 3)* `0001_initial_schema.sql`: anon read-only & live-only; admins full; public writes via service role.
- [x] 🔵 **Server-controlled status.** *(Build 4)* `status`/`auto_check` set in the service-role server actions from the content-check; never from the client.
- [x] 🔵 **Google Calendar API key scope.** *(Build 5)* N/A — import reads the public iCal feed, no key.
- [x] 🔵 **Seed-import dedupe.** *(Build 5)* Skips existing `external_id`s (a second run inserts 0).
