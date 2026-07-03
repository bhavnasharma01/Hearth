import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import { getPractitioners } from "@/lib/data/practitioners";
import { PractitionerCard } from "@/components/practitioner-card";
import { FilterChips, type ChipOption } from "@/components/filter-chips";
import { LocationControl } from "@/components/location-control";
import { buildQuery, firstParam } from "@/lib/url";
import type { ListingMode } from "@/lib/types/database";

export const dynamic = "force-dynamic";

const MODE_OPTIONS: ChipOption[] = [
  { label: "All", value: null },
  { label: "In person", value: "in_person" },
  { label: "Online", value: "online" },
  { label: "Both", value: "both" },
];

const VALID_MODES = new Set(["in_person", "online", "both"]);
const MODE_LABEL: Record<string, string> = {
  in_person: "In person",
  online: "Online",
  both: "Both",
};

export default async function PractitionersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim() || undefined;
  const category = firstParam(sp.category) ?? null;
  const rawMode = firstParam(sp.mode);
  const mode = (rawMode && VALID_MODES.has(rawMode) ? rawMode : undefined) as
    | ListingMode
    | undefined;

  const lat = firstParam(sp.lat);
  const lng = firstParam(sp.lng);
  const radius = firstParam(sp.radius);
  const near =
    lat && lng && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))
      ? { lat: Number(lat), lng: Number(lng) }
      : null;
  const radiusKm = near ? Number(radius) || 25 : null;
  const loc = { lat, lng, radius };

  const [categories, practitioners] = await Promise.all([
    getCategories(),
    getPractitioners({
      search: q,
      category: category ?? undefined,
      mode,
      near,
      radiusKm,
    }),
  ]);

  const categoryOptions: ChipOption[] = [
    { label: "All", value: null },
    ...categories.map((c) => ({ label: c.name, value: c.slug })),
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Practitioners
          </h1>
          <p className="mt-1 text-sm text-muted">
            Healers, facilitators, and conscious businesses in our community.
          </p>
        </div>
        <Link
          href="/add-practitioner"
          className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
        >
          ➕ Add your practice
        </Link>
      </header>

      {/* Search + near me — one row */}
      <div className="mb-3 flex flex-wrap items-start gap-2">
        <form action="/practitioners" method="get" className="relative min-w-0 flex-1">
          {category && <input type="hidden" name="category" value={category} />}
          {mode && <input type="hidden" name="mode" value={mode} />}
          {near && (
            <>
              <input type="hidden" name="lat" value={lat} />
              <input type="hidden" name="lng" value={lng} />
              <input type="hidden" name="radius" value={radius ?? "25"} />
            </>
          )}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search name, practice, or need…"
            className="w-full rounded-full border border-line bg-card py-2.5 pl-4 pr-12 text-sm outline-none focus:border-sage"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-forest px-3 py-1.5 text-sm text-cream transition-colors hover:bg-forest-deep"
          >
            🔍
          </button>
        </form>
        <LocationControl basePath="/practitioners" />
      </div>

      {/* Category chips */}
      {categoryOptions.length > 1 && (
        <div className="mb-2">
          <FilterChips
            options={categoryOptions}
            current={category}
            build={(value) =>
              `/practitioners${buildQuery({ q, category: value ?? undefined, mode, ...loc })}`
            }
          />
        </div>
      )}

      {/* Mode — tucked into a slim disclosure (opens if one's active) */}
      <details open={Boolean(mode)} className="group mb-6">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs text-muted hover:text-ink">
          <span className="transition-transform group-open:rotate-90">›</span>
          Filters{mode ? ` · ${MODE_LABEL[mode]}` : ""}
        </summary>
        <div className="mt-2">
          <FilterChips
            options={MODE_OPTIONS}
            current={mode ?? null}
            build={(value) =>
              `/practitioners${buildQuery({ q, category: category ?? undefined, mode: value ?? undefined, ...loc })}`
            }
          />
        </div>
      </details>

      {/* Results */}
      {practitioners.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-card/60 p-8 text-center text-sm text-muted">
          {near
            ? `No practitioners within ${radiusKm} km yet — try a wider radius, or clear the location.`
            : q || category || mode
              ? "No practitioners match these filters yet. Try clearing them."
              : "No practitioners are listed yet — the directory will fill in as people add themselves."}
        </p>
      ) : (
        <>
          <p className="mb-2 text-xs text-muted">
            {practitioners.length}{" "}
            {practitioners.length === 1 ? "practitioner" : "practitioners"}
          </p>
          <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
            {practitioners.map((p) => (
              <PractitionerCard key={p.id} p={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
