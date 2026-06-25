import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the public (anon) key. All access is
 * constrained by Row-Level Security, so this can only read `live` content and
 * active categories — exactly what the public site needs.
 *
 * Returns `null` when the environment isn't configured yet (e.g. during an
 * early build before the Supabase project exists), so pages render their
 * empty states instead of crashing. Once env vars are set it returns a real
 * client that reads live data.
 */
export async function getSupabaseServer(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component where cookies are read-only — safe to ignore.
        }
      },
    },
  });
}
