"use client";

import { useActionState } from "react";
import { submitFeedback } from "@/lib/actions/submit-feedback";
import { INITIAL_FORM_STATE } from "@/lib/actions/types";

const inputCls =
  "mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm outline-none focus:border-sage";

const TYPES = [
  { value: "bug", label: "Something's broken" },
  { value: "other", label: "I need help" },
  { value: "idea", label: "An idea" },
  { value: "confusing", label: "Something's confusing" },
  { value: "praise", label: "Some love" },
];

export function FeedbackForm() {
  const [state, formAction, pending] = useActionState(
    submitFeedback,
    INITIAL_FORM_STATE,
  );

  if (state.status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-card p-8 text-center">
        <p className="font-display text-xl text-forest">{state.message}</p>
        <p className="mt-2 text-sm text-muted">
          Every note genuinely helps shape what we build next.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-full border border-line px-5 py-2.5 text-sm text-forest hover:bg-sand"
        >
          Send more feedback
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "error" && (
        <p className="rounded-xl border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay">
          {state.message}
        </p>
      )}

      <fieldset>
        <legend className="block text-sm font-medium text-ink">
          What&rsquo;s this about?
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {TYPES.map((t, i) => (
            <label
              key={t.value}
              className="cursor-pointer rounded-full border border-line bg-card px-3 py-1.5 text-sm text-ink has-[:checked]:border-forest has-[:checked]:bg-forest has-[:checked]:text-cream"
            >
              <input
                type="radio"
                name="type"
                value={t.value}
                defaultChecked={i === 0}
                className="sr-only"
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-medium text-ink">
          Your feedback <span className="text-clay">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="What worked, what didn't, what you'd change…"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">
          Where in the app? <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          name="context"
          placeholder="e.g. adding my practice, the near-me search, my profile page"
          className={inputCls}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink">
            Your name <span className="font-normal text-muted">(optional)</span>
          </label>
          <input name="submitter_name" className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">
            Email or WhatsApp <span className="font-normal text-muted">(optional)</span>
          </label>
          <input name="submitter_contact" className={inputCls} />
          <p className="mt-1 text-xs text-muted">
            Only if you’re open to us following up.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-forest px-6 py-3 font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}
