import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPractitionerBySlug,
  getPractitionerServices,
} from "@/lib/data/practitioners";
import { getEventsByHost } from "@/lib/data/events";
import { EventCard } from "@/components/event-card";
import { ShareButton } from "@/components/share-button";
import { externalHref, formatMode, instagramUrl, whatsappLink } from "@/lib/format";
import { siteUrl } from "@/lib/url";
import { EVENTS_ENABLED } from "@/lib/features";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPractitionerBySlug(slug);
  if (!p) return { title: "Not found · Hearth" };
  const name = p.practice_name || p.name;
  return {
    title: `${name} · Hearth`,
    description: p.description,
  };
}

export default async function PractitionerProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPractitionerBySlug(slug);
  if (!p) notFound();

  // Events are hidden for the practitioner-only pilot (see @/lib/features).
  const events = EVENTS_ENABLED ? await getEventsByHost(p.id) : [];
  const services = await getPractitionerServices(p.id);
  const label = (p.practice_name || p.name).trim();
  const initial = label ? label[0].toUpperCase() : "·";
  const safePhoto =
    p.photo_url && /^https?:\/\//.test(p.photo_url) ? p.photo_url : null;
  const meta = [p.area, formatMode(p.mode), p.languages, p.pricing_note]
    .filter(Boolean)
    .join("  ·  ");
  // "Offerings" chips from the free-text keywords field (comma/·-separated).
  const offerings = (p.keywords ?? "")
    .split(/[,·]/)
    .map((k) => k.trim())
    .filter(Boolean);

  // The single most direct way to reach them — surfaced in the header card so
  // the primary action never requires scrolling.
  const primaryContact = p.whatsapp
    ? { href: whatsappLink(p.whatsapp), label: "Message on WhatsApp" }
    : p.email
      ? { href: `mailto:${p.email}`, label: "Email" }
      : p.website
        ? { href: externalHref(p.website), label: "Visit website" }
        : p.instagram
          ? { href: instagramUrl(p.instagram), label: "Instagram" }
          : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/practitioners" className="text-sm text-muted hover:text-ink">
        ← All practitioners
      </Link>

      {/* Header card */}
      <header className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
        <div className="h-16 bg-gradient-to-r from-night to-forest-deep sm:h-20" />
        <div className="px-5 pb-5 sm:px-6">
          <div className="-mt-10 flex items-end gap-4 sm:-mt-12">
            {safePhoto ? (
              <div
                role="img"
                aria-label={label}
                className="h-24 w-24 shrink-0 rounded-2xl bg-sand bg-cover bg-center ring-4 ring-card sm:h-28 sm:w-28"
                style={{ backgroundImage: `url(${JSON.stringify(safePhoto)})` }}
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-sand font-display text-4xl text-forest-deep ring-4 ring-card sm:h-28 sm:w-28">
                {initial}
              </div>
            )}
          </div>

          <div className="mt-3">
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              {p.practice_name || p.name}
            </h1>
            {p.practice_name && <p className="text-muted">with {p.name}</p>}
            {(p.is_member || p.accepting_clients) && (
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {p.is_member && (
                  <span className="font-medium text-gold">✦ Community member</span>
                )}
                {p.accepting_clients && (
                  <span className="font-medium text-forest">✓ Taking new clients</span>
                )}
              </div>
            )}
          </div>

          {p.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.categories.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full bg-sand px-3 py-0.5 text-xs text-muted"
                >
                  {c.name}
                </span>
              ))}
            </div>
          )}

          {/* The primary action lives up top — contact shouldn't require scrolling. */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {primaryContact && (
              <Contact href={primaryContact.href} label={primaryContact.label} primary />
            )}
            <ShareButton url={siteUrl(`/p/${p.slug}`)} title={label} label="Share" />
          </div>
        </div>
      </header>

      {/* About */}
      <section className="mt-5">
        <p className="leading-relaxed text-ink">{p.description}</p>
        {p.bio && (
          <p className="mt-3 whitespace-pre-line leading-relaxed text-ink/90">
            {p.bio}
          </p>
        )}
        {meta && <p className="mt-3 text-sm text-muted">{meta}</p>}

        {offerings.length > 0 && (
          <div className="mt-4">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Specialties
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {offerings.map((k) => (
                <span
                  key={k}
                  className="rounded-full border border-line bg-card px-3 py-0.5 text-xs text-muted"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* What I offer (services menu) */}
      {services.length > 0 && (
        <section className="mt-5 rounded-[var(--radius-card)] border border-line bg-card p-5 sm:p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            What I offer
          </h2>
          <ul className="divide-y divide-line">
            {services.map((s) => (
              <li key={s.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-ink">{s.title}</span>
                  {s.price_note && (
                    <span className="shrink-0 text-sm text-forest">{s.price_note}</span>
                  )}
                </div>
                {s.description && (
                  <p className="mt-0.5 text-sm text-muted">{s.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Get in touch */}
      <section className="mt-5 rounded-[var(--radius-card)] border border-line bg-card p-5 sm:p-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Get in touch
        </h2>
        <p
          className={`mb-3 text-sm ${
            p.accepting_clients ? "text-forest" : "text-muted"
          }`}
        >
          {p.accepting_clients
            ? "✓ Currently taking new clients"
            : "Not currently taking new clients"}
        </p>
        <div className="flex flex-wrap gap-2">
          {p.whatsapp && (
            <Contact href={whatsappLink(p.whatsapp)} label="Message on WhatsApp" primary />
          )}
          {p.email && <Contact href={`mailto:${p.email}`} label="Email" />}
          {p.website && <Contact href={externalHref(p.website)} label="Website" />}
          {p.instagram && (
            <Contact href={instagramUrl(p.instagram)} label="Instagram" />
          )}
        </div>
      </section>

      {/* Hosted events */}
      {events.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Upcoming events
          </h2>
          <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-6">
        <Link
          href={`/report?type=practitioner&id=${p.id}`}
          className="text-xs text-muted underline hover:text-ink"
        >
          Report this listing
        </Link>
      </div>
    </div>
  );
}

function Contact({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={
        primary
          ? "rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
          : "rounded-full border border-line px-4 py-2 text-sm text-forest transition-colors hover:bg-sand"
      }
    >
      {label}
    </a>
  );
}
