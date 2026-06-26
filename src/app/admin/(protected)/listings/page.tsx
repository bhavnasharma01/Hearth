import Link from "next/link";
import { listPractitionersAdmin } from "@/lib/data/admin";
import {
  setPractitionerStatus,
  togglePractitionerFeatured,
  deletePractitioner,
} from "@/lib/actions/admin";
import { ActionButton } from "@/components/admin/action-button";

export const dynamic = "force-dynamic";

export default async function ListingsAdminPage() {
  const practitioners = await listPractitionersAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">
        Practitioners
      </h1>
      <p className="mt-1 mb-5 text-sm text-muted">{practitioners.length} total.</p>

      {practitioners.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-card/60 p-6 text-sm text-muted">
          No practitioners yet.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
          {practitioners.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
              <div className="min-w-0">
                <Link href={`/p/${p.slug}`} className="font-medium text-ink hover:underline">
                  {p.practice_name || p.name}
                </Link>
                <p className="text-xs text-muted">
                  <span className="uppercase">{p.status}</span>
                  {p.featured ? " · featured" : ""}
                  {p.flag_count > 0 ? ` · ${p.flag_count} flag(s)` : ""}
                </p>
              </div>
              <div className="ml-auto flex flex-wrap gap-2">
                {p.status === "live" ? (
                  <ActionButton action={setPractitionerStatus} fields={{ id: p.id, status: "hidden" }}>
                    Hide
                  </ActionButton>
                ) : (
                  <ActionButton action={setPractitionerStatus} fields={{ id: p.id, status: "live" }} variant="primary">
                    Publish
                  </ActionButton>
                )}
                <ActionButton
                  action={togglePractitionerFeatured}
                  fields={{ id: p.id, featured: String(p.featured) }}
                >
                  {p.featured ? "Unfeature" : "Feature"}
                </ActionButton>
                <ActionButton action={deletePractitioner} fields={{ id: p.id }} variant="danger">
                  Delete
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
