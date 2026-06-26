"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitEvent } from "@/lib/actions/submit-event";
import { INITIAL_FORM_STATE } from "@/lib/actions/types";
import type { Category } from "@/lib/types/database";

const labelCls = "block text-sm font-medium text-ink";
const inputCls =
  "mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm outline-none focus:border-sage";

export function EventForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(
    submitEvent,
    INITIAL_FORM_STATE,
  );

  if (state.status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-card p-8 text-center">
        <p className="font-display text-2xl text-forest">{state.message}</p>
        <p className="mt-2 text-sm text-muted">
          {state.pendingReview
            ? "We’ll take a quick look and it’ll appear soon."
            : "Thank you for sharing it with the community."}
        </p>
        <div className="mt-5 flex justify-center">
          <Link
            href="/events"
            className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream hover:bg-forest-deep"
          >
            See upcoming events
          </Link>
        </div>
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

      <Field label="Event title" required>
        <input name="title" required className={inputCls} />
      </Field>

      <Field label="Type of event" hint="Optional">
        <select name="category" className={inputCls} defaultValue="">
          <option value="">— choose a category —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Starts" required hint="Times are Toronto time">
          <input
            name="start_at"
            type="datetime-local"
            required
            className={inputCls}
          />
        </Field>
        <Field label="Ends" hint="Optional">
          <input name="end_at" type="datetime-local" className={inputCls} />
        </Field>
      </div>

      <fieldset>
        <legend className={labelCls}>How is it held?</legend>
        <div className="mt-2 flex gap-4 text-sm">
          {[
            { v: "in_person", l: "In person" },
            { v: "online", l: "Online" },
            { v: "both", l: "Both" },
          ].map((o, i) => (
            <label key={o.v} className="flex items-center gap-1.5">
              <input
                type="radio"
                name="mode"
                value={o.v}
                defaultChecked={i === 0}
              />
              {o.l}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Location" hint="Address, venue, or “online”">
        <input name="location_text" className={inputCls} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Registration / ticket link" hint="Optional — Luma, Eventbrite, etc.">
          <input name="registration_link" className={inputCls} />
        </Field>
        <Field label="Cost" hint="e.g. Free, PWYC, $20">
          <input name="cost_note" className={inputCls} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Host name" hint="Optional">
          <input name="host_name" className={inputCls} />
        </Field>
        <Field label="Repeats?">
          <select name="recurrence" className={inputCls} defaultValue="none">
            <option value="none">Does not repeat</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Every 2 weeks</option>
            <option value="monthly">Monthly</option>
          </select>
        </Field>
      </div>

      <Field label="Description" hint="Optional — what to expect">
        <textarea name="description" rows={3} maxLength={1000} className={inputCls} />
      </Field>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="agreement" required className="mt-1" />
        <span>
          This event supports healing, connection, and growth, and is shared in
          good faith. <span className="text-clay">*</span>
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-forest px-6 py-3 font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add this event"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>
        {label} {required && <span className="text-clay">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
