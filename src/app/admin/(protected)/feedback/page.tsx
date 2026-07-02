import { listFeedback } from "@/lib/data/admin";
import {
  setFeedbackStatus,
  setFeedbackPriority,
  setFeedbackNote,
  deleteFeedback,
} from "@/lib/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import type {
  Feedback,
  FeedbackStatus,
  FeedbackType,
} from "@/lib/types/database";

export const dynamic = "force-dynamic";

const COLUMNS: { key: FeedbackStatus; label: string }[] = [
  { key: "new", label: "New" },
  { key: "reviewing", label: "Looking into it" },
  { key: "planned", label: "Planned" },
  { key: "done", label: "Done" },
  { key: "declined", label: "Declined" },
];

const TYPE_META: Record<FeedbackType, string> = {
  bug: "🐛 Bug",
  idea: "💡 Idea",
  confusing: "😕 Confusing",
  praise: "❤️ Love",
  other: "💬 Other",
};

const PRIORITIES: { key: "low" | "medium" | "high"; label: string }[] = [
  { key: "low", label: "Low" },
  { key: "medium", label: "Med" },
  { key: "high", label: "High" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

export default async function FeedbackPage() {
  const feedback = await listFeedback();
  const byStatus = (status: FeedbackStatus) =>
    feedback.filter((f) => f.status === status);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Feedback</h1>
      <p className="mt-1 mb-5 text-sm text-muted">
        From the private <code className="text-forest">/feedback</code> testing
        link. Move a card through the columns, set a priority, and jot a note —
        this is our prioritization board.
      </p>

      {feedback.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line bg-card/60 p-6 text-sm text-muted">
          No feedback yet — share the <code>/feedback</code> link with your
          testers and it’ll land here. 🌿
        </p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const items = byStatus(col.key);
            return (
              <section key={col.key} className="w-72 shrink-0">
                <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {col.label}
                  <span className="rounded-full bg-sand px-1.5 text-[11px] text-muted">
                    {items.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {items.map((f) => (
                    <Card key={f.id} f={f} />
                  ))}
                  {items.length === 0 && (
                    <p className="rounded-xl border border-dashed border-line/70 p-3 text-center text-xs text-muted/70">
                      —
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Card({ f }: { f: Feedback }) {
  const otherStatuses = COLUMNS.filter((c) => c.key !== f.status);
  return (
    <article className="rounded-[var(--radius-card)] border border-line bg-card p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-muted">
          {TYPE_META[f.type]}
        </span>
        <span className="text-[11px] text-muted">{formatDate(f.created_at)}</span>
      </div>

      <p className="mt-2 whitespace-pre-line text-ink">{f.message}</p>

      {f.context && (
        <p className="mt-1.5 text-xs text-muted">
          <span className="text-muted/70">Where:</span> {f.context}
        </p>
      )}
      {(f.submitter_name || f.submitter_contact) && (
        <p className="mt-1 text-xs text-muted">
          — {f.submitter_name || "anon"}
          {f.submitter_contact ? ` · ${f.submitter_contact}` : ""}
        </p>
      )}

      {/* Priority */}
      <div className="mt-3 flex items-center gap-1.5">
        <span className="text-[11px] uppercase tracking-wide text-muted/70">
          Priority
        </span>
        {PRIORITIES.map((p) =>
          f.priority === p.key ? (
            <span
              key={p.key}
              className="rounded-full bg-forest px-2 py-0.5 text-[11px] font-medium text-cream"
            >
              {p.label}
            </span>
          ) : (
            <ActionButton
              key={p.key}
              action={setFeedbackPriority}
              fields={{ id: f.id, priority: p.key }}
            >
              {p.label}
            </ActionButton>
          ),
        )}
      </div>

      {/* Move + note + delete */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {otherStatuses.map((s) => (
          <ActionButton
            key={s.key}
            action={setFeedbackStatus}
            fields={{ id: f.id, status: s.key }}
          >
            → {s.label}
          </ActionButton>
        ))}
      </div>

      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-muted hover:text-ink">
          {f.admin_note ? "Note ✎" : "Add note"}
        </summary>
        <form action={setFeedbackNote} className="mt-2">
          <input type="hidden" name="id" value={f.id} />
          <textarea
            name="admin_note"
            rows={2}
            defaultValue={f.admin_note ?? ""}
            placeholder="Private note…"
            className="w-full rounded-lg border border-line bg-card px-2 py-1 text-xs outline-none focus:border-sage"
          />
          <div className="mt-1.5 flex items-center justify-between">
            <button
              type="submit"
              className="rounded-full border border-line px-3 py-1 text-xs text-forest hover:bg-sand"
            >
              Save note
            </button>
            <ActionButton action={deleteFeedback} fields={{ id: f.id }} variant="danger">
              Delete
            </ActionButton>
          </div>
        </form>
      </details>
    </article>
  );
}
