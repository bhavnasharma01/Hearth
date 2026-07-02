import { NextResponse } from "next/server";
import { runCalendarImport } from "@/lib/import/calendar";
import { geocodePending } from "@/lib/import/geocode-pending";
import { EVENTS_ENABLED } from "@/lib/features";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily Google Calendar import (Vercel Cron — see vercel.json). Keeps Hearth in
 * sync with events still added via the legacy Google Form during the transition.
 *
 * Protected by CRON_SECRET: Vercel Cron automatically sends
 * `Authorization: Bearer <CRON_SECRET>`. If CRON_SECRET is unset (e.g. local
 * dev), the endpoint is open so it can be triggered manually.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // Events are hidden for the practitioner-only pilot — don't spend the import
  // (or Nominatim geocoding budget) syncing events no one can see. The import is
  // safe to re-run, so it simply resumes when events are re-enabled.
  if (!EVENTS_ENABLED) {
    return NextResponse.json({ ok: true, skipped: "events-disabled" });
  }

  try {
    const importResult = await runCalendarImport();
    // Geocode any new addressed events/practitioners so they join "near me".
    const geocodeResult = await geocodePending();
    return NextResponse.json({
      ok: true,
      import: importResult,
      geocode: geocodeResult,
    });
  } catch (error) {
    console.error("cron import:", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
