import { getSupabaseServer } from "@/lib/supabase/server";
import type { Category } from "@/lib/types/database";

/** All active categories, alphabetical (Build 93 — display order was insertion
 *  order via sort_order, which stopped making sense once admins grew the list;
 *  sort_order still exists but no longer drives display). Empty until the DB
 *  is connected. */
export async function getCategories(): Promise<Category[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, sort_order, active")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("getCategories:", error.message);
    return [];
  }
  return (data as Category[]) ?? [];
}
