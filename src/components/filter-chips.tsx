import Link from "next/link";

export interface ChipOption {
  label: string;
  /** null = the "All" / no-filter option. */
  value: string | null;
}

/**
 * A row of tappable filter chips rendered as links, so filtering works without
 * client-side JavaScript. `build` maps an option value to its href (preserving
 * the page's other active filters).
 */
export function FilterChips({
  options,
  current,
  build,
}: {
  options: ChipOption[];
  current: string | null;
  build: (value: string | null) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = (option.value ?? "") === (current ?? "");
        return (
          <Link
            key={option.label}
            href={build(option.value)}
            className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
              active
                ? "bg-forest text-cream"
                : "border border-line bg-card text-muted hover:bg-sand hover:text-ink"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
