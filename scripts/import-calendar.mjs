// Hearth — Google Calendar import (see documentation/Architecture.md §6).
//
// Reads the PUBLIC iCal feed of the community calendar (no API key needed) and
// inserts events into Supabase with source='google_calendar', deduped by
// external_id so it is safe to re-run during the transition period.
//
//   Non-recurring events: imported from EVENT_IMPORT_FROM forward (archive + future).
//   Recurring events:     expanded into upcoming occurrences (today → +HORIZON days).
//
// Run with:  npm run import:calendar
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import ical from "node-ical";

const HORIZON_DAYS = 120;
const ONLINE_HINT = /\b(zoom|online|virtual|meet\.google|livestream|webinar)\b/i;

// --- env (.env.local) ---
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const calendarId = env.GOOGLE_CALENDAR_ID;
const importFrom = new Date(`${env.EVENT_IMPORT_FROM || "2026-01-01"}T00:00:00Z`);
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const now = new Date();
const horizon = new Date(now.getTime() + HORIZON_DAYS * 86400000);
const recurFrom = new Date(now.getTime() - 86400000); // include something starting today

const icsUrl = `https://calendar.google.com/calendar/ical/${encodeURIComponent(
  calendarId,
)}/public/basic.ics`;

function firstUrl(text) {
  const m = text.match(/https?:\/\/[^\s]+/);
  return m ? m[0] : null;
}

function inferMode(...parts) {
  return ONLINE_HINT.test(parts.filter(Boolean).join(" ")) ? "online" : "in_person";
}

function buildRow(externalId, start, end, summary, rawDesc, location, rrule) {
  const url = rawDesc ? firstUrl(rawDesc) : null;
  // If the description is only the URL, don't duplicate it as description text.
  const descText =
    rawDesc && url && rawDesc.replace(url, "").trim() === ""
      ? null
      : rawDesc || null;
  return {
    external_id: externalId,
    title: summary.slice(0, 300),
    description: descText,
    registration_link: url,
    location_text: location,
    start_at: start.toISOString(),
    end_at: end ? end.toISOString() : null,
    mode: inferMode(location, descText, url),
    recurrence_rule: rrule ? rrule.replace(/^RRULE:/, "") : null,
    status: "live",
    source: "google_calendar",
  };
}

async function main() {
  console.log(`Fetching ${icsUrl}`);
  const res = await fetch(icsUrl);
  if (!res.ok) throw new Error(`ICS fetch failed: HTTP ${res.status}`);
  const data = ical.sync.parseICS(await res.text());

  const rows = [];
  const seen = new Set();
  const push = (row) => {
    if (seen.has(row.external_id)) return;
    seen.add(row.external_id);
    rows.push(row);
  };

  let recurringCount = 0;
  for (const ev of Object.values(data)) {
    if (ev.type !== "VEVENT" || !ev.uid || !ev.start) continue;
    const summary = (ev.summary || "").toString().trim();
    if (!summary) continue;
    const rawDesc = (ev.description || "").toString().trim();
    const location = (ev.location || "").toString().trim() || null;
    const start = new Date(ev.start);
    const end = ev.end ? new Date(ev.end) : null;
    const durationMs = end ? end.getTime() - start.getTime() : null;

    if (ev.rrule) {
      recurringCount++;
      const from = new Date(Math.max(importFrom.getTime(), recurFrom.getTime()));
      const occurrences = ev.rrule.between(from, horizon, true);
      const exdates = ev.exdate
        ? Object.values(ev.exdate).map((d) => new Date(d).toISOString().slice(0, 10))
        : [];
      for (const occ of occurrences) {
        const dayKey = occ.toISOString().slice(0, 10);
        if (exdates.includes(dayKey)) continue;
        let oStart = occ;
        let oEnd = durationMs ? new Date(occ.getTime() + durationMs) : null;
        let oSummary = summary;
        let oDesc = rawDesc;
        let oLoc = location;
        const override = ev.recurrences && ev.recurrences[dayKey];
        if (override) {
          oStart = new Date(override.start);
          oEnd = override.end ? new Date(override.end) : oEnd;
          oSummary = (override.summary || summary).toString().trim();
          oDesc = (override.description || rawDesc).toString().trim();
          oLoc = (override.location || location || "").toString().trim() || null;
        }
        push(
          buildRow(
            `${ev.uid}:${oStart.toISOString()}`,
            oStart,
            oEnd,
            oSummary,
            oDesc,
            oLoc,
            ev.rrule.toString(),
          ),
        );
      }
    } else if (start >= importFrom) {
      push(buildRow(ev.uid, start, end, summary, rawDesc, location, null));
    }
  }

  console.log(
    `Parsed ${rows.length} candidate rows (${recurringCount} recurring series expanded).`,
  );

  // Dedupe against what's already imported.
  const { data: existing, error: exErr } = await supabase
    .from("events")
    .select("external_id")
    .eq("source", "google_calendar");
  if (exErr) throw new Error(`read existing: ${exErr.message}`);
  const have = new Set((existing ?? []).map((r) => r.external_id));
  const fresh = rows.filter((r) => !have.has(r.external_id));
  console.log(`${have.size} already imported; ${fresh.length} new to insert.`);

  // Insert in chunks.
  let inserted = 0;
  for (let i = 0; i < fresh.length; i += 500) {
    const chunk = fresh.slice(i, i + 500);
    const { error } = await supabase.from("events").insert(chunk);
    if (error) throw new Error(`insert chunk: ${error.message}`);
    inserted += chunk.length;
    process.stdout.write(`  inserted ${inserted}/${fresh.length}\r`);
  }
  console.log(`\n✅ Import complete. Inserted ${inserted} new events.`);

  const upcoming = fresh.filter((r) => new Date(r.start_at) >= now).length;
  console.log(`   (${upcoming} of them are upcoming and will show on /events.)`);
}

main().catch((e) => {
  console.error("\n❌ Import failed:", e.message);
  process.exit(1);
});
