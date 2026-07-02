"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { runContentCheck } from "@/lib/moderation/content-check";
import { geocodeAddress } from "@/lib/geocode";
import { uniquePractitionerSlug } from "@/lib/slug";
import { notifyAdmins } from "@/lib/notify";
import { siteUrl } from "@/lib/url";
import type { ListingMode } from "@/lib/types/database";
import type { FormState } from "./types";

const MODES: ListingMode[] = ["in_person", "online", "both"];

export async function submitPractitioner(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const get = (k: string) => (formData.get(k)?.toString() ?? "").trim();

  const name = get("name");
  const practice_name = get("practice_name") || null;
  const description = get("description");
  const bio = get("bio") || null;
  const area = get("area") || null;
  const rawMode = get("mode");
  const mode: ListingMode = MODES.includes(rawMode as ListingMode)
    ? (rawMode as ListingMode)
    : "both";
  const whatsapp = get("whatsapp") || null;
  const email = get("email") || null;
  const website = get("website") || null;
  const instagram = get("instagram") || null;
  const pricing_note = get("pricing_note") || null;
  const languages = get("languages") || null;
  const keywords = get("keywords") || null;
  const is_member = formData.get("is_member") != null;
  const agreed = formData.get("agreement") != null;
  const categorySlugs = formData
    .getAll("categories")
    .map(String)
    .map((s) => s.trim())
    .filter(Boolean);

  // --- validation (mirrors the DB constraints + product rules) ---
  const missing: string[] = [];
  if (!name) missing.push("your name");
  if (!description) missing.push("a short description");
  if (categorySlugs.length === 0) missing.push("at least one category");
  if (!whatsapp && !email && !website)
    missing.push("at least one way to reach you (WhatsApp, email, or website)");
  if (!agreed) missing.push("agreement to the community spirit");
  if (missing.length > 0) {
    return { status: "error", message: `Please add: ${missing.join("; ")}.` };
  }
  if (categorySlugs.length > 3) {
    return { status: "error", message: "Please choose up to 3 categories." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      status: "error",
      message:
        "The directory isn’t connected to its database yet — please try again shortly.",
    };
  }

  // Resolve category slugs to ids.
  const { data: cats, error: catErr } = await supabase
    .from("categories")
    .select("id, slug")
    .in("slug", categorySlugs);
  if (catErr) {
    return { status: "error", message: "Couldn’t read categories. Please try again." };
  }
  const categoryIds = (cats as { id: string; slug: string }[] | null)?.map(
    (c) => c.id,
  );
  if (!categoryIds || categoryIds.length === 0) {
    return { status: "error", message: "Those categories weren’t recognized." };
  }

  // Content check decides instant-publish vs hold-for-review (server-side).
  const check = runContentCheck([description, bio, name, practice_name, keywords]);
  const status = check.result === "ok" ? "live" : "pending";

  const slug = await uniquePractitionerSlug(supabase, name);

  // Geocode the area (coarse — a neighbourhood/city, never a home address) so
  // the practitioner can surface in "near me".
  const geo = area ? await geocodeAddress(area) : null;

  const { data: inserted, error } = await supabase
    .from("practitioners")
    .insert({
      name,
      practice_name,
      slug,
      description,
      bio,
      area,
      mode,
      whatsapp,
      email,
      website,
      instagram,
      pricing_note,
      languages,
      keywords,
      is_member,
      status,
      auto_check: check.result,
      source: "hearth_form",
      latitude: geo?.lat ?? null,
      longitude: geo?.lng ?? null,
      geocoded_at: geo ? new Date().toISOString() : null,
    })
    .select("id, slug")
    .single();

  if (error || !inserted) {
    console.error("submitPractitioner insert:", error?.message);
    return {
      status: "error",
      message: "Something went wrong saving your listing. Please try again.",
    };
  }

  const { error: linkErr } = await supabase
    .from("practitioner_categories")
    .insert(
      categoryIds.map((category_id) => ({
        practitioner_id: inserted.id,
        category_id,
      })),
    );
  if (linkErr) {
    console.error("submitPractitioner categories:", linkErr.message);
  }

  revalidatePath("/practitioners");
  revalidatePath("/");

  if (status === "live") {
    return {
      status: "success",
      pendingReview: false,
      slug: inserted.slug,
      message: "You’re live in the directory! 🌿",
    };
  }

  // Held for review (the content check flagged it) — notify the stewards so the
  // small suspicious fraction doesn't wait unseen (see Security.md §4).
  const label = practice_name || name;
  await notifyAdmins({
    subject: `Hearth: new listing “${label}” needs review`,
    body: [
      `A new practitioner listing was submitted and held for review because`,
      `the automated content check flagged it.`,
      "",
      `Name:  ${label}`,
      `Why held:  ${check.reasons.join("; ")}`,
      "",
      `Review it here:  ${siteUrl("/admin/moderation")}`,
    ].join("\n"),
  });

  return {
    status: "success",
    pendingReview: true,
    message:
      "Thank you — your listing was received and will appear right after a quick review.",
  };
}
