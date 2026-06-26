import Link from "next/link";
import { listPractitionersAdmin, listEventsAdmin } from "@/lib/data/admin";
import { setPractitionerStatus, setEventStatus } from "@/lib/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { formatEventWhen } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const [practitioners, events] = await Promise.all([
    listPractitionersAdmin("pending"),
    listEventsAdmin({ onlyStatus: "pending" }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold text-ink">Moderation</h1>
      <p className="-mt-4 text-sm text-muted">
        Submissions held by the content check. Approve to publish, or reject to
        hide.
      </p>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Practitioners ({practitioners.length})
        </h2>
        {practitioners.length === 0 ? (
          <Empty>Nothing pending.</Empty>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
            {practitioners.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
                <Link href={`/p/${p.slug}`} className="font-medium text-ink hover:underline">
                  {p.practice_name || p.name}
                </Link>
                <div className="ml-auto flex gap-2">
                  <ActionButton action={setPractitionerStatus} fields={{ id: p.id, status: "live" }} variant="primary">
                    Approve
                  </ActionButton>
                  <ActionButton action={setPractitionerStatus} fields={{ id: p.id, status: "rejected" }} variant="danger">
                    Reject
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Events ({events.length})
        </h2>
        {events.length === 0 ? (
          <Empty>Nothing pending.</Empty>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
            {events.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{e.title}</p>
                  <p className="text-xs text-muted">{formatEventWhen(e.start_at, null)}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <ActionButton action={setEventStatus} fields={{ id: e.id, status: "live" }} variant="primary">
                    Approve
                  </ActionButton>
                  <ActionButton action={setEventStatus} fields={{ id: e.id, status: "hidden" }} variant="danger">
                    Reject
                  </ActionButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-card/60 p-6 text-sm text-muted">
      {children}
    </p>
  );
}
