# Bugs & Issues

*Known bugs, risks, and issues spotted while thinking or building. Newest at top. Tick items off as they're resolved; note the build that fixed them.*

**Legend:** 🔴 blocker · 🟠 important · 🟡 nice-to-fix · 🔵 risk/watchlist (not yet a bug)

---

## Open

- [ ] 🟠 **Public-form spam/bot flood.** The submission forms have a content-check but **no rate-limiting or bot check yet** — add a honeypot field + per-IP throttle before wide public launch.
- [ ] 🟡 **Recurring-event horizon.** Recurring series are expanded only 120 days out; `import:calendar` must be re-run periodically to keep the far future populated. *(Planned: the Build-8+ Vercel Cron auto-import addresses this.)*
- [ ] 🔵 **Stored XSS in user text.** Descriptions/bios/event text are user-supplied; keep them escaped on render (React does this by default) and never inject via `dangerouslySetInnerHTML`. Imported HTML is stripped at import time.
- [ ] 🔵 **Service-role key leakage.** Must never reach the client bundle; it's confined to server actions/scripts (`server-only` guard on `src/lib/supabase/admin.ts`). The key was shared in chat during setup — rotate it before wide launch.
- [ ] 🔵 **Sybil limits of no-login flagging.** Accepted for v1 (dedupe + human-in-loop + no auto-action). Revisit if abuse escalates; v2 accounts raise the bar.

---

## Resolved

- [x] 🟠 **"Near me" showed one recurring event repeated.** *(Build 8)* Imported recurring events are stored as one row per occurrence, so the two addressed weekly yoga series (14 + 15 rows) dominated the distance-sorted list. Fixed by collapsing each series to its next upcoming occurrence in `getEvents` (`collapseSeries`, keyed by the `external_id` UID prefix). Also declutters the time agenda.
- [x] 🟠 **Raw `href`/HTML in imported event descriptions.** *(Build 6)* Import strips HTML, decodes entities, extracts the link from `<a href>`.
- [x] 🔵 **RLS before any public write path.** *(Build 3)* `0001_initial_schema.sql`: anon read-only & live-only; admins full; public writes via service role.
- [x] 🔵 **Server-controlled status.** *(Build 4)* `status`/`auto_check` set in the service-role server actions from the content-check; never from the client.
- [x] 🔵 **Google Calendar API key scope.** *(Build 5)* N/A — import reads the public iCal feed, no key.
- [x] 🔵 **Seed-import dedupe.** *(Build 5)* Skips existing `external_id`s (a second run inserts 0).
