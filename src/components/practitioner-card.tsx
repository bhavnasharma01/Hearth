import Link from "next/link";
import { externalHref, formatMode, instagramUrl, whatsappLink } from "@/lib/format";
import { formatDistance } from "@/lib/geo";
import type { PractitionerWithCategories } from "@/lib/types/database";

/**
 * A compact directory row: avatar, name (+ a small gold member mark), a one-line
 * description, a single meta line, and condensed contact actions. Sits in a
 * divided list — far lighter on a phone than a pill-heavy card.
 */
export function PractitionerCard({ p }: { p: PractitionerWithCategories }) {
  const primaryCategory = p.categories[0]?.name;
  const meta = [primaryCategory, p.area, formatMode(p.mode), p.pricing_note]
    .filter(Boolean)
    .join("  ·  ");
  const distance =
    p.distance_km != null ? formatDistance(p.distance_km) : null;

  return (
    // Stretched-link pattern: the name link's ::after covers the whole tile,
    // so anywhere on the card opens the profile — while the contact buttons
    // and Report link (positioned `relative`, later in the DOM) stay their own
    // tap targets. One tab stop for keyboards, no nested-link soup.
    <div className="relative px-4 py-3.5 transition-colors hover:bg-sand/40">
      <div className="flex items-start gap-3">
        <Avatar p={p} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium text-ink">
              <Link
                href={`/p/${p.slug}`}
                className="hover:text-forest hover:underline after:absolute after:inset-0 after:content-['']"
              >
                {p.practice_name || p.name}
              </Link>
            </h3>
            {p.is_member && (
              <span
                title="Community member"
                className="shrink-0 text-[11px] font-medium text-gold"
              >
                ✦&nbsp;member
              </span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-sm text-muted">
            {p.description}
          </p>
          {(meta || distance) && (
            <p className="mt-0.5 truncate text-xs text-muted/80">
              {distance && (
                <span className="font-semibold text-forest">{distance} · </span>
              )}
              {meta}
            </p>
          )}
        </div>
      </div>

      <div className="relative mt-2.5 flex flex-wrap items-center gap-2 pl-[3.75rem]">
        {p.whatsapp && (
          <Contact href={whatsappLink(p.whatsapp)} label="Message" primary />
        )}
        {p.email && <Contact href={`mailto:${p.email}`} label="Email" />}
        {p.website && <Contact href={externalHref(p.website)} label="Website" />}
        {p.instagram && (
          <Contact href={instagramUrl(p.instagram)} label="Instagram" />
        )}
        <Link
          href={`/report?type=practitioner&id=${p.id}`}
          className="ml-auto text-xs text-muted/70 hover:text-muted hover:underline"
        >
          Report
        </Link>
      </div>
    </div>
  );
}

function Avatar({ p }: { p: PractitionerWithCategories }) {
  const label = (p.practice_name || p.name).trim();
  const initial = label ? label[0].toUpperCase() : "·";
  const safePhoto =
    p.photo_url && /^https?:\/\//.test(p.photo_url) ? p.photo_url : null;

  if (safePhoto) {
    return (
      <div
        role="img"
        aria-label={label}
        className="h-12 w-12 shrink-0 rounded-full bg-sand bg-cover bg-center ring-1 ring-gold/30"
        style={{ backgroundImage: `url(${JSON.stringify(safePhoto)})` }}
      />
    );
  }
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sand font-display text-lg text-forest-deep ring-1 ring-gold/30">
      {initial}
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
          ? "rounded-full bg-forest px-3 py-1 text-xs font-medium text-cream transition-colors hover:bg-forest-deep"
          : "rounded-full border border-line px-3 py-1 text-xs text-forest transition-colors hover:bg-sand"
      }
    >
      {label}
    </a>
  );
}
