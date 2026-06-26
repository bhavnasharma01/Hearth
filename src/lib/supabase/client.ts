import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (anon key, RLS-bound) — used by the admin login form
 * to sign in. It manages the auth session cookies the server then reads.
 */
export function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
