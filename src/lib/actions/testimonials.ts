"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUser, ensureProfileRow } from "@/lib/account";
import { runContentCheck } from "@/lib/moderation/content-check";
import { sendEmail } from "@/lib/notify";
import { siteUrl } from "@/lib/url";
import type { FormState } from "./types";

/**
 * Testimonials (accounts Phase C). The trust model, per Product.md §6:
 * any signed-in member may WRITE one from a practitioner's profile, but it
 * becomes public only when the practitioner APPROVES it — visitor-initiated,
 * owner-curated, positive-by-construction. Every action re-derives identity
 * from the session; client-supplied ids are verified against it.
 */

const MIN_LEN = 20;
const MAX_LEN = 600;

export async function submitTestimonial(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) {
    return { status: "error", message: "Please sign in to recommend someone." };
  }
  const sb = getSupabaseAdmin();
  if (!sb) {
    return { status: "error", message: "Couldn’t reach the server. Please try again shortly." };
  }

  const practitionerId = (formData.get("practitioner_id")?.toString() ?? "").trim();
  const body = (formData.get("body")?.toString() ?? "").trim();
  const enteredName = (formData.get("author_name")?.toString() ?? "").trim();
  const author_name =
    enteredName ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "A community member";

  if (body.length < MIN_LEN) {
    return {
      status: "error",
      message: "A few more words? A sentence or two helps it mean something.",
    };
  }
  if (body.length > MAX_LEN) {
    return { status: "error", message: `Please keep it under ${MAX_LEN} characters.` };
  }
  // Testimonials are personal words, not ad space — block link/spam content
  // outright (the owner-approval step is the quality gate; this is the floor).
  const check = runContentCheck([body, author_name]);
  if (check.result !== "ok") {
    return {
      status: "error",
      message: "Please keep it simple and personal (no links or promotional content).",
    };
  }

  // Target must be a live practitioner, and not the author's own.
  const { data: target } = await sb
    .from("practitioners")
    .select("id, slug, name, practice_name, email, owner_user_id, status")
    .eq("id", practitionerId)
    .maybeSingle();
  if (!target || target.status !== "live") {
    return { status: "error", message: "That profile isn’t available." };
  }
  if (target.owner_user_id === user.id) {
    return { status: "error", message: "You can’t recommend your own practice. 🙂" };
  }

  if (!(await ensureProfileRow(sb, user))) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  const { error } = await sb.from("testimonials").insert({
    practitioner_id: target.id,
    author_user_id: user.id,
    author_name,
    body,
  });
  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: "You’ve already written a recommendation for them. Thank you!",
      };
    }
    console.error("submitTestimonial:", error.message);
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  // Tell the practitioner so the recommendation doesn't wait unseen. Recipient:
  // the owner account's email when the practice is claimed; otherwise the
  // listing's contact email, with a nudge to claim (which is the only way to
  // approve). sendEmail never throws — a failed email never blocks the send.
  const label = target.practice_name || target.name;
  let recipient: string | null = null;
  let emailLines: string[] = [];
  if (target.owner_user_id) {
    const { data: ownerRow } = await sb
      .from("users")
      .select("email")
      .eq("id", target.owner_user_id)
      .maybeSingle();
    recipient = (ownerRow as { email: string | null } | null)?.email ?? target.email;
    emailLines = [
      `${author_name} wrote you a recommendation on Hearth:`,
      "",
      `“${body}”`,
      "",
      `It appears on your profile only after you approve it. Review it here:`,
      siteUrl("/my-practice"),
    ];
  } else if (target.email) {
    recipient = target.email;
    emailLines = [
      `${author_name} wrote a recommendation for ${label} on Hearth:`,
      "",
      `“${body}”`,
      "",
      `Recommendations appear on your profile only after you approve them.`,
      `To approve it, sign in and claim your practice page:`,
      siteUrl("/signin?next=/my-practice"),
    ];
  }
  if (recipient) {
    await sendEmail({
      to: [recipient],
      subject: `Someone recommended ${label} on Hearth 🌿`,
      body: emailLines.join("\n"),
    });
  }

  revalidatePath(`/p/${target.slug}`);
  revalidatePath("/my-recommendations");
  return {
    status: "success",
    slug: target.slug,
    message: "Sent. It’ll appear on their profile once they approve it. 🌿",
  };
}

/** Owner-only: approve or hide a testimonial on your own practice. */
async function setTestimonialStatus(fd: FormData, status: "approved" | "hidden") {
  const user = await getSessionUser();
  const sb = getSupabaseAdmin();
  const id = (fd.get("id")?.toString() ?? "").trim();
  if (!user || !sb || !id) return;

  // Verify the session user owns the practitioner this testimonial is for.
  const { data: t } = await sb
    .from("testimonials")
    .select("id, practitioner_id, practitioners!inner(owner_user_id, slug)")
    .eq("id", id)
    .maybeSingle();
  const owner = (t as { practitioners?: { owner_user_id: string | null; slug: string } } | null)
    ?.practitioners;
  if (!t || !owner || owner.owner_user_id !== user.id) return;

  const { error } = await sb.from("testimonials").update({ status }).eq("id", id);
  if (error) {
    console.error("setTestimonialStatus:", error.message);
    return;
  }
  revalidatePath(`/p/${owner.slug}`);
  revalidatePath("/my-practice");
}

export async function approveTestimonial(fd: FormData): Promise<void> {
  await setTestimonialStatus(fd, "approved");
}

export async function hideTestimonial(fd: FormData): Promise<void> {
  await setTestimonialStatus(fd, "hidden");
}

/** Author-only: remove a recommendation you wrote. */
export async function deleteOwnTestimonial(fd: FormData): Promise<void> {
  const user = await getSessionUser();
  const sb = getSupabaseAdmin();
  const id = (fd.get("id")?.toString() ?? "").trim();
  if (!user || !sb || !id) return;

  const { error } = await sb
    .from("testimonials")
    .delete()
    .eq("id", id)
    .eq("author_user_id", user.id);
  if (error) console.error("deleteOwnTestimonial:", error.message);
  revalidatePath("/my-recommendations");
}
