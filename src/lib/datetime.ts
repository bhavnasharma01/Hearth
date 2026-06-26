// Helpers for turning a wall-clock time entered in the community's timezone
// (America/Toronto) into a correct UTC ISO timestamp for storage.

export const COMMUNITY_TZ = "America/Toronto";

/** How many minutes `tz` is ahead of UTC at the given instant (negative west of UTC). */
function offsetMinutes(tz: string, date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});

  const asTzUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour === "24" ? "0" : parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return (asTzUtc - date.getTime()) / 60000;
}

/**
 * Convert a `datetime-local` value ("YYYY-MM-DDTHH:mm"), understood as a wall
 * time in `tz`, into a UTC ISO string. Returns null for empty input.
 */
export function zonedLocalToISO(
  local: string | null | undefined,
  tz: string = COMMUNITY_TZ,
): string | null {
  if (!local) return null;
  const naiveUtcMs = new Date(`${local}:00Z`).getTime();
  if (Number.isNaN(naiveUtcMs)) return null;
  const off = offsetMinutes(tz, new Date(naiveUtcMs));
  return new Date(naiveUtcMs - off * 60000).toISOString();
}
