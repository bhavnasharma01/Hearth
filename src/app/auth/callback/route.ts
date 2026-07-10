import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * OAuth landing point: Supabase redirects here after Google sign-in with a
 * one-time `code`, which we exchange for a session (sets the auth cookies),
 * then forward to `next` (same-site paths only). On any failure, back to
 * /signin with a gentle error.
 *
 * `next` is read from the query, falling back to the short-lived
 * `hearth_next` cookie the sign-in button sets — continuity survives even if
 * the query is dropped somewhere across the OAuth round-trip.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  const cookieNext = request.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)hearth_next=([^;]+)/)?.[1];
  const rawNext =
    url.searchParams.get("next") ??
    (cookieNext ? decodeURIComponent(cookieNext) : null) ??
    "/";
  const dest = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  // Whatever happens, the stash cookie is single-use.
  const finish = (to: string) => {
    const res = NextResponse.redirect(new URL(to, url.origin));
    res.cookies.set("hearth_next", "", { path: "/", maxAge: 0 });
    return res;
  };

  if (code) {
    const supabase = await getSupabaseServer();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return finish(dest);
      console.error("auth/callback:", error.message);
    }
  }
  return finish("/signin?error=oauth");
}
