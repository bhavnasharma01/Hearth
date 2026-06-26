// Shared Google-Calendar-import core (pure JS, no Next/server-only deps) so the
// standalone script (scripts/import-calendar.mjs) and the cron route
// (src/lib/import/calendar.ts → /api/cron/import) use ONE implementation.
//
// Reads the calendar's PUBLIC iCal feed (no API key). Non-recurring events are
// imported from EVENT_IMPORT_FROM forward; recurring series are expanded into
// upcoming occurrences (today → +HORIZON days), each keyed external_id
// `UID:<occurrenceISO>`. Dedupe is by (source, external_id).
import ical from "node-ical";

const HORIZON_DAYS = 120;
const ONLINE_HINT = /\b(zoom|online|virtual|meet\.google|livestream|webinar)\b/i;

export function buildIcsUrl(calendarId) {
  return `https://calendar.google.com/calendar/ical/${encodeURIComponent(
    calendarId,
  )}/public/basic.ics`;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

/** ICS descriptions often contain HTML (<a href>) — convert to clean text and
 *  pull out the registration link, so users never see raw markup. */
function cleanDescription(raw) {
  if (!raw) return { text: null, link: null };
  const href = raw.match(/href=["']?(https?:\/\/[^"'\s>]+)/i);
  let text = raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  text = decodeEntities(text)
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
  const inText = text.match(/https?:\/\/[^\s]+/);
  const link = (href && href[1]) || (inText && inText[0]) || null;
  if (link) text = text.split(link).join(" ").replace(/[ \t]+/g, " ").trim();
  if (text.replace(/[\s|·,–-]/g, "") === "") text = "";
  return { text: text ? text.slice(0, 600) : null, link };
}

function inferMode(...parts) {
  return ONLINE_HINT.test(parts.filter(Boolean).join(" ")) ? "online" : "in_person";
}

function buildRow(externalId, start, end, summary, rawDesc, location, rrule) {
  const { text: descText, link: url } = cleanDescription(rawDesc);
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

/** Parse ICS text into event rows ready to insert. */
export function parseIcsToRows(
  icsText,
  { importFromISO, nowISO, horizonDays = HORIZON_DAYS },
) {
  const importFrom = new Date(importFromISO);
  const now = new Date(nowISO);
  const horizon = new Date(now.getTime() + horizonDays * 86400000);
  const recurFrom = new Date(now.getTime() - 86400000);
  const data = ical.sync.parseICS(icsText);

  const rows = [];
  const seen = new Set();
  const push = (row) => {
    if (seen.has(row.external_id)) return;
    seen.add(row.external_id);
    rows.push(row);
  };

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
      const from = new Date(Math.max(importFrom.getTime(), recurFrom.getTime()));
      const occurrences = ev.rrule.between(from, horizon, true);
      const exdates = ev.exdate
        ? Object.values(ev.exdate).map((d) =>
            new Date(d).toISOString().slice(0, 10),
          )
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

  return rows;
}

/** Delete all previously-imported calendar events (for a clean re-import). */
export async function resetImported(supabase) {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("source", "google_calendar");
  if (error) throw new Error(`reset: ${error.message}`);
}

/** Insert the rows that aren't already imported (deduped by external_id). */
export async function dedupAndInsert(supabase, rows) {
  const { data: existing, error } = await supabase
    .from("events")
    .select("external_id")
    .eq("source", "google_calendar");
  if (error) throw new Error(`read existing: ${error.message}`);

  const have = new Set((existing ?? []).map((r) => r.external_id));
  const fresh = rows.filter((r) => !have.has(r.external_id));

  let inserted = 0;
  for (let i = 0; i < fresh.length; i += 500) {
    const chunk = fresh.slice(i, i + 500);
    const { error: insErr } = await supabase.from("events").insert(chunk);
    if (insErr) throw new Error(`insert chunk: ${insErr.message}`);
    inserted += chunk.length;
  }
  return { candidates: rows.length, alreadyImported: have.size, inserted };
}
