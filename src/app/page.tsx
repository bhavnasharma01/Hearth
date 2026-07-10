import Link from "next/link";
import { EVENTS_ENABLED } from "@/lib/features";

/**
 * Home is orientation only (July 6 call feedback): say what Hearth is, then
 * offer the two doors in. Search, the category rail, and the directory peek
 * live on /practitioners — showing them here too split people's attention
 * before they knew where they were. No data is fetched, so the page is static.
 */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="py-6">
        <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-night to-night-2 px-6 py-16 text-center shadow-sm sm:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-gold-soft">
            Our gathering place
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight text-on-night sm:text-5xl">
            {EVENTS_ENABLED
              ? "A warm home for our community’s events and practitioners."
              : "A warm home for our community’s healers."}
          </h1>
          <div className="gold-rule mx-auto my-6 w-28" />
          <p className="mx-auto max-w-xl text-base leading-relaxed text-on-night/75">
            {EVENTS_ENABLED
              ? "Bodywork, breathwork, ceremony, counselling, and the gatherings where we meet."
              : "Bodywork, breathwork, ceremony, counselling. Find the right person for what you need."}
          </p>

          {/* The two doors in: seekers and practitioners. */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {/* Juniper carries the primary action (F6 two-tone rule). */}
            <Link
              href="/practitioners"
              className="w-full max-w-xs rounded-full bg-forest px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-forest-deep sm:w-auto"
            >
              Find a practitioner
            </Link>
            <Link
              href="/add-practitioner"
              className="w-full max-w-xs rounded-full border border-gold/40 px-7 py-3 text-sm font-medium text-on-night transition-colors hover:bg-on-night/5 sm:w-auto"
            >
              ＋ Add your practice
            </Link>
          </div>

          {EVENTS_ENABLED && (
            <div className="mt-6">
              <Link
                href="/events"
                className="text-sm text-on-night/75 transition-colors hover:text-on-night"
              >
                See what’s happening →
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
