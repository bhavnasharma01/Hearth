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
      className="text-xs text-on-night-deep/80 underline hover:text-on-night-deep"
    >
      Sign out
    </button>
  );
}
