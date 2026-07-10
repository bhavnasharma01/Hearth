import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Testimonial } from "@/lib/types/database";

/** Approved testimonials for a live practitioner — the public read (RLS-bound). */
export async function getApprovedTestimonials(
  practitionerId: string,
): Promise<Testimonial[]> {
  const supabase = await getSupabaseServer();
  if (!supabase) return [];
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("practitioner_id", practitionerId)
    .order("created_at", { ascending: false });
  return (data as Testimonial[]) ?? [];
}

/**
 * All non-hidden testimonials on a practitioner, for the OWNER's moderation
 * section on /my-practice. Service-role read — callers must have verified the
 * session user owns the practitioner.
 */
export async function getTestimonialsForOwner(
  practitionerId: string,
): Promise<Testimonial[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("practitioner_id", practitionerId)
    .neq("status", "hidden")
    .order("created_at", { ascending: false });
  return (data as Testimonial[]) ?? [];
}

/**
 * Pending-approval counts per practitioner, for the My-practice chooser badges
 * (an owner with several listings must be able to SEE where kind words wait).
 * Service-role read; caller has verified ownership.
 */
export async function getPendingTestimonialCounts(
  practitionerIds: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  if (practitionerIds.length === 0) return counts;
  const supabase = getSupabaseAdmin();
  if (!supabase) return counts;
  const { data } = await supabase
    .from("testimonials")
    .select("practitioner_id")
    .in("practitioner_id", practitionerIds)
    .eq("status", "pending");
  for (const row of (data as { practitioner_id: string }[]) ?? []) {
    counts[row.practitioner_id] = (counts[row.practitioner_id] ?? 0) + 1;
  }
  return counts;
}

export interface MyTestimonial extends Testimonial {
  practitioner: { name: string; practice_name: string | null; slug: string } | null;
}

/** Everything a member has written, with who it's for ("My recommendations"). */
export async function getTestimonialsByAuthor(
  userId: string,
): Promise<MyTestimonial[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  const { data } = await supabase
    .from("testimonials")
    .select("*, practitioner:practitioners(name, practice_name, slug)")
    .eq("author_user_id", userId)
    .order("created_at", { ascending: false });
  return (data as unknown as MyTestimonial[]) ?? [];
}
