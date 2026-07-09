import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { GoogleSignInButton } from "@/components/google-signin-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sign in · Hearth" };

/** Only ever forward to a same-site path. */
function safePath(next: string | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  // Already signed in? Continue to wherever they were headed.
  const supabase = await getSupabaseServer();
  if (supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect(safePath(next));
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <div className="rounded-[var(--radius-card)] border border-line bg-card p-8">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Sign in to Hearth
        </h1>
        <p className="mt-2 text-sm text-muted">
          For practitioners and members: sign in to add your practice and manage
          your listing.
        </p>

        {error && (
          <p className="mt-4 rounded-xl border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay">
            Sign-in didn&rsquo;t complete. Please try again.
          </p>
        )}

        <div className="mt-6">
          <GoogleSignInButton next={safePath(next)} />
        </div>

        <p className="mt-6 text-xs text-muted">
          Browsing Hearth never needs an account. Signing in is only for adding
          or managing your own listing.
        </p>
      </div>
    </div>
  );
}
