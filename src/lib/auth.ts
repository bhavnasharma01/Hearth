import "server-only";
import type { User } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Allowlisted admin emails (comma-separated env var). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * The logged-in user *if* they're an allowlisted admin, else null. Identity
 * comes from the Supabase session cookie; authorization from ADMIN_EMAILS.
 */
export async function getAdminUser(): Promise<User | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return adminEmails().includes(user.email.toLowerCase()) ? user : null;
}

/** Throw if the caller isn't an admin — call at the top of every admin action. */
export async function requireAdmin(): Promise<User> {
  const user = await getAdminUser();
  if (!user) throw new Error("Not authorized");
  return user;
}
