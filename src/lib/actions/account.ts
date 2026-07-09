"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUser, ensureProfileRow } from "@/lib/account";
import { getListingByManageToken, findClaimableByEmail } from "@/lib/data/practitioners";

/**
 * Accounts Phase B actions: linking a listing to the signed-in member (claim)
 * and the owner deleting their own listing. Every action re-derives identity
 * from the session server-side — client-supplied ids are never trusted.
 */

/**
 * Claim the listing behind a manage link for the signed-in member. Holding the
 * token already proves edit rights, so linking it to an account is a strict
 * upgrade (edit access with nothing to lose). Only unowned listings can be
 * claimed — a listing linked to someone else's account stays theirs.
 */
export async function claimListingByToken(fd: FormData): Promise<void> {
  const token = (fd.get("manage_token")?.toString() ?? "").trim();
  const user = await getSessionUser();
  const sb = getSupabaseAdmin();
  if (!user || !sb || !token) return;

  const listing = await getListingByManageToken(token);
  if (!listing || listing.owner_user_id) return;

  if (!(await ensureProfileRow(sb, user))) return;
  const { error } = await sb
    .from("practitioners")
    .update({ owner_user_id: user.id })
    .eq("id", listing.id)
    .is("owner_user_id", null);
  if (error) {
    console.error("claimListingByToken:", error.message);
    return;
  }
  revalidatePath(`/manage/${token}`);
  revalidatePath("/my-practice");
}

/**
 * Claim the unowned listing whose contact email matches the member's sign-in
 * email (the "this looks like yours?" card on /my-listing). The match is
 * re-derived server-side from the session email.
 */
export async function claimListingByEmail(): Promise<void> {
  const user = await getSessionUser();
  const sb = getSupabaseAdmin();
  if (!user?.email || !sb) return;

  const candidate = await findClaimableByEmail(user.email);
  if (!candidate) return;

  if (!(await ensureProfileRow(sb, user))) return;
  const { error } = await sb
    .from("practitioners")
    .update({ owner_user_id: user.id })
    .eq("id", candidate.id)
    .is("owner_user_id", null);
  if (error) {
    console.error("claimListingByEmail:", error.message);
    return;
  }
  revalidatePath("/my-practice");
}

/**
 * Delete a listing via its manage token (the owner's "delete my listing", from
 * the July 6 call). The token is the authority: whoever holds it may delete
 * that one listing — same trust model as editing. Categories and services rows
 * cascade with the row.
 */
export async function deleteListingByToken(fd: FormData): Promise<void> {
  const token = (fd.get("manage_token")?.toString() ?? "").trim();
  const sb = getSupabaseAdmin();
  if (!sb || !token) return;

  const listing = await getListingByManageToken(token);
  if (!listing) return;

  const { error } = await sb.from("practitioners").delete().eq("id", listing.id);
  if (error) {
    console.error("deleteListingByToken:", error.message);
    return;
  }
  revalidatePath("/practitioners");
  revalidatePath("/my-practice");
  redirect("/practitioners?removed=1");
}
