import type { EventWithCategory, ListingMode } from "@/lib/types/database";

// The community is Toronto-based (the source calendar is America/Toronto),
// so we present all event times in that timezone for consistency.
const TZ = "America/Toronto";

export function formatMode(mode: ListingMode): string {
  switch (mode) {
    case "in_person":
      return "In person";
    case "online":
      return "Online";
    case "both":
      return "In person & online";
  }
}

/** "Sat, Jul 12 · 7:00–9:00 PM" (or just the start if there's no end). */
export function formatEventWhen(startISO: string, endISO: string | null): string {
  const start = new Date(startISO);
  const dayPart = new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: TZ,
  }).format(start);

  const startTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  }).format(start);

  if (!endISO) return `${dayPart} · ${startTime}`;

  const end = new Date(endISO);
  const sameDay =
    new Intl.DateTimeFormat("en-CA", { dateStyle: "short", timeZone: TZ }).format(start) ===
    new Intl.DateTimeFormat("en-CA", { dateStyle: "short", timeZone: TZ }).format(end);
  const endTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TZ,
  }).format(end);

  if (sameDay) return `${dayPart} · ${startTime}–${endTime}`;

  const endDay = new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: TZ,
  }).format(end);
  return `${dayPart} ${startTime} → ${endDay} ${endTime}`;
}

/** Calendar-style date parts in community time, e.g. { month:"JUL", day:"12", weekday:"Sat" }. */
export function eventDateParts(iso: string): {
  month: string;
  day: string;
  weekday: string;
} {
  const d = new Date(iso);
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { ...opts, timeZone: TZ }).format(d);
  return {
    month: fmt({ month: "short" }).toUpperCase(),
    day: fmt({ day: "numeric" }),
    weekday: fmt({ weekday: "short" }),
  };
}

/** "7:00–9:00 PM" when same day, else just the start time. */
export function formatTimeRange(startISO: string, endISO: string | null): string {
  const t = (iso: string) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: TZ,
    }).format(new Date(iso));
  const dayKey = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", { dateStyle: "short", timeZone: TZ }).format(
      new Date(iso),
    );
  if (!endISO) return t(startISO);
  if (dayKey(startISO) === dayKey(endISO)) return `${t(startISO)}–${t(endISO)}`;
  return t(startISO);
}

/** wa.me deep link from a free-text WhatsApp number (digits only, no '+'). */
export function whatsappLink(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

/** Normalize a website/social value into a safe absolute href. */
export function externalHref(raw: string): string {
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

/** A Google Calendar "add event" link, pre-filled (opens Google Calendar on web/app). */
export function googleCalendarUrl(e: {
  title: string;
  description: string | null;
  location_text: string | null;
  start_at: string;
  end_at: string | null;
}): string {
  const fmt = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const start = fmt(e.start_at);
  const end = fmt(
    e.end_at ??
      new Date(new Date(e.start_at).getTime() + 2 * 3600 * 1000).toISOString(),
  );
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${start}/${end}`,
  });
  if (e.description) params.set("details", e.description);
  if (e.location_text) params.set("location", e.location_text);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** A Google Maps link (opens the maps app on a phone) from coords or address text. */
export function mapsUrl(
  lat: number | null,
  lng: number | null,
  text: string | null,
): string | null {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  if (text) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`;
  }
  return null;
}

export interface EventGroup {
  key: string;
  label: string;
  events: EventWithCategory[];
}

/** Bucket upcoming events into This week / Next week / Later. */
export function groupUpcomingEvents(events: EventWithCategory[]): EventGroup[] {
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  const groups: EventGroup[] = [
    { key: "this-week", label: "This week", events: [] },
    { key: "next-week", label: "Next week", events: [] },
    { key: "later", label: "Later", events: [] },
  ];

  for (const event of events) {
    const delta = new Date(event.start_at).getTime() - now;
    if (delta < week) groups[0].events.push(event);
    else if (delta < 2 * week) groups[1].events.push(event);
    else groups[2].events.push(event);
  }

  return groups.filter((g) => g.events.length > 0);
}
