"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";
import { runCalendarImport } from "@/lib/import/calendar";
import { geocodePending } from "@/lib/import/geocode-pending";

const PRACTITIONER_STATUSES = ["pending", "live", "hidden", "rejected"];
const EVENT_STATUSES = ["pending", "live", "hidden", "cancelled"];

function str(fd: FormData, k: string) {
  return (fd.get(k)?.toString() ?? "").trim();
}

async function admin() {
  await requireAdmin();
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Database not configured.");
  return sb;
}

export async function setPractitionerStatus(fd: FormData) {
  const sb = await admin();
  const id = str(fd, "id");
  const status = str(fd, "status");
  if (!id || !PRACTITIONER_STATUSES.includes(status)) return;
  const { error } = await sb.from("practitioners").update({ status }).eq("id", id);
  if (error) {
    // Don't fail silently — a swallowed error here looks like "Hide did nothing."
    console.error("setPractitionerStatus:", error.message);
    throw new Error(`Couldn't update the listing: ${error.message}`);
  }
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/listings");
  revalidatePath("/practitioners");
}

export async function setEventStatus(fd: FormData) {
  const sb = await admin();
  const id = str(fd, "id");
  const status = str(fd, "status");
  if (!id || !EVENT_STATUSES.includes(status)) return;
  const { error } = await sb.from("events").update({ status }).eq("id", id);
  if (error) {
    console.error("setEventStatus:", error.message);
    throw new Error(`Couldn't update the event: ${error.message}`);
  }
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function togglePractitionerFeatured(fd: FormData) {
  const sb = await admin();
  const id = str(fd, "id");
  const featured = str(fd, "featured") === "true";
  if (!id) return;
  await sb.from("practitioners").update({ featured: !featured }).eq("id", id);
  revalidatePath("/admin/listings");
  revalidatePath("/");
}

export async function toggleEventFeatured(fd: FormData) {
  const sb = await admin();
  const id = str(fd, "id");
  const featured = str(fd, "featured") === "true";
  if (!id) return;
  await sb.from("events").update({ featured: !featured }).eq("id", id);
  revalidatePath("/admin/events");
  revalidatePath("/");
}

export async function deletePractitioner(fd: FormData) {
  const sb = await admin();
  const id = str(fd, "id");
  if (!id) return;
  await sb.from("practitioners").delete().eq("id", id);
  revalidatePath("/admin/listings");
  revalidatePath("/practitioners");
}

export async function deleteEvent(fd: FormData) {
  const sb = await admin();
  const id = str(fd, "id");
  if (!id) return;
  await sb.from("events").delete().eq("id", id);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

/**
 * Hide a reported listing AND resolve its open reports in one step (from the
 * Reports inbox). Acting on a report *is* handling it, so the report is marked
 * `actioned` and the card leaves the inbox — that disappearance is the steward's
 * feedback that the hide took effect. (Plain "hide from the listings tab" stays
 * separate via setPractitionerStatus; there the row remains so it's un-hideable.)
 */
export async function hideReportedListing(fd: FormData) {
  const sb = await admin();
  const type = str(fd, "type");
  const id = str(fd, "id");
  if (!id) return;
  const table = type === "event" ? "events" : "practitioners";
  const { error } = await sb.from(table).update({ status: "hidden" }).eq("id", id);
  if (error) {
    console.error("hideReportedListing:", error.message);
    throw new Error(`Couldn't hide the listing: ${error.message}`);
  }
  const col = type === "event" ? "event_id" : "practitioner_id";
  await sb.from("reports").update({ status: "actioned" }).eq(col, id).eq("status", "open");
  if (type === "practitioner") {
    await sb.from("practitioners").update({ flag_count: 0 }).eq("id", id);
  }
  revalidatePath("/admin/reports");
  revalidatePath(type === "event" ? "/admin/events" : "/admin/listings");
  revalidatePath(type === "event" ? "/events" : "/practitioners");
}

/** Resolve all open reports for a target (after a steward has acted/decided). */
export async function dismissReports(fd: FormData) {
  const sb = await admin();
  const type = str(fd, "type");
  const id = str(fd, "id");
  if (!id) return;
  const col = type === "event" ? "event_id" : "practitioner_id";
  await sb.from("reports").update({ status: "dismissed" }).eq(col, id).eq("status", "open");
  if (type === "practitioner") {
    await sb.from("practitioners").update({ flag_count: 0 }).eq("id", id);
  }
  revalidatePath("/admin/reports");
}

/** Land back on the categories page with a visible outcome banner. Every
 *  category action ends here — a swallowed DB error reads as "categories are
 *  capped" / "the button does nothing" (the July 14 report). */
function categoriesNotice(message: string): never {
  revalidatePath("/admin/categories");
  redirect(`/admin/categories?notice=${encodeURIComponent(message)}`);
}

export async function createCategory(fd: FormData) {
  const sb = await admin();
  const name = str(fd, "name");
  if (!name) return;
  const slug = slugify(name);

  // Slugs are unique, and a DEACTIVATED category still holds its slug — so a
  // deactivate-then-re-add used to fail silently. Detect the twin and act.
  const { data: existing } = await sb
    .from("categories")
    .select("id, name, active")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    if (existing.active) {
      categoriesNotice(
        `"${existing.name}" already exists with the same web address (${slug}). Rename that one instead if the wording is off.`,
      );
    }
    await sb
      .from("categories")
      .update({ name, active: true })
      .eq("id", existing.id);
    categoriesNotice(
      `"${existing.name}" was deactivated, not gone — reactivated it as "${name}" (its links and members are intact).`,
    );
  }

  const { data: max } = await sb
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((max as { sort_order: number } | null)?.sort_order ?? 0) + 1;
  const { error } = await sb
    .from("categories")
    .insert({ name, slug, sort_order, active: true });
  if (error) categoriesNotice(`Couldn't add "${name}": ${error.message}`);
  categoriesNotice(`Added "${name}".`);
}

export async function renameCategory(fd: FormData) {
  const sb = await admin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!id || !name) return;
  const { error } = await sb.from("categories").update({ name }).eq("id", id);
  if (error) categoriesNotice(`Couldn't rename: ${error.message}`);
  categoriesNotice(`Renamed to "${name}". The web address (slug) stays the same, so links keep working.`);
}

/** Delete a category — only when nothing uses it. A category with members or
 *  events keeps them findable; deactivating hides it without unlinking anyone. */
export async function deleteCategory(fd: FormData) {
  const sb = await admin();
  const id = str(fd, "id");
  if (!id) return;
  const { count: pc } = await sb
    .from("practitioner_categories")
    .select("practitioner_id", { count: "exact", head: true })
    .eq("category_id", id);
  const { count: ec } = await sb
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  const inUse = (pc ?? 0) + (ec ?? 0);
  if (inUse > 0) {
    categoriesNotice(
      `Can't delete: ${inUse} ${inUse === 1 ? "practice/event still uses" : "practices/events still use"} it. Deactivate it instead (hides it everywhere without unlinking anyone).`,
    );
  }
  const { error } = await sb.from("categories").delete().eq("id", id);
  if (error) categoriesNotice(`Couldn't delete: ${error.message}`);
  categoriesNotice("Deleted.");
}

export async function setCategoryActive(fd: FormData) {
  const sb = await admin();
  const id = str(fd, "id");
  const active = str(fd, "active") === "true";
  if (!id) return;
  await sb.from("categories").update({ active: !active }).eq("id", id);
  revalidatePath("/admin/categories");
}

export async function runImportNow() {
  await requireAdmin();
  await runCalendarImport();
  await geocodePending();
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

// --- Feedback board (user-testing phase) ----------------------------------

const FEEDBACK_STATUSES = ["new", "reviewing", "planned", "done", "declined"];
const FEEDBACK_PRIORITIES = ["low", "medium", "high"];

export async function setFeedbackStatus(fd: FormData) {
  const sb = await admin();
  const id = str(fd, "id");
  const status = str(fd, "status");
  if (!id || !FEEDBACK_STATUSES.includes(status)) return;
  await sb.from("feedback").update({ status }).eq("id", id);
  revalidatePath("/admin/feedback");
  revalidatePath("/admin");
}

export async function setFeedbackPriority(fd: FormData) {
  const sb = await admin();
  const id = str(fd, "id");
  const priority = str(fd, "priority");
  if (!id || !FEEDBACK_PRIORITIES.includes(priority)) return;
  await sb.from("feedback").update({ priority }).eq("id", id);
  revalidatePath("/admin/feedback");
}

export async function setFeedbackNote(fd: FormData) {
  const sb = await admin();
  const id = str(fd, "id");
  if (!id) return;
  const note = str(fd, "admin_note");
  await sb.from("feedback").update({ admin_note: note || null }).eq("id", id);
  revalidatePath("/admin/feedback");
}

export async function deleteFeedback(fd: FormData) {
  const sb = await admin();
  const id = str(fd, "id");
  if (!id) return;
  await sb.from("feedback").delete().eq("id", id);
  revalidatePath("/admin/feedback");
  revalidatePath("/admin");
}
