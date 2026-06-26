import {
  eventDateParts,
  externalHref,
  formatTimeRange,
  mapsUrl,
} from "@/lib/format";
import { formatDistance } from "@/lib/geo";
import type { EventWithCategory } from "@/lib/types/database";

/**
 * An agenda row: date badge, title, one clean meta line (with distance when a
 * "near me" location is active), and small Register / Directions actions.
 */
export function EventCard({ event }: { event: EventWithCategory }) {
  const { month, day, weekday } = eventDateParts(event.start_at);
  const where =
    event.location_text || (event.mode === "online" ? "Online" : null);
  const meta = [
    formatTimeRange(event.start_at, event.end_at),
    where,
    event.cost_note,
    event.recurrence_rule ? "recurring" : null,
  ]
    .filter(Boolean)
    .join("  ·  ");
  const distance =
    event.distance_km != null ? formatDistance(event.distance_km) : null;
  const directions = mapsUrl(event.latitude, event.longitude, event.location_text);

  return (
    <div className="flex items-start gap-4 px-4 py-3.5">
      <div className="flex w-11 shrink-0 flex-col items-center pt-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gold">
          {month}
        </span>
        <span className="font-display text-xl font-semibold leading-none text-forest-deep">
          {day}
        </span>
        <span className="text-[10px] text-muted">{weekday}</span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium text-ink">{event.title}</h3>
        <p className="mt-0.5 truncate text-sm text-muted">
          {distance && (
            <span className="font-semibold text-forest">{distance} · </span>
          )}
          {meta}
        </p>

        {(event.registration_link || directions) && (
          <div className="mt-1.5 flex flex-wrap gap-2">
            {event.registration_link && (
              <a
                href={externalHref(event.registration_link)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gold hover:underline"
              >
                Register ›
              </a>
            )}
            {directions && (
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-line px-2.5 py-0.5 text-xs text-forest transition-colors hover:bg-sand"
              >
                Directions
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
