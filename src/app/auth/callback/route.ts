import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * OAuth landing point: Supabase redirects here after Google sign-in with a
 * one-time `code`, which we exchange for a session (sets the auth cookies),
 * then forward to `next` (same-site paths only). On any failure, back to
 * /signin with a gentle error.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await getSupabaseServer();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(dest, url.origin));
      console.error("auth/callback:", error.message);
    }
  }
  return NextResponse.redirect(new URL("/signin?error=oauth", url.origin));
}
