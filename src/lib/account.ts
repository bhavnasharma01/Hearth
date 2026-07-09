import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * The signed-in user for the current request, or null. Reads the session from
 * cookies via the anon server client — call only from server components,
 * route handlers, or server actions.
 */
export async function getSessionUser(): Promise<User | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * Make sure the member's `users` profile row exists (it's the FK target for
 * `practitioners.owner_user_id`). Accounts created before the sign-up trigger
 * (e.g. stewards) don't have one. Returns true when the row exists/was made;
 * callers should treat false as "proceed without ownership" rather than fail.
 * `sb` must be the service-role client (members can't insert their own row).
 */
export async function ensureProfileRow(
  sb: SupabaseClient,
  user: User,
): Promise<boolean> {
  const { error } = await sb
    .from("users")
    .upsert(
      { id: user.id, email: user.email ?? null },
      { onConflict: "id", ignoreDuplicates: true },
    );
  if (error) console.error("ensureProfileRow:", error.message);
  return !error;
}
