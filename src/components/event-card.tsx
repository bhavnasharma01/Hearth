import { externalHref, formatEventWhen, formatMode } from "@/lib/format";
import type { EventWithCategory } from "@/lib/types/database";

export function EventCard({ event }: { event: EventWithCategory }) {
  return (
    <article className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-line bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-ink">
          {event.title}
        </h3>
        {event.category && (
          <span className="shrink-0 rounded-full bg-sand px-2.5 py-0.5 text-xs text-muted">
            {event.category.name}
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-forest-deep">
        {formatEventWhen(event.start_at, event.end_at)}
        {event.recurrence_rule ? " · recurring" : ""}
      </p>

      <p className="text-sm text-muted">
        {[formatMode(event.mode), event.location_text].filter(Boolean).join(" · ")}
        {event.cost_note ? ` · ${event.cost_note}` : ""}
      </p>

      {event.description && (
        <p className="text-sm leading-relaxed text-ink/90">
          {event.description}
        </p>
      )}

      {(event.host_name || event.registration_link) && (
        <div className="mt-1 flex flex-wrap items-center gap-3">
          {event.registration_link && (
            <a
              href={externalHref(event.registration_link)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-forest px-3 py-1.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
            >
              View / Register
            </a>
          )}
          {event.host_name && (
            <span className="text-sm text-muted">Hosted by {event.host_name}</span>
          )}
        </div>
      )}
    </article>
  );
}
