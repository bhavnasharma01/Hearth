"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ReportReason } from "@/lib/types/database";
import type { FormState } from "./types";

const REASONS: ReportReason[] = [
  "spam",
  "inappropriate",
  "not_real",
  "outdated",
  "other",
];

// Distinct reporters needed before a steward is alerted (see documentation/Security.md §5).
const FLAG_THRESHOLD = 3;

export async function submitReport(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const get = (k: string) => (formData.get(k)?.toString() ?? "").trim();

  const type = get("type"); // "practitioner" | "event"
  const id = get("id");
  const rawReason = get("reason");
  const reason: ReportReason = REASONS.includes(rawReason as ReportReason)
    ? (rawReason as ReportReason)
    : "other";
  const reporterContact = get("reporter_contact");
  const details = get("details") || null;

  if ((type !== "practitioner" && type !== "event") || !id) {
    return { status: "error", message: "Sorry — that report link looks invalid." };
  }
  if (!reporterContact) {
    return {
      status: "error",
      message: "Please add your email or WhatsApp (used only to count reports).",
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { status: "error", message: "Couldn’t reach the server — please try again shortly." };
  }

  const targetCol = type === "practitioner" ? "practitioner_id" : "event_id";

  // One report per contact per target (dedupe by contact — distinct reporters only).
  const { data: existing } = await supabase
    .from("reports")
    .select("id")
    .eq(targetCol, id)
    .eq("reporter_contact", reporterContact)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from("reports").insert({
      [targetCol]: id,
      reporter_contact: reporterContact,
      reason,
      details,
      status: "open",
    });
    if (error) {
      console.error("submitReport:", error.message);
      return { status: "error", message: "Something went wrong — please try again." };
    }

    // Denormalize the distinct-reporter count onto practitioners (a steward is
    // alerted past the threshold; flags never auto-hide).
    if (type === "practitioner") {
      const { data: rows } = await supabase
        .from("reports")
        .select("reporter_contact")
        .eq("practitioner_id", id);
      const distinct = new Set(
        (rows ?? []).map((r) => (r as { reporter_contact: string }).reporter_contact),
      ).size;
      await supabase
        .from("practitioners")
        .update({ flag_count: distinct })
        .eq("id", id);
      if (distinct >= FLAG_THRESHOLD) {
        console.warn(`Practitioner ${id} reached ${distinct} distinct reports.`);
      }
    }
  }

  revalidatePath("/admin/reports");

  return {
    status: "success",
    message: "Thank you — a steward will take a quiet look. Reports are private.",
  };
}
