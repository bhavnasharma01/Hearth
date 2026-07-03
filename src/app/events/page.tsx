import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import { getEvents } from "@/lib/data/events";
import { EventCard } from "@/components/event-card";
import { FilterChips, type ChipOption } from "@/components/filter-chips";
import { LocationControl } from "@/components/location-control";
import { groupUpcomingEvents } from "@/lib/format";
import { buildQuery, firstParam } from "@/lib/url";
import { EVENTS_ENABLED } from "@/lib/features";
import type { ListingMode } from "@/lib/types/database";

export const dynamic = "force-dynamic";

const MODE_OPTIONS: ChipOption[] = [
  { label: "All", value: null },
  { label: "In person", value: "in_person" },
  { label: "Online", value: "online" },
  { label: "Both", value: "both" },
];

const VALID_MODES = new Set(["in_person", "online", "both"]);

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Events layer is hidden for the practitioner-only pilot (see @/lib/features).
  if (!EVENTS_ENABLED) notFound();

  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim() || undefined;
  const category = firstParam(sp.category) ?? null;
  const rawMode = firstParam(sp.mode);
  const mode = (rawMode && VALID_MODES.has(rawMode) ? rawMode : undefined) as
    | ListingMode
    | undefined;

  // "Near me" location (from the LocationControl).
  const lat = firstParam(sp.lat);
  const lng = firstParam(sp.lng);
  const radius = firstParam(sp.radius);
  const near =
    lat && lng && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
      ? { lat: Number(lat), lng: Number(lng) }
      : null;
  const radiusKm = near ? Number(radius) || 25 : null;
  const loc = { lat, lng, radius };

  const [categories, events] = await Promise.all([
    getCategories(),
    getEvents({
      upcomingOnly: true,
      search: q,
      category: category ?? undefined,
      mode,
      near,
      radiusKm,
    }),
  ]);

  const groups = near ? null : groupUpcomingEvents(events);
  const categoryOptions: ChipOption[] = [
    { label: "All", value: null },
    ...categories.map((c) => ({ label: c.name, value: c.slug })),
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Upcoming events
          </h1>
          <p className="mt-1 text-sm text-muted">
            Conscious gatherings, easy to scan on your phone.
          </p>
        </div>
        <Link
          href="/add-event"
          className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
        >
          ➕ Add an event
        </Link>
      </header>

      {/* Near me */}
      <div className="mb-3">
        <LocationControl basePath="/events" />
      </div>

      {/* Search */}
      <form action="/events" method="get" className="mb-4">
        {category && <input type="hidden" name="category" value={category} />}
        {mode && <input type="hidden" name="mode" value={mode} />}
        {near && (
          <>
            <input type="hidden" name="lat" value={lat} />
            <input type="hidden" name="lng" value={lng} />
            <input type="hidden" name="radius" value={radius ?? "25"} />
          </>
        )}
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search events…"
            className="w-full rounded-full border border-line bg-card px-4 py-2.5 text-sm outline-none focus:border-sage"
          />
          <button
            type="submit"
            className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
          >
            Search
          </button>
        </div>
      </form>

      {categoryOptions.length > 1 && (
        <div className="mb-3">
          <FilterChips
            options={categoryOptions}
            current={category}
            build={(value) =>
              `/events${buildQuery({ q, category: value ?? undefined, mode, ...loc })}`
            }
          />
        </div>
      )}

      <div className="mb-6">
        <FilterChips
          options={MODE_OPTIONS}
          current={mode ?? null}
          build={(value) =>
            `/events${buildQuery({ q, category: category ?? undefined, mode: value ?? undefined, ...loc })}`
          }
        />
      </div>

      {/* Feed: nearest-first flat list when a location is active, else time agenda */}
      {near ? (
        events.length === 0 ? (
          <EmptyFeed>
            No upcoming events within {radiusKm} km. Try a wider radius above.
          </EmptyFeed>
        ) : (
          <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )
      ) : groups && groups.length === 0 ? (
        <EmptyFeed>
          {q || category || mode
            ? "No upcoming events match these filters."
            : "No upcoming events yet. Check back soon, or add one."}
        </EmptyFeed>
      ) : (
        <div className="space-y-6">
          {groups!.map((group) => (
            <section key={group.key}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                {group.label}
              </h2>
              <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
                {group.events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyFeed({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-card/60 p-8 text-center text-sm text-muted">
      {children}
    </p>
  );
}
