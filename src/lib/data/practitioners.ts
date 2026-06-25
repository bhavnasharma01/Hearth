import { getSupabaseServer } from "@/lib/supabase/server";
import type {
  ListingMode,
  PractitionerWithCategories,
} from "@/lib/types/database";

export interface PractitionerQuery {
  /** Free-text search across name, practice, description, area, keywords. */
  search?: string;
  /** Filter to a single category slug. */
  category?: string;
  /** Filter by working mode. */
  mode?: ListingMode;
  /** Featured only (used by the Home peek). */
  featuredOnly?: boolean;
  limit?: number;
}

type CategoryJoinRow = { categories: RawCategory | RawCategory[] | null };
type RawCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  active: boolean;
};

const CATEGORY_JOIN =
  "*, practitioner_categories(categories(id, name, slug, description, sort_order, active))";

/**
 * Live practitioners matching the query, each with its categories.
 * RLS guarantees only `status = 'live'` rows are ever returned.
 * Returns [] until the DB is connected, so callers can render empty states.
 */
export async function getPractitioners(
  query: PractitionerQuery = {},
): Promise<PractitionerWithCategories[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  let q = supabase
    .from("practitioners")
    .select(CATEGORY_JOIN)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (query.mode) q = q.eq("mode", query.mode);
  if (query.featuredOnly) q = q.eq("featured", true);
  if (query.search && query.search.trim()) {
    // Postgres full-text search over the generated search_vector.
    q = q.textSearch("search_vector", query.search.trim(), {
      type: "websearch",
      config: "english",
    });
  }
  if (query.limit) q = q.limit(query.limit);

  const { data, error } = await q;
  if (error) {
    console.error("getPractitioners:", error.message);
    return [];
  }

  let rows = (data ?? []).map(flattenCategories);

  // Category is a many-to-many join, so filter after flattening.
  if (query.category) {
    rows = rows.filter((p) =>
      p.categories.some((c) => c.slug === query.category),
    );
  }
  return rows;
}

/** Flatten the nested join shape into a clean `categories` array. */
function flattenCategories(
  row: Record<string, unknown>,
): PractitionerWithCategories {
  const joins = (row.practitioner_categories as CategoryJoinRow[] | null) ?? [];
  const categories = joins
    .flatMap((j) => (Array.isArray(j.categories) ? j.categories : j.categories ? [j.categories] : []))
    .sort((a, b) => a.sort_order - b.sort_order);

  const { practitioner_categories: _ignored, ...practitioner } = row;
  void _ignored;
  return {
    ...(practitioner as Omit<PractitionerWithCategories, "categories">),
    categories,
  };
}
