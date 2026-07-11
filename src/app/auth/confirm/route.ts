import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Landing point for EMAIL links (confirm signup, password reset). The link
 * carries a `token_hash` that this route verifies server-side (verifyOtp),
 * which works from ANY browser or device — unlike the PKCE `?code=` flow,
 * which silently required the email to be opened in the same browser that
 * requested it (the July 11 "reset link never works" bug).
 *
 * /auth/callback remains the OAuth (Google) landing point; this route is its
 * sibling for email links. Templates in documentation/email-templates/ point
 * here: /auth/confirm?token_hash={{ .TokenHash }}&type=signup|recovery&next=…
 */
const ALLOWED_TYPES: EmailOtpType[] = [
  "signup",
  "recovery",
  "email_change",
  "email",
  "invite",
  "magiclink",
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const rawNext = url.searchParams.get("next") ?? "/";
  const dest = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (token_hash && type && ALLOWED_TYPES.includes(type)) {
    const supabase = await getSupabaseServer();
    if (supabase) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash });
      if (!error) return NextResponse.redirect(new URL(dest, url.origin));
      console.error("auth/confirm:", error.message);
    }
  }

  // Expired/used/invalid link — land on sign-in with a message that matches
  // what the person was doing.
  const err = type === "recovery" ? "reset" : "confirm";
  return NextResponse.redirect(new URL(`/signin?error=${err}`, url.origin));
}
