"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * The header's quiet account corner: a "Sign in" link when logged out, a small
 * avatar with a menu when logged in. Client-side on purpose — reading the
 * session via cookies() in the header would force every page dynamic (the home
 * page is static since Build 39).
 *
 * The menu is a controlled popover (not <details>): it closes when you pick an
 * item, click/tap anywhere else, or press Escape — a <details> dropdown stays
 * open after navigation, which read as broken (Build 48 feedback). Styled as a
 * menu panel (identity header + hover rows), not stacked pill buttons.
 */
export function AccountControl() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Dismiss on outside click/tap and on Escape while the menu is open.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function signOut() {
    setOpen(false);
    await getSupabaseBrowser().auth.signOut();
    router.refresh();
  }

  // Reserve the space while the session loads so the nav doesn't shift.
  if (!ready) return <span aria-hidden className="inline-block h-8 w-8" />;

  if (!user) {
    return (
      <Link
        href="/signin"
        className="rounded-full px-3 py-1.5 text-sm text-on-night/70 transition-colors hover:bg-on-night/5 hover:text-on-night"
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
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gold/20 bg-cover bg-center text-sm font-semibold text-gold-soft ring-1 transition-shadow ${
          open ? "ring-2 ring-gold" : "ring-gold/40 hover:ring-gold/70"
        }`}
        style={safeAvatar ? { backgroundImage: `url(${JSON.stringify(safeAvatar)})` } : undefined}
      >
        {!safeAvatar && name.charAt(0).toUpperCase()}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-card shadow-xl"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-sm font-medium text-ink">{name}</p>
            {user.email && (
              <p className="truncate text-xs text-muted">{user.email}</p>
            )}
          </div>
          {/* Plain text rows — no icons (Build 49 feedback: emoji glyphs felt
              off-brand in a menu; quiet typography carries it). */}
          <nav className="p-1.5">
            <Link
              href="/my-listing"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm text-ink transition-colors hover:bg-sand"
            >
              My listing
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={signOut}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-clay transition-colors hover:bg-clay/10"
            >
              Sign out
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
