import {
  listEventsAdmin,
  type AdminEvent,
} from "@/lib/data/admin";
import {
  setEventStatus,
  toggleEventFeatured,
  deleteEvent,
  runImportNow,
} from "@/lib/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { formatEventWhen } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EventsAdminPage() {
  const [pending, upcoming] = await Promise.all([
    listEventsAdmin({ onlyStatus: "pending" }),
    listEventsAdmin({ upcomingOnly: true, limit: 100 }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Events</h1>
        <form action={runImportNow}>
          <button
            type="submit"
            className="rounded-full border border-line bg-card px-4 py-2 text-sm text-forest transition-colors hover:bg-sand"
          >
            ⟳ Run import now
          </button>
        </form>
      </div>

      {pending.length > 0 && (
        <Section title={`Pending (${pending.length})`} rows={pending} />
      )}
      <Section title={`Upcoming (${upcoming.length})`} rows={upcoming} />
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: AdminEvent[] }) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-card/60 p-6 text-sm text-muted">
          Nothing here.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
          {rows.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{e.title}</p>
                <p className="text-xs text-muted">
                  {formatEventWhen(e.start_at, null)} ·{" "}
                  <span className="uppercase">{e.status}</span>
                  {e.featured ? " · featured" : ""} · {e.source}
                </p>
              </div>
              <div className="ml-auto flex flex-wrap gap-2">
                {e.status === "live" ? (
                  <ActionButton action={setEventStatus} fields={{ id: e.id, status: "hidden" }}>
                    Hide
                  </ActionButton>
                ) : (
                  <ActionButton action={setEventStatus} fields={{ id: e.id, status: "live" }} variant="primary">
                    Publish
                  </ActionButton>
                )}
                <ActionButton action={toggleEventFeatured} fields={{ id: e.id, featured: String(e.featured) }}>
                  {e.featured ? "Unfeature" : "Feature"}
                </ActionButton>
                <ActionButton action={deleteEvent} fields={{ id: e.id }} variant="danger">
                  Delete
                </ActionButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
