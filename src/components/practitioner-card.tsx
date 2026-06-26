import { externalHref, formatMode, whatsappLink } from "@/lib/format";
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

  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start gap-3">
        <Avatar p={p} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-medium text-ink">
              {p.practice_name || p.name}
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
          {meta && (
            <p className="mt-0.5 truncate text-xs text-muted/80">{meta}</p>
          )}
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2 pl-[3.25rem]">
        {p.whatsapp && (
          <Contact href={whatsappLink(p.whatsapp)} label="Message" primary />
        )}
        {p.email && <Contact href={`mailto:${p.email}`} label="Email" />}
        {p.website && <Contact href={externalHref(p.website)} label="Website" />}
        {p.instagram && (
          <Contact href={externalHref(p.instagram)} label="Instagram" />
        )}
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
        className="h-11 w-11 shrink-0 rounded-full bg-sand bg-cover bg-center ring-1 ring-gold/30"
        style={{ backgroundImage: `url(${JSON.stringify(safePhoto)})` }}
      />
    );
  }
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand font-display text-lg text-forest-deep ring-1 ring-gold/30">
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
