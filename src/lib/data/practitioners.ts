import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { withDistance, type LatLng } from "@/lib/geo";
import type {
  ListingMode,
  PractitionerWithCategories,
  PractitionerService,
} from "@/lib/types/database";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface PractitionerQuery {
  /** Free-text search across name, practice, description, area, keywords. */
  search?: string;
  /** Filter to a single category slug. */
  category?: string;
  /** Filter by working mode. */
  mode?: ListingMode;
  /** Featured only (used by the Home peek). */
  featuredOnly?: boolean;
  /** When set, attach distance and sort nearest-first. */
  near?: LatLng | null;
  /** When set with `near`, drop practitioners beyond this many km. */
  radiusKm?: number | null;
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
 * Returns [] until the DB is connected, so callers can render empty states.
 *
 * We filter `status = 'live'` **explicitly** — not just via RLS. RLS is viewer-
 * dependent: a logged-in admin/steward (whose session cookie rides along on the
 * anon-key server client) is `authenticated`, and the `practitioners_admin_all`
 * policy grants them every status. Without this filter, an admin browsing the
 * public directory would see hidden/pending listings that a real visitor can't —
 * which reads as "Hide didn't work." The explicit filter makes the public list
 * correct regardless of who's viewing; RLS remains the backstop for true anon.
 */
export async function getPractitioners(
  query: PractitionerQuery = {},
): Promise<PractitionerWithCategories[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  let q = supabase
    .from("practitioners")
    .select(CATEGORY_JOIN)
    .eq("status", "live")
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
  // Attach distance + sort nearest-first when a location is active.
  rows = withDistance(rows, query.near ?? null, query.radiusKm);
  return rows;
}

/** Minimal list of live practitioners for the "host" selector on the event form. */
export async function getPractitionerOptions(): Promise<
  Array<{ id: string; label: string }>
> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("practitioners")
    .select("id, name, practice_name")
    .eq("status", "live")
    .order("name", { ascending: true });

  if (error || !data) return [];
  return data.map((p) => ({ id: p.id, label: p.practice_name || p.name }));
}

/** A single live practitioner by slug (with categories), or null. */
export async function getPractitionerBySlug(
  slug: string,
): Promise<PractitionerWithCategories | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("practitioners")
    .select(CATEGORY_JOIN)
    .eq("slug", slug)
    .eq("status", "live")
    .maybeSingle();

  if (error || !data) return null;
  return flattenCategories(data);
}

/**
 * A practitioner by its private manage token, for the owner's `/manage/<token>`
 * edit page. Uses the **service-role** client (the token is column-revoked from
 * the public roles) and returns any status (the owner can edit even while held
 * for review). Returns null for a malformed or unknown token.
 */
export async function getListingByManageToken(
  token: string,
): Promise<PractitionerWithCategories | null> {
  if (!UUID_RE.test(token)) return null;
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("practitioners")
    .select(CATEGORY_JOIN)
    .eq("manage_token", token)
    .maybeSingle();

  if (error || !data) return null;
  return flattenCategories(data);
}

/**
 * A practitioner's services (the "what I offer" menu), ordered. Uses the anon
 * client by default (public read = live practitioners only); pass `useAdmin` for
 * the owner's manage page, which must see services on a not-yet-live listing.
 */
export async function getPractitionerServices(
  practitionerId: string,
  useAdmin = false,
): Promise<PractitionerService[]> {
  const supabase = useAdmin ? getSupabaseAdmin() : await getSupabaseServer();
  if (!supabase) return [];
  const { data } = await supabase
    .from("practitioner_services")
    .select("*")
    .eq("practitioner_id", practitionerId)
    .order("sort_order", { ascending: true });
  return (data as PractitionerService[]) ?? [];
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
