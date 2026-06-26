import { getSupabaseServer } from "@/lib/supabase/server";
import { withDistance, type LatLng } from "@/lib/geo";
import type {
  Category,
  EventWithCategory,
  ListingMode,
} from "@/lib/types/database";

export interface EventQuery {
  search?: string;
  category?: string;
  mode?: ListingMode;
  /** Only events starting at/after now (the default public "upcoming" view). */
  upcomingOnly?: boolean;
  featuredOnly?: boolean;
  /** When set, attach distance and sort nearest-first. */
  near?: LatLng | null;
  /** When set with `near`, drop events beyond this many km. */
  radiusKm?: number | null;
  limit?: number;
}

const CATEGORY_JOIN =
  "*, category:categories(id, name, slug, description, sort_order, active)";

/**
 * Live events matching the query, each with its (optional) category, ordered by
 * start time. RLS guarantees only `status = 'live'` rows are returned.
 * Returns [] until the DB is connected.
 */
export async function getEvents(
  query: EventQuery = {},
): Promise<EventWithCategory[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  let q = supabase
    .from("events")
    .select(CATEGORY_JOIN)
    .order("start_at", { ascending: true });

  if (query.upcomingOnly) q = q.gte("start_at", new Date().toISOString());
  if (query.mode) q = q.eq("mode", query.mode);
  if (query.featuredOnly) q = q.eq("featured", true);
  if (query.search && query.search.trim()) {
    q = q.textSearch("search_vector", query.search.trim(), {
      type: "websearch",
      config: "english",
    });
  }
  // Note: no SQL limit here — we collapse recurring series first, then slice.

  const { data, error } = await q;
  if (error) {
    console.error("getEvents:", error.message);
    return [];
  }

  let rows = (data ?? []).map(normalizeCategory);
  if (query.category) {
    rows = rows.filter((e) => e.category?.slug === query.category);
  }
  // Collapse recurring series to a single next-occurrence row (input is sorted
  // by start_at asc, so the first row seen per series is the soonest upcoming).
  // Without this, a weekly event shows once per occurrence — which piled up in
  // the distance-sorted "near me" view as the same event over and over.
  rows = collapseSeries(rows);
  // Attach distance + sort nearest-first when a location is active (otherwise
  // the start_at ordering above is preserved).
  rows = withDistance(rows, query.near ?? null, query.radiusKm);
  if (query.limit) rows = rows.slice(0, query.limit);
  return rows;
}

/** Key identifying a recurring series: the imported event's UID (external_id is
 *  `UID:<occurrenceISO>` for expanded occurrences), else a native parent, else id. */
function seriesKey(e: EventWithCategory): string {
  if (e.external_id) return e.external_id.split(":")[0];
  return e.recurrence_parent_id ?? e.id;
}

function collapseSeries(events: EventWithCategory[]): EventWithCategory[] {
  const seen = new Set<string>();
  const out: EventWithCategory[] = [];
  for (const e of events) {
    const key = seriesKey(e);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

/** Upcoming live events hosted by a given practitioner (for their profile page). */
export async function getEventsByHost(
  practitionerId: string,
): Promise<EventWithCategory[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("events")
    .select(CATEGORY_JOIN)
    .eq("host_practitioner_id", practitionerId)
    .eq("status", "live")
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true });

  if (error || !data) return [];
  return data.map(normalizeCategory);
}

/** Supabase returns a to-one embed as an object or single-element array; normalize it. */
function normalizeCategory(row: Record<string, unknown>): EventWithCategory {
  const raw = row.category as Category | Category[] | null;
  const category = Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null);
  return { ...(row as Omit<EventWithCategory, "category">), category };
}
