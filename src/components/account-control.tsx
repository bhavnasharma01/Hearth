"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * The header's quiet account corner: a "Sign in" link when logged out, a small
 * avatar with a menu (signed-in-as + sign out) when logged in. Client-side on
 * purpose — reading the session via cookies() in the header would force every
 * page dynamic (the home page is static since Build 39). "My listing" joins
 * the menu in accounts Phase B.
 */
export function AccountControl() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await getSupabaseBrowser().auth.signOut();
    router.refresh();
  }

  // Reserve the space while the session loads so the nav doesn't shift.
  if (!ready) return <span aria-hidden className="inline-block h-8 w-8" />;

  if (!user) {
    return (
      <Link
        href="/signin"
        className="rounded-full px-3 py-1.5 text-sm text-cream/70 transition-colors hover:bg-white/5 hover:text-cream"
      >
        Sign in
      </Link>
    );
  }

  const name =
    (user.user_metadata?.full_name as string | undefined) || user.email || "You";
  const avatar = user.user_metadata?.avatar_url as string | undefined;
  const safeAvatar = avatar && /^https?:\/\//.test(avatar) ? avatar : null;

  return (
    <details className="relative">
      <summary
        className="flex h-8 w-8 cursor-pointer list-none items-center justify-center overflow-hidden rounded-full bg-gold/20 bg-cover bg-center text-sm font-semibold text-gold-soft ring-1 ring-gold/40 [&::-webkit-details-marker]:hidden"
        style={safeAvatar ? { backgroundImage: `url(${JSON.stringify(safeAvatar)})` } : undefined}
        aria-label="Account menu"
      >
        {!safeAvatar && name.charAt(0).toUpperCase()}
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-line bg-card p-3 text-left shadow-lg">
        <p className="truncate text-xs text-muted">Signed in as</p>
        <p className="truncate text-sm font-medium text-ink">{name}</p>
        <Link
          href="/my-listing"
          className="mt-3 block w-full rounded-full bg-forest px-3 py-1.5 text-center text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
        >
          My listing
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="mt-2 w-full rounded-full border border-line px-3 py-1.5 text-sm text-clay transition-colors hover:bg-clay/10"
        >
          Sign out
        </button>
      </div>
    </details>
  );
}
