// Hearth — Google Calendar import (standalone / local runs).
// Uses the SHARED core (src/lib/import/ics-core.mjs) — the same code the daily
// Vercel Cron route runs — so there's a single implementation. Reads .env.local.
//
//   npm run import:calendar            # import new events
//   node scripts/import-calendar.mjs --reset   # clear + re-import
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  buildIcsUrl,
  parseIcsToRows,
  dedupAndInsert,
  resetImported,
} from "../src/lib/import/ics-core.mjs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const calendarId = env.GOOGLE_CALENDAR_ID;
const importFromISO = `${env.EVENT_IMPORT_FROM || "2026-01-01"}T00:00:00Z`;

if (process.argv.includes("--reset")) {
  await resetImported(supabase);
  console.log("Reset: cleared existing google_calendar events.");
}

const url = buildIcsUrl(calendarId);
console.log(`Fetching ${url}`);
const res = await fetch(url);
if (!res.ok) throw new Error(`ICS fetch failed: HTTP ${res.status}`);

const rows = parseIcsToRows(await res.text(), {
  importFromISO,
  nowISO: new Date().toISOString(),
});
console.log(`Parsed ${rows.length} candidate rows.`);

const { alreadyImported, inserted } = await dedupAndInsert(supabase, rows);
console.log(`${alreadyImported} already imported; inserted ${inserted} new.`);
console.log("✅ Import complete.");
