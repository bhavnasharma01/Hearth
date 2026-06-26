import type { SupabaseClient } from "@supabase/supabase-js";

export interface EventRow {
  external_id: string;
  title: string;
  description: string | null;
  registration_link: string | null;
  location_text: string | null;
  start_at: string;
  end_at: string | null;
  mode: "in_person" | "online" | "both";
  recurrence_rule: string | null;
  status: "live";
  source: "google_calendar";
}

export interface ImportSummary {
  candidates: number;
  alreadyImported: number;
  inserted: number;
}

export function buildIcsUrl(calendarId: string): string;

export function parseIcsToRows(
  icsText: string,
  opts: { importFromISO: string; nowISO: string; horizonDays?: number },
): EventRow[];

export function resetImported(supabase: SupabaseClient): Promise<void>;

export function dedupAndInsert(
  supabase: SupabaseClient,
  rows: EventRow[],
): Promise<ImportSummary>;
