/**
 * Feature flags — small, deliberate switches for piloting.
 *
 * `EVENTS_ENABLED` gates the entire public Events layer. For the initial pilot
 * we're launching **practitioners only**; events are hidden everywhere on the
 * public site (nav, home, profile "events they host", the /events and
 * /add-event routes, and the daily import cron) but no code is deleted — flip
 * this to `true` to bring the whole events layer back with one change.
 *
 * Admin-side event management is intentionally left untouched: it lives behind
 * auth, shows nothing to the public, and stays ready for when events return.
 */
export const EVENTS_ENABLED = false;
