"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitReport } from "@/lib/actions/submit-report";
import { INITIAL_FORM_STATE } from "@/lib/actions/types";

const inputCls =
  "mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm outline-none focus:border-sage";

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate" },
  { value: "not_real", label: "Not a real practitioner / event" },
  { value: "outdated", label: "Wrong or outdated info" },
  { value: "other", label: "Other" },
];

export function ReportForm({
  type,
  id,
  targetLabel,
}: {
  type: "practitioner" | "event";
  id: string;
  targetLabel: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    submitReport,
    INITIAL_FORM_STATE,
  );

  if (state.status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-card p-8 text-center">
        <p className="font-display text-xl text-forest">{state.message}</p>
        <div className="mt-5 flex justify-center">
          <Link
            href={type === "event" ? "/events" : "/practitioners"}
            className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream hover:bg-forest-deep"
          >
            Back to {type === "event" ? "events" : "the directory"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="id" value={id} />

      {state.status === "error" && (
        <p className="rounded-xl border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay">
          {state.message}
        </p>
      )}

      <p className="text-sm text-muted">
        Reporting{" "}
        <span className="font-medium text-ink">{targetLabel ?? "this listing"}</span>
        . Reports are private and never shown publicly — they simply send a quiet
        heads-up to a steward.
      </p>

      <div>
        <label className="block text-sm font-medium text-ink">
          Reason <span className="text-clay">*</span>
        </label>
        <select name="reason" required className={inputCls} defaultValue="">
          <option value="" disabled>
            — choose a reason —
          </option>
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">
          Your email or WhatsApp <span className="text-clay">*</span>
        </label>
        <input name="reporter_contact" required className={inputCls} />
        <p className="mt-1 text-xs text-muted">
          Used only to count distinct reports — never shown, never contacted for marketing.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">Anything else?</label>
        <textarea name="details" rows={3} className={inputCls} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-forest px-6 py-3 font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send report"}
      </button>
    </form>
  );
}
