import {
  eventDateParts,
  externalHref,
  formatTimeRange,
} from "@/lib/format";
import type { EventWithCategory } from "@/lib/types/database";

/**
 * A single agenda row (not a tile): a date badge on the left, the title, and one
 * clean meta line (time · place · cost). Designed to sit in a divided list.
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

  const inner = (
    <div className="flex items-center gap-4 px-4 py-3.5">
      <div className="flex w-11 shrink-0 flex-col items-center">
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
        <p className="mt-0.5 truncate text-sm text-muted">{meta}</p>
      </div>
      {event.registration_link && (
        <span aria-hidden className="shrink-0 text-lg text-gold">
          ›
        </span>
      )}
    </div>
  );

  if (event.registration_link) {
    return (
      <a
        href={externalHref(event.registration_link)}
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-colors hover:bg-sand/40"
      >
        {inner}
      </a>
    );
  }
  return inner;
}
