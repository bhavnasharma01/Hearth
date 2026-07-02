"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { FeedbackType } from "@/lib/types/database";
import type { FormState } from "./types";

const TYPES: FeedbackType[] = ["bug", "idea", "confusing", "praise", "other"];

/**
 * Public feedback submission (testing phase). Inserts via the service-role
 * client (the anon role has no write access to `feedback`), lands as
 * `status = 'new'` on the admin board. No content check / moderation gate —
 * feedback is private (never published), so there's nothing to hold.
 */
export async function submitFeedback(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const get = (k: string) => (formData.get(k)?.toString() ?? "").trim();

  const message = get("message");
  const rawType = get("type");
  const type: FeedbackType = TYPES.includes(rawType as FeedbackType)
    ? (rawType as FeedbackType)
    : "other";
  const context = get("context") || null;
  const submitter_name = get("submitter_name") || null;
  const submitter_contact = get("submitter_contact") || null;

  if (!message) {
    return { status: "error", message: "Please add a little detail before sending." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      status: "error",
      message: "Couldn’t reach the server — please try again shortly.",
    };
  }

  const { error } = await supabase.from("feedback").insert({
    message,
    type,
    context,
    submitter_name,
    submitter_contact,
    status: "new",
  });
  if (error) {
    console.error("submitFeedback:", error.message);
    return { status: "error", message: "Something went wrong — please try again." };
  }

  revalidatePath("/admin/feedback");

  return {
    status: "success",
    message: "Thank you — your feedback went straight to the team. 🌿",
  };
}
