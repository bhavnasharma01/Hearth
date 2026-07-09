"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitTestimonial } from "@/lib/actions/testimonials";
import { INITIAL_FORM_STATE } from "@/lib/actions/types";

const inputCls =
  "mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm outline-none focus:border-sage";

/** Write a recommendation for a practitioner (signed-in members only — the
 *  page gates the session). It publishes only after the practitioner approves. */
export function RecommendForm({
  practitionerId,
  practitionerLabel,
  defaultName,
}: {
  practitionerId: string;
  practitionerLabel: string;
  defaultName: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitTestimonial,
    INITIAL_FORM_STATE,
  );

  if (state.status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-card p-8 text-center">
        <p className="font-display text-xl text-forest">{state.message}</p>
        <Link
          href={`/p/${state.slug}`}
          className="mt-5 inline-block rounded-full bg-forest px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
        >
          Back to their profile
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" && (
        <p className="rounded-xl border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay">
          {state.message}
        </p>
      )}

      <input type="hidden" name="practitioner_id" value={practitionerId} />

      <div>
        <label className="block text-sm font-medium text-ink">
          Your recommendation <span className="text-clay">*</span>
        </label>
        <textarea
          name="body"
          required
          minLength={20}
          maxLength={600}
          rows={5}
          placeholder={`What was working with ${practitionerLabel} like?`}
          className={inputCls}
        />
        <p className="mt-1 text-xs text-muted">
          A sentence or two in your own words. No links.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink">
          Your name <span className="font-normal text-muted">(as it will appear)</span>
        </label>
        <input name="author_name" defaultValue={defaultName} className={inputCls} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send recommendation"}
      </button>

      <p className="text-center text-xs text-muted">
        {practitionerLabel} approves recommendations before they appear on their
        profile.
      </p>
    </form>
  );
}
