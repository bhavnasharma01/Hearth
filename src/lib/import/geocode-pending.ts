import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { geocodeAddress } from "@/lib/geocode";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface GeocodeRunSummary {
  attempted: number;
  geocoded: number;
}

/**
 * Geocode rows that have a location but no coordinates yet — events (from
 * `location_text`) and practitioners (from `area`). Runs after the daily import
 * so freshly-imported events join "near me" automatically.
 *
 * Capped at `maxPerRun` addresses (the rest are picked up on the next run) and
 * throttled ~1/sec to respect Nominatim. Reuses `geocodeAddress` (same cleaning
 * + fallbacks as the submit path). A repeated address is geocoded once.
 */
export async function geocodePending(maxPerRun = 20): Promise<GeocodeRunSummary> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { attempted: 0, geocoded: 0 };

  const cache = new Map<string, { lat: number; lng: number } | null>();
  let attempted = 0;
  let geocoded = 0;

  async function processTable(table: "events" | "practitioners", column: string) {
    if (attempted >= maxPerRun) return;
    const { data, error } = await supabase!
      .from(table)
      .select(`id, ${column}`)
      .not(column, "is", null)
      .is("latitude", null)
      .limit(maxPerRun);
    if (error || !data) return;

    for (const row of data as unknown as Array<Record<string, string>>) {
      if (attempted >= maxPerRun) break;
      const value = row[column];
      if (!value) continue;
      attempted++;

      const key = value.toLowerCase();
      let hit = cache.get(key);
      if (hit === undefined) {
        const result = await geocodeAddress(value);
        hit = result ? { lat: result.lat, lng: result.lng } : null;
        cache.set(key, hit);
        await sleep(1100); // be polite to Nominatim
      }
      if (!hit) continue;

      await supabase!
        .from(table)
        .update({
          latitude: hit.lat,
          longitude: hit.lng,
          geocoded_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      geocoded++;
    }
  }

  await processTable("events", "location_text");
  await processTable("practitioners", "area");

  return { attempted, geocoded };
}
