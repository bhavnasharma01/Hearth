"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { runContentCheck } from "@/lib/moderation/content-check";
import { geocodeAddress } from "@/lib/geocode";
import { zonedLocalToISO } from "@/lib/datetime";
import type { ListingMode } from "@/lib/types/database";
import type { FormState } from "./types";

const MODES: ListingMode[] = ["in_person", "online", "both"];

// Simple recurrence options → iCal RRULE (replaces the old "email an admin to repeat").
const RECURRENCE: Record<string, string | null> = {
  none: null,
  weekly: "FREQ=WEEKLY",
  biweekly: "FREQ=WEEKLY;INTERVAL=2",
  monthly: "FREQ=MONTHLY",
};

export async function submitEvent(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const get = (k: string) => (formData.get(k)?.toString() ?? "").trim();

  const title = get("title");
  const description = get("description") || null;
  const startLocal = get("start_at");
  const endLocal = get("end_at");
  const rawMode = get("mode");
  const mode: ListingMode = MODES.includes(rawMode as ListingMode)
    ? (rawMode as ListingMode)
    : "in_person";
  const location_text = get("location_text") || null;
  const registration_link = get("registration_link") || null;
  const cost_note = get("cost_note") || null;
  const host_name = get("host_name") || null;
  const host_practitioner_id = get("host_practitioner_id") || null;
  const categorySlug = get("category") || null;
  const recurrence_rule = RECURRENCE[get("recurrence")] ?? null;
  const agreed = formData.get("agreement") != null;

  // --- validation ---
  const missing: string[] = [];
  if (!title) missing.push("an event title");
  if (!startLocal) missing.push("a start date & time");
  if (!agreed) missing.push("agreement to the community spirit");
  if (missing.length > 0) {
    return { status: "error", message: `Please add: ${missing.join("; ")}.` };
  }

  const start_at = zonedLocalToISO(startLocal);
  const end_at = zonedLocalToISO(endLocal);
  if (!start_at) {
    return { status: "error", message: "That start date & time looks invalid." };
  }
  if (end_at && new Date(end_at) < new Date(start_at)) {
    return { status: "error", message: "The end time is before the start time." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      status: "error",
      message: "Events aren’t connected to the database yet — please try again shortly.",
    };
  }

  // Resolve the (optional) category slug to an id.
  let category_id: string | null = null;
  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    category_id = (cat as { id: string } | null)?.id ?? null;
  }

  const check = runContentCheck([title, description, location_text, host_name]);
  const status = check.result === "ok" ? "live" : "pending";

  // Coordinates: prefer the picked autocomplete result, else geocode the text.
  const coords = await resolveCoords(formData, location_text);

  const { error } = await supabase.from("events").insert({
    title,
    description,
    category_id,
    start_at,
    end_at,
    mode,
    location_text,
    registration_link,
    cost_note,
    host_name,
    host_practitioner_id,
    recurrence_rule,
    latitude: coords?.lat ?? null,
    longitude: coords?.lng ?? null,
    geocoded_at: coords ? new Date().toISOString() : null,
    status,
    source: "hearth_form",
  });

  if (error) {
    console.error("submitEvent insert:", error.message);
    return {
      status: "error",
      message: "Something went wrong saving your event. Please try again.",
    };
  }

  revalidatePath("/events");
  revalidatePath("/");

  return status === "live"
    ? { status: "success", pendingReview: false, message: "Your event is live! 🎉" }
    : {
        status: "success",
        pendingReview: true,
        message:
          "Thank you — your event was received and will appear right after a quick review.",
      };
}

/** Coordinates for the event: the picked autocomplete result, else geocode the text. */
async function resolveCoords(
  formData: FormData,
  locationText: string | null,
): Promise<{ lat: number; lng: number } | null> {
  const latRaw = formData.get("latitude")?.toString().trim();
  const lngRaw = formData.get("longitude")?.toString().trim();
  if (latRaw && lngRaw) {
    const lat = Number(latRaw);
    const lng = Number(lngRaw);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  if (locationText) {
    const g = await geocodeAddress(locationText);
    if (g) return { lat: g.lat, lng: g.lng };
  }
  return null;
}
