"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await getSupabaseBrowser().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <button
      onClick={signOut}
      className="text-xs text-on-night/70 underline hover:text-on-night"
    >
      Sign out
    </button>
  );
}
