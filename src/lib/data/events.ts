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
  if (query.limit) q = q.limit(query.limit);

  const { data, error } = await q;
  if (error) {
    console.error("getEvents:", error.message);
    return [];
  }

  let rows = (data ?? []).map(normalizeCategory);
  if (query.category) {
    rows = rows.filter((e) => e.category?.slug === query.category);
  }
  // Attach distance + sort nearest-first when a location is active (otherwise
  // the start_at ordering above is preserved).
  rows = withDistance(rows, query.near ?? null, query.radiusKm);
  return rows;
}

/** Supabase returns a to-one embed as an object or single-element array; normalize it. */
function normalizeCategory(row: Record<string, unknown>): EventWithCategory {
  const raw = row.category as Category | Category[] | null;
  const category = Array.isArray(raw) ? (raw[0] ?? null) : (raw ?? null);
  return { ...(row as Omit<EventWithCategory, "category">), category };
}
