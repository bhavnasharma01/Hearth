import type { SupabaseClient } from "@supabase/supabase-js";

/** Turn a name into a URL-safe slug, e.g. "Jane Smith" -> "jane-smith". */
export function slugify(input: string): string {
  return (
    input
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "") // strip accents
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "practitioner"
  );
}

/**
 * Produce a slug that's unique within `practitioners`, appending -2, -3, … if
 * the base is already taken. Uses the service-role client (admin), so it can
 * see all rows regardless of status.
 */
export async function uniquePractitionerSlug(
  supabase: SupabaseClient,
  name: string,
): Promise<string> {
  const base = slugify(name);

  const { data, error } = await supabase
    .from("practitioners")
    .select("slug")
    .like("slug", `${base}%`);

  if (error || !data || data.length === 0) return base;

  const taken = new Set((data as { slug: string }[]).map((r) => r.slug));
  if (!taken.has(base)) return base;

  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
