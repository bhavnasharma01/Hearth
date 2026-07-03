import Link from "next/link";
import type { Category } from "@/lib/types/database";

/**
 * Airbnb-style category rail: one horizontally-scrolling line of icon + short
 * label, with the active item underlined. Far more scannable than a row of
 * identical text pills, and still pure links (no client JS — filtering stays
 * URL-driven and server-rendered).
 *
 * Icons/short labels are mapped by slug for the 11 seeded categories; anything
 * an admin adds later falls back to a neutral glyph + the first word of its
 * name, so new categories never break the rail.
 */

const CATEGORY_META: Record<string, { icon: string; short: string }> = {
  "bodywork-massage": { icon: "💆", short: "Massage" },
  "somatic-movement": { icon: "🧘", short: "Somatic" },
  "energy-healing": { icon: "✨", short: "Energy" },
  "manual-physical-therapies": { icon: "🤲", short: "Physical" },
  "mental-emotional-wellbeing": { icon: "💛", short: "Wellbeing" },
  "ceremony-plant-medicine": { icon: "🌿", short: "Ceremony" },
  "spiritual-guidance": { icon: "🔮", short: "Spiritual" },
  "nutrition-herbalism": { icon: "🌱", short: "Nutrition" },
  "classes-workshops-facilitation": { icon: "🎨", short: "Workshops" },
  "creative-expressive-arts": { icon: "🎭", short: "Creative" },
  "conscious-business-other": { icon: "🕯️", short: "Business" },
};

function metaFor(c: Category): { icon: string; short: string } {
  return (
    CATEGORY_META[c.slug] ?? {
      icon: "✻",
      short: c.name.split(/[,&]/)[0].trim().split(" ").slice(0, 2).join(" "),
    }
  );
}

export function CategoryRail({
  categories,
  current,
  build,
}: {
  categories: Category[];
  current: string | null;
  build: (value: string | null) => string;
}) {
  const items = [
    { slug: null as string | null, icon: "✻", short: "All", full: "All categories" },
    ...categories.map((c) => {
      const m = metaFor(c);
      return { slug: c.slug as string | null, icon: m.icon, short: m.short, full: c.name };
    }),
  ];

  return (
    <div className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const active = (item.slug ?? "") === (current ?? "");
        return (
          <Link
            key={item.short}
            href={build(item.slug)}
            title={item.full}
            className={`flex shrink-0 flex-col items-center gap-1 border-b-2 px-3 pb-2 pt-1.5 text-[11px] leading-none transition-colors ${
              active
                ? "border-forest font-semibold text-forest-deep"
                : "border-transparent text-muted hover:border-line hover:text-ink"
            }`}
          >
            <span aria-hidden className={`text-xl ${active ? "" : "opacity-80 grayscale-[35%]"}`}>
              {item.icon}
            </span>
            <span className="whitespace-nowrap">{item.short}</span>
          </Link>
        );
      })}
    </div>
  );
}
