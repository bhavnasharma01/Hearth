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

/**
 * `FEEDBACK_ENABLED` gates the private user-testing feedback form at `/feedback`
 * (an unlisted link — never in the public nav). It's **on** during the testing
 * phase so invited practitioners can log feedback; flip it to `false` at public
 * launch and the page 404s. The admin feedback board (`/admin/feedback`) stays
 * available regardless, so past feedback is never lost.
 */
export const FEEDBACK_ENABLED = true;
