import "server-only";
import { createClient } from "@supabase/supabase-js";
import {
  buildIcsUrl,
  parseIcsToRows,
  dedupAndInsert,
  resetImported,
  type ImportSummary,
} from "./ics-core.mjs";

/**
 * Run the Google Calendar import using the shared core. Reads env from
 * process.env (Vercel/Next runtime). Used by the cron route — and safe to
 * trigger manually. Service-role client (writes), so this is server-only.
 */
export async function runCalendarImport(
  opts: { reset?: boolean } = {},
): Promise<ImportSummary> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!url || !serviceKey || !calendarId) {
    throw new Error("Missing Supabase or calendar env vars.");
  }
  const importFromISO = `${process.env.EVENT_IMPORT_FROM || "2026-01-01"}T00:00:00Z`;

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  if (opts.reset) await resetImported(supabase);

  const res = await fetch(buildIcsUrl(calendarId));
  if (!res.ok) throw new Error(`ICS fetch failed: HTTP ${res.status}`);
  const rows = parseIcsToRows(await res.text(), {
    importFromISO,
    nowISO: new Date().toISOString(),
  });

  return dedupAndInsert(supabase, rows);
}
