import { externalHref, formatMode, whatsappLink } from "@/lib/format";
import type { PractitionerWithCategories } from "@/lib/types/database";

export function PractitionerCard({ p }: { p: PractitionerWithCategories }) {
  return (
    <article className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">
            {p.practice_name || p.name}
          </h3>
          {p.practice_name && (
            <p className="text-sm text-muted">with {p.name}</p>
          )}
        </div>
        {p.is_member && (
          <span className="shrink-0 rounded-full bg-sage/20 px-2.5 py-1 text-xs font-medium text-forest-deep">
            Community member
          </span>
        )}
      </div>

      {p.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {p.categories.map((c) => (
            <span
              key={c.id}
              className="rounded-full bg-sand px-2.5 py-0.5 text-xs text-muted"
            >
              {c.name}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm leading-relaxed text-ink/90">{p.description}</p>

      <p className="text-sm text-muted">
        {[p.area, formatMode(p.mode)].filter(Boolean).join(" · ")}
        {p.pricing_note ? ` · ${p.pricing_note}` : ""}
      </p>

      <div className="mt-1 flex flex-wrap gap-2">
        {p.whatsapp && (
          <ContactButton
            href={whatsappLink(p.whatsapp)}
            label="Message on WhatsApp"
          />
        )}
        {p.email && (
          <ContactButton href={`mailto:${p.email}`} label="Email" subtle />
        )}
        {p.website && (
          <ContactButton href={externalHref(p.website)} label="Website" subtle />
        )}
        {p.instagram && (
          <ContactButton
            href={externalHref(p.instagram)}
            label="Instagram"
            subtle
          />
        )}
      </div>
    </article>
  );
}

function ContactButton({
  href,
  label,
  subtle = false,
}: {
  href: string;
  label: string;
  subtle?: boolean;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={
        subtle
          ? "rounded-full border border-line px-3 py-1.5 text-sm text-forest transition-colors hover:bg-sand"
          : "rounded-full bg-forest px-3 py-1.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
      }
    >
      {label}
    </a>
  );
}
