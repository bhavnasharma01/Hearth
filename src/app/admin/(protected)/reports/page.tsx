import { listOpenReports } from "@/lib/data/admin";
import { hideReportedListing, dismissReports } from "@/lib/actions/admin";
import { ActionButton } from "@/components/admin/action-button";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  live: "bg-forest/12 text-forest-deep",
  hidden: "bg-clay/15 text-clay",
  pending: "bg-gold/15 text-gold",
  rejected: "bg-clay/15 text-clay",
};

export default async function ReportsPage() {
  const groups = await listOpenReports();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Reports</h1>
      <p className="mt-1 mb-5 text-sm text-muted">
        Open reports, grouped by listing and sorted by distinct reporters. Flags
        never hide anything automatically. You decide. Both actions clear the
        report from this list: <strong>Hide listing</strong> takes it off the
        public site and resolves the report; <strong>Dismiss</strong> leaves the
        listing up and just clears the flags.
      </p>

      {groups.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-card/60 p-6 text-sm text-muted">
          No open reports. 🌿
        </p>
      ) : (
        <ul className="space-y-3">
          {groups.map((g) => (
            <li
              key={`${g.type}:${g.id}`}
              className="rounded-[var(--radius-card)] border border-line bg-card p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-muted">
                  {g.type}
                </span>
                <span className="font-medium text-ink">{g.label}</span>
                {g.status && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      STATUS_BADGE[g.status] ?? "bg-line/60 text-muted"
                    }`}
                  >
                    {g.status}
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    g.distinctReporters >= 3
                      ? "bg-clay/15 text-clay"
                      : "bg-sand text-muted"
                  }`}
                >
                  {g.distinctReporters} distinct reporter
                  {g.distinctReporters === 1 ? "" : "s"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">
                Reasons: {g.reasons.join(", ")}
              </p>
              {g.details.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-sm text-ink/80">
                  {g.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex gap-2">
                {g.status !== "hidden" && (
                  <ActionButton
                    action={hideReportedListing}
                    fields={{ type: g.type, id: g.id }}
                    variant="danger"
                  >
                    Hide listing
                  </ActionButton>
                )}
                <ActionButton
                  action={dismissReports}
                  fields={{ type: g.type, id: g.id }}
                >
                  Dismiss reports
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
