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
- [ ] 🔵 **Google Calendar API key scope.** Restrict to the production domain; read-only.
- [ ] 🔵 **Seed-import dedupe correctness.** Re-running the import must not duplicate events — enforce uniqueness on `external_id` (+ `source`).
- [ ] 🔵 **Sybil limits of no-login flagging.** Acknowledged & accepted for v1 (dedupe + human-in-loop + no auto-action). Revisit if abuse escalates; v2 accounts raise the bar.

---

## Resolved

*(none yet)*
