import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import { getEvents } from "@/lib/data/events";
import { getPractitioners } from "@/lib/data/practitioners";
import { CategoryRail } from "@/components/category-rail";
import { EventCard } from "@/components/event-card";
import { PractitionerCard } from "@/components/practitioner-card";
import { buildQuery } from "@/lib/url";
import { EVENTS_ENABLED } from "@/lib/features";

// Reads live data per request (no build-time prerender of DB content).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Events are hidden for the practitioner-only pilot — skip fetching them.
  const [events, practitioners, categories] = await Promise.all([
    EVENTS_ENABLED ? getEvents({ upcomingOnly: true, limit: 3 }) : [],
    getPractitioners({ limit: 3 }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Hero — the warm center first; the search lives inside the warmth. */}
      <section className="pt-6">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-night to-night-2 px-6 py-12 text-center shadow-sm sm:py-16">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-gold-soft">
            Our gathering place
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight text-cream sm:text-5xl">
            {EVENTS_ENABLED
              ? "A warm home for our community’s events and practitioners."
              : "A warm home for our community’s healers."}
          </h1>
          <div className="gold-rule mx-auto my-6 w-28" />
          <p className="mx-auto max-w-xl text-base leading-relaxed text-cream/75">
            {EVENTS_ENABLED
              ? "Bodywork, breathwork, ceremony, counselling, and the gatherings where we meet."
              : "Bodywork, breathwork, ceremony, counselling. Find the right person for what you need."}
          </p>

          {/* The task, held gently: search goes straight to the directory. */}
          <form
            action="/practitioners"
            method="get"
            className="relative mx-auto mt-7 max-w-md"
          >
            <input
              type="search"
              name="q"
              placeholder="What are you looking for? massage, reiki, grief support…"
              className="h-12 w-full rounded-full border border-gold/25 bg-cream/95 pl-5 pr-14 text-sm text-ink shadow-lg outline-none placeholder:text-muted focus:border-gold"
            />
            <button
              type="submit"
              aria-label="Search practitioners"
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-sm text-night transition-colors hover:bg-gold-soft"
            >
              🔍
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Link
              href="/add-practitioner"
              className="rounded-full border border-gold/40 px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-white/5"
            >
              ＋ Add your practice
            </Link>
            <Link
              href="/practitioners"
              className="text-sm text-cream/75 transition-colors hover:text-cream"
            >
              Browse all practitioners →
            </Link>
            {EVENTS_ENABLED && (
              <Link
                href="/events"
                className="text-sm text-cream/75 transition-colors hover:text-cream"
              >
                See what’s happening →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming events peek — hidden during the practitioner-only pilot. */}
      {EVENTS_ENABLED && (
        <HomeSection
          title="Coming up"
          href="/events"
          linkLabel="All events"
          empty="No upcoming events to show yet. They’ll appear here as they’re added."
          isEmpty={events.length === 0}
        >
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </HomeSection>
      )}

      {/* Browse by need — the paths in, right after the welcome. */}
      {categories.length > 0 && (
        <section className="mt-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Browse by need
          </p>
          <CategoryRail
            categories={categories}
            current={null}
            build={(value) =>
              `/practitioners${buildQuery({ category: value ?? undefined })}`
            }
          />
        </section>
      )}

      {/* Practitioners peek */}
      <HomeSection
        title="From the directory"
        href="/practitioners"
        linkLabel="All practitioners"
        empty="No practitioners are listed yet. The directory will fill in as people add themselves."
        isEmpty={practitioners.length === 0}
      >
        {practitioners.map((p) => (
          <PractitionerCard key={p.id} p={p} />
        ))}
      </HomeSection>

      <div className="h-8" />
    </div>
  );
}

function HomeSection({
  title,
  href,
  linkLabel,
  empty,
  isEmpty,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  empty: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="py-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
        <Link href={href} className="text-sm font-medium text-gold hover:underline">
          {linkLabel} →
        </Link>
      </div>
      {isEmpty ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-card/60 p-6 text-sm text-muted">
          {empty}
        </p>
      ) : (
        <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
          {children}
        </div>
      )}
    </section>
  );
}
