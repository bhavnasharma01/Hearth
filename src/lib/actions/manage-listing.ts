"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getListingByManageToken } from "@/lib/data/practitioners";
import { runContentCheck } from "@/lib/moderation/content-check";
import { resolveCoordsFromForm } from "@/lib/geocode";
import { notifyAdmins } from "@/lib/notify";
import { siteUrl } from "@/lib/url";
import type { ListingMode } from "@/lib/types/database";
import type { FormState } from "./types";

const MODES: ListingMode[] = ["in_person", "online", "both"];

/**
 * Edit an existing listing from its private `/manage/<token>` page. The token is
 * the capability — anyone holding it may edit that one listing (no account). All
 * writes go through the service-role client. If an edit trips the content check,
 * a previously-live listing is quietly held for review (and stewards notified),
 * so the manage link can't be used to sneak spam live.
 */
export async function updateListing(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const get = (k: string) => (formData.get(k)?.toString() ?? "").trim();

  const token = get("manage_token");
  const listing = await getListingByManageToken(token);
  if (!listing) {
    return { status: "error", message: "This manage link is invalid or expired." };
  }

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
  const rawPhoto = get("photo_url");
  const photo_url = /^https?:\/\//.test(rawPhoto) ? rawPhoto : null;
  const pricing_note = get("pricing_note") || null;
  const languages = get("languages") || null;
  const keywords = get("keywords") || null;
  const is_member = formData.get("is_member") != null;
  const accepting_clients = formData.get("accepting_clients") != null;
  const categorySlugs = formData
    .getAll("categories")
    .map(String)
    .map((s) => s.trim())
    .filter(Boolean);

  // --- validation (mirrors the add form + DB constraints) ---
  const missing: string[] = [];
  if (!name) missing.push("your name");
  if (!description) missing.push("a short description");
  if (categorySlugs.length === 0) missing.push("at least one category");
  if (!area) missing.push("your area");
  if (!whatsapp && !email && !website && !instagram)
    missing.push("at least one way to reach you (WhatsApp, email, website, or Instagram)");
  if (missing.length > 0) {
    return { status: "error", message: `Please add: ${missing.join("; ")}.` };
  }
  if (categorySlugs.length > 3) {
    return { status: "error", message: "Please choose up to 3 categories." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { status: "error", message: "Couldn’t reach the server — please try again shortly." };
  }

  const { data: cats } = await supabase
    .from("categories")
    .select("id, slug")
    .in("slug", categorySlugs);
  const categoryIds = (cats as { id: string; slug: string }[] | null)?.map((c) => c.id) ?? [];
  if (categoryIds.length === 0) {
    return { status: "error", message: "Those categories weren’t recognized." };
  }

  // Re-check content on edit: if it now trips the check, hold a live listing for
  // review (never silently keep suspicious content public). Clean edits keep the
  // current status (a held listing still waits for a steward).
  const check = runContentCheck([description, bio, name, practice_name, keywords]);
  const flagged = check.result === "needs_review";
  const status = flagged ? "pending" : listing.status;

  const geo = await resolveCoordsFromForm(formData, area);

  const { error } = await supabase
    .from("practitioners")
    .update({
      name,
      practice_name,
      description,
      bio,
      area,
      mode,
      whatsapp,
      email,
      website,
      instagram,
      photo_url,
      pricing_note,
      languages,
      keywords,
      is_member,
      accepting_clients,
      status,
      auto_check: check.result,
      latitude: geo?.lat ?? null,
      longitude: geo?.lng ?? null,
      geocoded_at: geo ? new Date().toISOString() : null,
    })
    .eq("id", listing.id);

  if (error) {
    console.error("updateListing:", error.message);
    return { status: "error", message: "Something went wrong saving your changes. Please try again." };
  }

  // Replace the category links.
  await supabase.from("practitioner_categories").delete().eq("practitioner_id", listing.id);
  await supabase
    .from("practitioner_categories")
    .insert(categoryIds.map((category_id) => ({ practitioner_id: listing.id, category_id })));

  revalidatePath(`/p/${listing.slug}`);
  revalidatePath("/practitioners");
  revalidatePath("/");

  if (flagged && listing.status === "live") {
    const label = practice_name || name;
    await notifyAdmins({
      subject: `Hearth: edited listing “${label}” held for review`,
      body: [
        `“${label}” was edited via its manage link and the content check flagged`,
        `the new content, so it's been held for review.`,
        "",
        `Why held:  ${check.reasons.join("; ")}`,
        "",
        `Review it here:  ${siteUrl("/admin/moderation")}`,
      ].join("\n"),
    });
    return {
      status: "success",
      pendingReview: true,
      slug: listing.slug,
      message: "Saved — but your changes need a quick review before they show publicly.",
    };
  }

  return {
    status: "success",
    pendingReview: status !== "live",
    slug: listing.slug,
    message: "Saved — your listing has been updated. 🌿",
  };
}
