import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SERVICE-ROLE key. This BYPASSES
 * Row-Level Security, so it must never be imported into client code (the
 * `server-only` guard enforces that at build time).
 *
 * Used exclusively by trusted server actions for public submissions/reports
 * and the calendar import, where `status` / `auto_check` are set server-side —
 * the client never supplies them, so the content-check gate cannot be bypassed.
 *
 * Returns `null` when the environment isn't configured yet, so the app builds
 * and the actions can report a friendly "not connected yet" message.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
