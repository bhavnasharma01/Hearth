import Link from "next/link";
import { ScrollRail } from "@/components/scroll-rail";
import type { Category } from "@/lib/types/database";

/**
 * Airbnb-style category rail: one horizontally-scrolling line of icon + short
 * label, with the active item underlined. Far more scannable than a row of
 * identical text pills. The links stay server-rendered (filtering is
 * URL-driven); the `ScrollRail` wrapper adds the client-side swipe affordance
 * (edge fades + chevron nudge buttons).
 *
 * Icons/short labels are mapped by slug for the 11 seeded categories; anything
 * an admin adds later gets an icon matched from the words in its name (see
 * `KEYWORD_ICONS`), falling back to a neutral glyph only when nothing matches —
 * so new categories never break the rail and rarely look unloved.
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

/**
 * Icon fallback for admin-added categories: match on the words in the name so
 * a new category gets a meaningful glyph without a code change. First match
 * wins — keep specific words above generic ones (e.g. "voice" before "heal").
 */
const KEYWORD_ICONS: [RegExp, string][] = [
  [/\b(voice|vocal|sing|choir|chant)/i, "🎤"],
  [/\b(sound|gong|drum|music)/i, "🥁"],
  [/\bretreat/i, "⛺"],
  [/\bbreath/i, "🌬️"],
  [/\b(yoga|meditat|mindful)/i, "🧘"],
  [/\b(danc|movement|somatic)/i, "💃"],
  [/\b(massage|bodywork)/i, "💆"],
  [/\b(reiki|energy)/i, "✨"],
  [/\b(herb|nutrition|food|diet|cook)/i, "🌱"],
  [/\b(plant|ceremon|medicine)/i, "🌿"],
  [/\b(astrolog|tarot|oracle|intuitiv|psychic|spirit)/i, "🔮"],
  [/\b(counsel|therap|coach|mental|emotion|grief|trauma)/i, "💛"],
  [/\b(art|paint|craft|creativ|pottery)/i, "🎨"],
  [/\b(writ|poet|journal|story)/i, "✍️"],
  [/\b(photo|film|video)/i, "📷"],
  [/\b(birth|doula|postpartum|fertilit|parent)/i, "🤱"],
  [/\b(child|kid|teen|youth)/i, "🧸"],
  [/\b(animal|pet|equine|horse)/i, "🐾"],
  [/\b(nature|forest|earth|garden|land|wild)/i, "🌳"],
  [/\b(water|swim|cold|ice|sauna)/i, "💧"],
  [/\bfire/i, "🔥"],
  [/\b(women|womxn|sister)/i, "🌙"],
  [/\b(men|man|brother)\b/i, "⛰️"],
  [/\b(circle|community|gathering)/i, "🤝"],
  [/\b(couple|relationship|intimacy)/i, "💞"],
  [/\b(class|workshop|course|teach|facilitat|training|school)/i, "🎓"],
  [/\b(business|brand|market|money|financ)/i, "💼"],
  [/\bheal/i, "✨"],
];

function metaFor(c: Category): { icon: string; short: string } {
  const seeded = CATEGORY_META[c.slug];
  if (seeded) return seeded;
  const match = KEYWORD_ICONS.find(([re]) => re.test(c.name));
  return {
    icon: match ? match[1] : "✻",
    short: c.name.split(/[,&]/)[0].trim().split(" ").slice(0, 2).join(" "),
  };
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
    <ScrollRail className="-mx-4" contentClassName="flex gap-1 px-4">
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
    </ScrollRail>
  );
}
