import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPractitionerBySlug } from "@/lib/data/practitioners";
import { getEventsByHost } from "@/lib/data/events";
import { EventCard } from "@/components/event-card";
import { externalHref, formatMode, whatsappLink } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPractitionerBySlug(slug);
  if (!p) return { title: "Not found — Hearth" };
  const name = p.practice_name || p.name;
  return {
    title: `${name} — Hearth`,
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

  const events = await getEventsByHost(p.id);
  const label = (p.practice_name || p.name).trim();
  const initial = label ? label[0].toUpperCase() : "·";
  const safePhoto =
    p.photo_url && /^https?:\/\//.test(p.photo_url) ? p.photo_url : null;
  const meta = [p.area, formatMode(p.mode), p.languages, p.pricing_note]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/practitioners"
        className="text-sm text-muted hover:text-ink"
      >
        ← All practitioners
      </Link>

      <header className="mt-4 flex items-start gap-4">
        {safePhoto ? (
          <div
            role="img"
            aria-label={label}
            className="h-20 w-20 shrink-0 rounded-full bg-sand bg-cover bg-center ring-1 ring-gold/40"
            style={{ backgroundImage: `url(${JSON.stringify(safePhoto)})` }}
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-sand font-display text-3xl text-forest-deep ring-1 ring-gold/40">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {p.practice_name || p.name}
          </h1>
          {p.practice_name && <p className="text-muted">with {p.name}</p>}
          {p.is_member && (
            <span className="mt-1 inline-block text-sm font-medium text-gold">
              ✦ Community member
            </span>
          )}
        </div>
      </header>

      {p.categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
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

      <p className="mt-4 leading-relaxed text-ink">{p.description}</p>
      {p.bio && (
        <p className="mt-3 whitespace-pre-line leading-relaxed text-ink/90">
          {p.bio}
        </p>
      )}
      {meta && <p className="mt-3 text-sm text-muted">{meta}</p>}

      {/* Contact */}
      <div className="mt-5 flex flex-wrap gap-2">
        {p.whatsapp && (
          <Contact href={whatsappLink(p.whatsapp)} label="Message on WhatsApp" primary />
        )}
        {p.email && <Contact href={`mailto:${p.email}`} label="Email" />}
        {p.website && <Contact href={externalHref(p.website)} label="Website" />}
        {p.instagram && (
          <Contact href={externalHref(p.instagram)} label="Instagram" />
        )}
      </div>

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
