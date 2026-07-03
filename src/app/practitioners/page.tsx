import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import { getPractitioners } from "@/lib/data/practitioners";
import { PractitionerCard } from "@/components/practitioner-card";
import { FilterChips, type ChipOption } from "@/components/filter-chips";
import { CategoryRail } from "@/components/category-rail";
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

  const filtering = Boolean(q || category || mode || near);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Task-first header — one slim line; recruiting lives in the banner below. */}
      <header className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Find a practitioner
        </h1>
        <Link
          href="/add-practitioner"
          className="shrink-0 rounded-full border border-forest/40 px-4 py-1.5 text-sm font-medium text-forest transition-colors hover:bg-sand"
        >
          ＋ Add yours
        </Link>
      </header>

      {/* Command bar: one search pill + a near-me icon */}
      <div className="mb-2 flex flex-wrap items-start gap-2">
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
            placeholder="What do you need? e.g. massage, reiki, grief support"
            className="h-11 w-full rounded-full border border-line bg-card pl-4 pr-12 text-sm shadow-sm outline-none focus:border-sage"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-forest text-sm text-cream transition-colors hover:bg-forest-deep"
          >
            🔍
          </button>
        </form>
        <LocationControl basePath="/practitioners" compact />
      </div>

      {/* Category rail — icon + short label, the primary way to browse */}
      {categories.length > 0 && (
        <CategoryRail
          categories={categories}
          current={category}
          build={(value) =>
            `/practitioners${buildQuery({ q, category: value ?? undefined, mode, ...loc })}`
          }
        />
      )}

      {/* Secondary filters, tucked away (opens itself when one is active) */}
      <details open={Boolean(mode)} className="group mt-2 mb-5">
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
        <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-card/60 p-8 text-center">
          <p className="text-sm text-muted">
            {near
              ? `No practitioners within ${radiusKm} km yet — try a wider radius, or clear the location.`
              : filtering
                ? "No practitioners match this yet."
                : "No practitioners are listed yet — the directory fills in as people add themselves."}
          </p>
          <div className="mt-4">
            {filtering ? (
              <Link
                href="/practitioners"
                className="rounded-full border border-line px-4 py-2 text-sm text-forest hover:bg-sand"
              >
                Clear search & filters
              </Link>
            ) : (
              <Link
                href="/add-practitioner"
                className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream hover:bg-forest-deep"
              >
                Be the first — add your practice
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <p className="mb-2 text-xs text-muted">
            {practitioners.length}{" "}
            {practitioners.length === 1 ? "practitioner" : "practitioners"}
            {near ? " · nearest first" : ""}
          </p>
          <div className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
            {practitioners.map((p) => (
              <PractitionerCard key={p.id} p={p} />
            ))}
          </div>
        </>
      )}

      {/* Recruitment moment — after someone has seen the community, invite them in. */}
      <section className="mt-10 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-night to-forest-deep px-6 py-9 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-gold-soft">
          Offer your gifts
        </p>
        <h2 className="mx-auto mt-2 max-w-md font-display text-2xl font-semibold text-cream">
          Are you a practitioner?
        </h2>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-cream/75">
          It takes about two minutes, and you get a shareable profile page.
        </p>
        <Link
          href="/add-practitioner"
          className="mt-5 inline-block rounded-full bg-gold px-6 py-2.5 font-medium text-night transition-colors hover:bg-gold-soft"
        >
          Add your practice
        </Link>
      </section>
    </div>
  );
}
