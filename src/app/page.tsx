import Link from "next/link";
import { getEvents } from "@/lib/data/events";
import { getPractitioners } from "@/lib/data/practitioners";
import { EventCard } from "@/components/event-card";
import { PractitionerCard } from "@/components/practitioner-card";
import { EVENTS_ENABLED } from "@/lib/features";

// Reads live data per request (no build-time prerender of DB content).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Events are hidden for the practitioner-only pilot — skip fetching them.
  const [events, practitioners] = await Promise.all([
    EVENTS_ENABLED ? getEvents({ upcomingOnly: true, limit: 3 }) : [],
    getPractitioners({ limit: 3 }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Hero — deep, ceremonial */}
      <section className="pt-6">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-night to-night-2 px-6 py-14 text-center shadow-sm sm:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-gold-soft">
            Our community’s gathering place
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight text-cream sm:text-5xl">
            {EVENTS_ENABLED
              ? "A warm home for our community’s events and practitioners."
              : "A warm home for our community’s healers."}
          </h1>
          <div className="gold-rule mx-auto my-6 w-28" />
          <p className="mx-auto max-w-xl text-base leading-relaxed text-cream/75">
            {EVENTS_ENABLED
              ? "Search, discover, and connect — the practitioners and conscious events our community is building together."
              : "Search, discover, and connect — the practitioners our community is building together."}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/practitioners"
              className="rounded-full bg-gold px-6 py-3 font-medium text-night transition-colors hover:bg-gold-soft"
            >
              Find a practitioner
            </Link>
            <Link
              href={EVENTS_ENABLED ? "/events" : "/add-practitioner"}
              className="rounded-full border border-gold/40 px-6 py-3 font-medium text-cream transition-colors hover:bg-white/5"
            >
              {EVENTS_ENABLED ? "See what’s happening" : "Add your practice"}
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming events peek — hidden during the practitioner-only pilot. */}
      {EVENTS_ENABLED && (
        <HomeSection
          title="Coming up"
          href="/events"
          linkLabel="All events"
          empty="No upcoming events to show yet — they’ll appear here as they’re added."
          isEmpty={events.length === 0}
        >
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </HomeSection>
      )}

      {/* Practitioners peek */}
      <HomeSection
        title="From the directory"
        href="/practitioners"
        linkLabel="All practitioners"
        empty="No practitioners are listed yet — the directory will fill in as people add themselves."
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
