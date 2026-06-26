import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Admin reads use the service-role client (sees pending/hidden content). Only
// ever called from the gated /admin area / admin actions (which requireAdmin).

export interface AdminOverview {
  pendingPractitioners: number;
  pendingEvents: number;
  openReports: number;
  flaggedPractitioners: number;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const sb = getSupabaseAdmin();
  const zero = {
    pendingPractitioners: 0,
    pendingEvents: 0,
    openReports: 0,
    flaggedPractitioners: 0,
  };
  if (!sb) return zero;

  const head = (table: string) =>
    sb.from(table).select("*", { count: "exact", head: true });

  const [pp, pe, or, fp] = await Promise.all([
    head("practitioners").eq("status", "pending"),
    head("events").eq("status", "pending"),
    head("reports").eq("status", "open"),
    head("practitioners").gte("flag_count", 1),
  ]);

  return {
    pendingPractitioners: pp.count ?? 0,
    pendingEvents: pe.count ?? 0,
    openReports: or.count ?? 0,
    flaggedPractitioners: fp.count ?? 0,
  };
}

export interface AdminPractitioner {
  id: string;
  name: string;
  practice_name: string | null;
  slug: string;
  status: string;
  featured: boolean;
  flag_count: number;
  created_at: string;
}

export async function listPractitionersAdmin(
  onlyStatus?: string,
): Promise<AdminPractitioner[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  let q = sb
    .from("practitioners")
    .select("id, name, practice_name, slug, status, featured, flag_count, created_at")
    .order("created_at", { ascending: false });
  if (onlyStatus) q = q.eq("status", onlyStatus);
  const { data } = await q;
  return (data as AdminPractitioner[]) ?? [];
}

export interface AdminEvent {
  id: string;
  title: string;
  start_at: string;
  status: string;
  featured: boolean;
  source: string;
}

export async function listEventsAdmin(opts: {
  onlyStatus?: string;
  upcomingOnly?: boolean;
  limit?: number;
}): Promise<AdminEvent[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  let q = sb
    .from("events")
    .select("id, title, start_at, status, featured, source")
    .order("start_at", { ascending: true });
  if (opts.onlyStatus) q = q.eq("status", opts.onlyStatus);
  if (opts.upcomingOnly) q = q.gte("start_at", new Date().toISOString());
  if (opts.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data as AdminEvent[]) ?? [];
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  active: boolean;
}

export async function listCategoriesAdmin(): Promise<AdminCategory[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb
    .from("categories")
    .select("id, name, slug, sort_order, active")
    .order("sort_order", { ascending: true });
  return (data as AdminCategory[]) ?? [];
}

export interface ReportGroup {
  type: "practitioner" | "event";
  id: string;
  label: string;
  distinctReporters: number;
  reasons: string[];
  details: string[];
}

/** Open reports grouped by target, with distinct-reporter counts + labels. */
export async function listOpenReports(): Promise<ReportGroup[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const { data: reports } = await sb
    .from("reports")
    .select("practitioner_id, event_id, reason, details, reporter_contact")
    .eq("status", "open");
  if (!reports || reports.length === 0) return [];

  type Row = {
    practitioner_id: string | null;
    event_id: string | null;
    reason: string;
    details: string | null;
    reporter_contact: string | null;
  };

  const groups = new Map<
    string,
    {
      type: "practitioner" | "event";
      id: string;
      contacts: Set<string>;
      reasons: Set<string>;
      details: string[];
    }
  >();

  for (const r of reports as Row[]) {
    const type = r.practitioner_id ? "practitioner" : "event";
    const id = (r.practitioner_id ?? r.event_id)!;
    const key = `${type}:${id}`;
    if (!groups.has(key))
      groups.set(key, { type, id, contacts: new Set(), reasons: new Set(), details: [] });
    const g = groups.get(key)!;
    if (r.reporter_contact) g.contacts.add(r.reporter_contact);
    g.reasons.add(r.reason);
    if (r.details) g.details.push(r.details);
  }

  // Resolve labels in batch.
  const pracIds = [...groups.values()].filter((g) => g.type === "practitioner").map((g) => g.id);
  const evtIds = [...groups.values()].filter((g) => g.type === "event").map((g) => g.id);

  const labels = new Map<string, string>();
  if (pracIds.length) {
    const { data } = await sb
      .from("practitioners")
      .select("id, name, practice_name")
      .in("id", pracIds);
    for (const p of data ?? [])
      labels.set(
        `practitioner:${(p as { id: string }).id}`,
        (p as { practice_name: string | null; name: string }).practice_name ||
          (p as { name: string }).name,
      );
  }
  if (evtIds.length) {
    const { data } = await sb.from("events").select("id, title").in("id", evtIds);
    for (const e of data ?? [])
      labels.set(`event:${(e as { id: string }).id}`, (e as { title: string }).title);
  }

  return [...groups.values()]
    .map((g) => ({
      type: g.type,
      id: g.id,
      label: labels.get(`${g.type}:${g.id}`) ?? "(removed)",
      distinctReporters: g.contacts.size,
      reasons: [...g.reasons],
      details: g.details,
    }))
    .sort((a, b) => b.distinctReporters - a.distinctReporters);
}
