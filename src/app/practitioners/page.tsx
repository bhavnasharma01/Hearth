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
            Healers, facilitators, and conscious businesses we trust.
          </p>
        </div>
        <Link
          href="/add-practitioner"
          className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
        >
          ➕ Add your practice
        </Link>
      </header>

      {/* Near me */}
      <div className="mb-3">
        <LocationControl basePath="/practitioners" />
      </div>

      {/* Search */}
      <form action="/practitioners" method="get" className="mb-4">
        {category && <input type="hidden" name="category" value={category} />}
        {mode && <input type="hidden" name="mode" value={mode} />}
        {near && (
          <>
            <input type="hidden" name="lat" value={lat} />
            <input type="hidden" name="lng" value={lng} />
            <input type="hidden" name="radius" value={radius ?? "25"} />
          </>
        )}
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by name, practice, or what you need…"
            className="w-full rounded-full border border-line bg-card px-4 py-2.5 text-sm outline-none focus:border-sage"
          />
          <button
            type="submit"
            className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
          >
            Search
          </button>
        </div>
      </form>

      {/* Category filter */}
      {categoryOptions.length > 1 && (
        <div className="mb-3">
          <FilterChips
            options={categoryOptions}
            current={category}
            build={(value) =>
              `/practitioners${buildQuery({ q, category: value ?? undefined, mode, ...loc })}`
            }
          />
        </div>
      )}

      {/* Mode filter */}
      <div className="mb-6">
        <FilterChips
          options={MODE_OPTIONS}
          current={mode ?? null}
          build={(value) =>
            `/practitioners${buildQuery({ q, category: category ?? undefined, mode: value ?? undefined, ...loc })}`
          }
        />
      </div>

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
