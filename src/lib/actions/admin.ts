"use server";

import { revalidatePath } from "next/cache";
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
  await sb.from("practitioners").update({ status }).eq("id", id);
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/listings");
  revalidatePath("/practitioners");
}

export async function setEventStatus(fd: FormData) {
  const sb = await admin();
  const id = str(fd, "id");
  const status = str(fd, "status");
  if (!id || !EVENT_STATUSES.includes(status)) return;
  await sb.from("events").update({ status }).eq("id", id);
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

export async function createCategory(fd: FormData) {
  const sb = await admin();
  const name = str(fd, "name");
  if (!name) return;
  const { data: max } = await sb
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((max as { sort_order: number } | null)?.sort_order ?? 0) + 1;
  await sb
    .from("categories")
    .insert({ name, slug: slugify(name), sort_order, active: true });
  revalidatePath("/admin/categories");
}

export async function renameCategory(fd: FormData) {
  const sb = await admin();
  const id = str(fd, "id");
  const name = str(fd, "name");
  if (!id || !name) return;
  await sb.from("categories").update({ name }).eq("id", id);
  revalidatePath("/admin/categories");
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
