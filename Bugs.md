# Bugs & Issues

*Known bugs, risks, and issues spotted while thinking or building. Newest at top. Tick items off as they're resolved; note the build that fixed them.*

**Legend:** 🔴 blocker · 🟠 important · 🟡 nice-to-fix · 🔵 risk/watchlist (not yet a bug)

---

## Open

*No application code exists yet (v0.1.0, Build 1 — documentation phase), so there are no runtime bugs. The items below are risks and must-dos to design against from the first line of code.*

- [x] 🔵 **RLS must exist before any public write path ships.** *(Build 3)* Policies written in `0001_initial_schema.sql`: anon is **read-only, live-only**; admins get full access; public writes will use the service role. Still verify against the live project once connected.
- [ ] 🔵 **Server-controlled status.** When the write paths land, `status`/`auto_check` must be set in the service-role server action, never accepted from the client, or the content-check gate is bypassable.
- [ ] 🔵 **Public-form spam/bot flood.** No-login forms invite spam. Need rate-limiting + a lightweight bot check (honeypot/hCaptcha) before launch.
- [ ] 🔵 **Stored XSS in user text.** Descriptions/bios/event text are user-supplied; ensure they're escaped on render and never injected via `dangerouslySetInnerHTML`.
- [ ] 🔵 **Service-role key leakage.** Must never reach the client bundle; restrict to server actions/scripts.
- [ ] 🔵 **Google Calendar API key scope.** Restrict to the production domain; read-only.
- [ ] 🔵 **Seed-import dedupe correctness.** Re-running the import must not duplicate events — enforce uniqueness on `external_id` (+ `source`).
- [ ] 🔵 **Sybil limits of no-login flagging.** Acknowledged & accepted for v1 (dedupe + human-in-loop + no auto-action). Revisit if abuse escalates; v2 accounts raise the bar.

---

## Resolved

*(none yet)*
