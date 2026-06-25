import { getSupabaseServer } from "@/lib/supabase/server";
import type { Category } from "@/lib/types/database";

/** All active categories, in display order. Empty until the DB is connected. */
export async function getCategories(): Promise<Category[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, sort_order, active")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getCategories:", error.message);
    return [];
  }
  return (data as Category[]) ?? [];
}
