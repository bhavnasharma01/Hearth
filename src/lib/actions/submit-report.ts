"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { notifyAdmins } from "@/lib/notify";
import { siteUrl } from "@/lib/url";
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

      // Email the stewards the moment a listing crosses the threshold — once,
      // when the Nth distinct reporter arrives (not on every later report, to
      // avoid alert fatigue). Flags still never auto-hide; a human decides.
      if (distinct === FLAG_THRESHOLD) {
        const { data: prac } = await supabase
          .from("practitioners")
          .select("name, practice_name, slug")
          .eq("id", id)
          .maybeSingle();
        const label =
          (prac as { name: string; practice_name: string | null } | null)
            ?.practice_name ||
          (prac as { name: string } | null)?.name ||
          "a practitioner";
        const pracSlug = (prac as { slug: string } | null)?.slug;
        await notifyAdmins({
          subject: `Hearth: “${label}” reached ${distinct} reports`,
          body: [
            `“${label}” has now been flagged by ${distinct} different people.`,
            `Most recent reason: ${reason}${details ? ` — “${details}”` : ""}.`,
            "",
            "Flags never auto-hide anything — this is just a heads-up so a",
            "steward can take a quiet look and decide what to do.",
            "",
            pracSlug ? `Listing:  ${siteUrl(`/p/${pracSlug}`)}` : null,
            `Reports:  ${siteUrl("/admin/reports")}`,
          ]
            .filter((line) => line !== null)
            .join("\n"),
        });
      }
    }
  }

  revalidatePath("/admin/reports");

  return {
    status: "success",
    message: "Thank you — a steward will take a quiet look. Reports are private.",
  };
}
