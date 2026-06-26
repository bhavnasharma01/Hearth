import Link from "next/link";

export interface ChipOption {
  label: string;
  /** null = the "All" / no-filter option. */
  value: string | null;
}

/**
 * A single-line, horizontally scrollable strip of small filter chips (links, so
 * filtering needs no client JS). One slim line instead of a wrapping wall —
 * far kinder to a phone screen. `build` maps a value to its href.
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
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {options.map((option) => {
        const active = (option.value ?? "") === (current ?? "");
        return (
          <Link
            key={option.label}
            href={build(option.value)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors ${
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
