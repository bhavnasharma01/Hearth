import "server-only";
import type { User } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Parse a comma-separated email env var into a normalized (lowercased) list. */
export function parseEmails(raw: string | undefined): string[] {
  return (raw || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Allowlisted admin emails — who may access the admin panel (`ADMIN_EMAILS`). */
export function adminEmails(): string[] {
  return parseEmails(process.env.ADMIN_EMAILS);
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
