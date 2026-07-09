import Link from "next/link";
import { listPractitionersAdmin } from "@/lib/data/admin";
import {
  setPractitionerStatus,
  togglePractitionerFeatured,
  deletePractitioner,
} from "@/lib/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { ShareButton } from "@/components/share-button";
import { siteUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

// Status badge colours — so "Hide" gives obvious feedback (the row stays in the
// admin list on purpose, unlike Delete; without a clear badge it looked like
// nothing happened). Hidden/rejected listings are NOT public (public reads are
// live-only), so a hidden row here means "removed from the directory."
const STATUS_BADGE: Record<string, string> = {
  live: "bg-forest/12 text-forest-deep",
  hidden: "bg-clay/15 text-clay",
  pending: "bg-gold/15 text-gold",
  rejected: "bg-clay/15 text-clay",
};

export default async function ListingsAdminPage() {
  const practitioners = await listPractitionersAdmin();
  const liveCount = practitioners.filter((p) => p.status === "live").length;
  const hiddenCount = practitioners.filter(
    (p) => p.status === "hidden" || p.status === "rejected",
  ).length;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">
        Practitioners
      </h1>
      <p className="mt-1 mb-5 text-sm text-muted">
        {practitioners.length} total · {liveCount} live · {hiddenCount} hidden.
        Hidden listings stay here so you can restore them, but they don’t show in
        the public directory. Use <strong>Edit</strong> to change a listing
        yourself, or <strong>Copy edit link</strong> to send someone their own
        private edit link.
      </p>

      {practitioners.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-card/60 p-6 text-sm text-muted">
          No practitioners yet.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
          {practitioners.map((p) => {
            const isPublic = p.status === "live";
            return (
              <li
                key={p.id}
                className={`flex flex-wrap items-center gap-2 px-4 py-3 ${
                  isPublic ? "" : "bg-sand/30"
                }`}
              >
                <div className={`min-w-0 ${isPublic ? "" : "opacity-70"}`}>
                  <Link href={`/p/${p.slug}`} className="font-medium text-ink hover:underline">
                    {p.practice_name || p.name}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        STATUS_BADGE[p.status] ?? "bg-line/60 text-muted"
                      }`}
                    >
                      {p.status}
                    </span>
                    {p.featured ? <span>· featured</span> : null}
                    {p.flag_count > 0 ? <span>· {p.flag_count} flag(s)</span> : null}
                  </p>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                  {/* Edit reuses the owner's manage page — the same full editor,
                      no separate admin edit form to maintain. */}
                  <Link
                    href={`/manage/${p.manage_token}`}
                    className="rounded-full border border-line px-3 py-1 text-xs text-forest transition-colors hover:bg-sand"
                  >
                    Edit
                  </Link>
                  {/* Copy the practitioner's private edit link to send them (for
                      when they've lost it). ShareButton copies + confirms. */}
                  <ShareButton
                    url={siteUrl(`/manage/${p.manage_token}`)}
                    label="Copy edit link"
                    className="text-xs"
                  />
                  {isPublic ? (
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
            );
          })}
        </ul>
      )}
    </div>
  );
}
