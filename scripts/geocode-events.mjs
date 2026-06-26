// Hearth — backfill geocoding for existing rows.
// Geocodes events (from location_text) and practitioners (from area) that have a
// location but no coordinates yet, via the free OpenStreetMap Nominatim API.
// Respects Nominatim's ~1 req/sec policy and caches repeated addresses.
//
// Run with:  npm run geocode
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const USER_AGENT =
  "Hearth Community Hub (https://github.com/bhavnasharma01/Hearth)";

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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cache = new Map();

// Venue names and postal codes confuse Nominatim — produce cleaner fallbacks.
function addressVariants(raw) {
  const s = raw.trim();
  const noPostal = s
    .replace(/\b[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d\b/g, "")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .replace(/,\s*$/, "")
    .trim();
  const stripVenue = (str) => {
    const parts = str.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2 && !/\d/.test(parts[0]) && /\d/.test(parts[1])) {
      return parts.slice(1).join(", ");
    }
    return str;
  };
  const out = [stripVenue(noPostal), noPostal, s];
  if (!/\d/.test(s) && !/canada/i.test(s)) out.push(`${s}, Ontario, Canada`);
  return [...new Set(out.filter(Boolean))];
}

async function geocodeOnce(query) {
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2` +
    `&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
  });
  await sleep(1100); // be polite to Nominatim (≤1 req/sec)
  if (!res.ok) return null;
  const data = await res.json();
  return data[0]
    ? { lat: Number.parseFloat(data[0].lat), lng: Number.parseFloat(data[0].lon) }
    : null;
}

async function geocode(raw) {
  const key = raw.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key);
  let hit = null;
  for (const variant of addressVariants(raw)) {
    hit = await geocodeOnce(variant);
    if (hit) break;
  }
  cache.set(key, hit);
  return hit;
}

async function backfill(table, column) {
  const { data, error } = await supabase
    .from(table)
    .select(`id, ${column}`)
    .not(column, "is", null)
    .is("latitude", null);
  if (error) throw new Error(`${table} read: ${error.message}`);
  if (!data || data.length === 0) {
    console.log(`${table}: nothing to geocode.`);
    return;
  }
  console.log(`${table}: geocoding ${data.length} row(s) from "${column}"…`);

  let ok = 0;
  for (const row of data) {
    const value = row[column];
    const hit = await geocode(value);
    if (!hit) {
      console.log(`  · no match: ${value}`);
      continue;
    }
    const { error: upErr } = await supabase
      .from(table)
      .update({
        latitude: hit.lat,
        longitude: hit.lng,
        geocoded_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    if (upErr) console.log(`  · update failed (${row.id}): ${upErr.message}`);
    else ok++;
  }
  console.log(`${table}: geocoded ${ok}/${data.length}.`);
}

await backfill("events", "location_text");
await backfill("practitioners", "area");
console.log("\n✅ Backfill complete.");
