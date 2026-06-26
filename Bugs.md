# Bugs & Issues

*Known bugs, risks, and issues spotted while thinking or building. Newest at top. Tick items off as they're resolved; note the build that fixed them.*

**Legend:** 🔴 blocker · 🟠 important · 🟡 nice-to-fix · 🔵 risk/watchlist (not yet a bug)

---

## Open

*No application code exists yet (v0.1.0, Build 1 — documentation phase), so there are no runtime bugs. The items below are risks and must-dos to design against from the first line of code.*

- [x] 🔵 **RLS must exist before any public write path ships.** *(Build 3)* Policies written in `0001_initial_schema.sql`: anon is **read-only, live-only**; admins get full access; public writes will use the service role. Still verify against the live project once connected.
- [x] 🔵 **Server-controlled status.** *(Build 4)* `status`/`auto_check` are set inside the service-role server actions (`src/lib/actions/*`) from the content-check; never accepted from the client.
- [ ] 🟠 **Public-form spam/bot flood.** *(Forms now live in Build 4.)* The submission forms have a content-check but **no rate-limiting or bot check yet** — add a honeypot field + per-IP throttle before public launch.
- [ ] 🔵 **Stored XSS in user text.** Descriptions/bios/event text are user-supplied; ensure they're escaped on render and never injected via `dangerouslySetInnerHTML`.
- [ ] 🔵 **Service-role key leakage.** Must never reach the client bundle; restrict to server actions/scripts.
- [x] 🔵 **Google Calendar API key scope.** *(Build 5)* N/A — import reads the public iCal feed, no key.
- [x] 🔵 **Seed-import dedupe correctness.** *(Build 5)* Import skips existing `external_id`s (verified: a second run inserts 0). Recurring occurrences keyed `UID:<occurrenceISO>`.
- [ ] 🟡 **Recurring-event horizon.** Recurring series are expanded only 120 days out; a periodic re-run of `import:calendar` is needed to keep the far future populated (or add a scheduled job later).
- [ ] 🔵 **Sybil limits of no-login flagging.** Acknowledged & accepted for v1 (dedupe + human-in-loop + no auto-action). Revisit if abuse escalates; v2 accounts raise the bar.

---

## Resolved

*(none yet)*
