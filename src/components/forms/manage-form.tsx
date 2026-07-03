"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateListing } from "@/lib/actions/manage-listing";
import { INITIAL_FORM_STATE } from "@/lib/actions/types";
import { AddressAutocomplete } from "@/components/forms/address-autocomplete";
import type { Category, PractitionerWithCategories } from "@/lib/types/database";

const labelCls = "block text-sm font-medium text-ink";
const inputCls =
  "mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm outline-none focus:border-sage";

export function ManageForm({
  listing,
  categories,
  token,
}: {
  listing: PractitionerWithCategories;
  categories: Category[];
  token: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateListing,
    INITIAL_FORM_STATE,
  );
  const chosen = new Set(listing.categories.map((c) => c.slug));

  if (state.status === "success") {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-card p-8 text-center">
        <p className="font-display text-xl text-forest">{state.message}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {!state.pendingReview && state.slug && (
            <Link
              href={`/p/${state.slug}`}
              className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream hover:bg-forest-deep"
            >
              View your profile
            </Link>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-full border border-line px-5 py-2.5 text-sm text-forest hover:bg-sand"
          >
            Keep editing
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="manage_token" value={token} />

      {state.status === "error" && (
        <p className="rounded-xl border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay">
          {state.message}
        </p>
      )}

      <Field label="Your name" required>
        <input name="name" required defaultValue={listing.name} className={inputCls} />
      </Field>

      <Field label="Practice or business name" hint="Optional">
        <input
          name="practice_name"
          defaultValue={listing.practice_name ?? ""}
          className={inputCls}
        />
      </Field>

      <fieldset>
        <legend className={labelCls}>
          Category <span className="text-clay">*</span>{" "}
          <span className="font-normal text-muted">(choose up to 3)</span>
        </legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {categories.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                name="categories"
                value={c.slug}
                defaultChecked={chosen.has(c.slug)}
              />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Short description" required hint="~300 characters — shows on your card">
        <textarea
          name="description"
          required
          maxLength={400}
          rows={3}
          defaultValue={listing.description}
          className={inputCls}
        />
      </Field>

      <Field label="A little more about you" hint="Optional — shown on your profile">
        <textarea name="bio" rows={3} defaultValue={listing.bio ?? ""} className={inputCls} />
      </Field>

      <Field
        label="Photo or logo link"
        hint="Optional — paste a link to an image (direct uploads coming soon)"
      >
        <input
          name="photo_url"
          inputMode="url"
          placeholder="https://…"
          defaultValue={listing.photo_url ?? ""}
          className={inputCls}
        />
      </Field>

      <Field
        label="Your area"
        required
        hint="Neighbourhood or city — how people find you in “near me.” Not your home address."
      >
        <AddressAutocomplete
          name="area"
          required
          defaultValue={listing.area ?? ""}
          placeholder="Start typing a neighbourhood or city…"
          inputClassName={inputCls}
        />
      </Field>

      <fieldset>
        <legend className={labelCls}>How do you work?</legend>
        <div className="mt-2 flex gap-4 text-sm">
          {[
            { v: "in_person", l: "In person" },
            { v: "online", l: "Online" },
            { v: "both", l: "Both" },
          ].map((o) => (
            <label key={o.v} className="flex items-center gap-1.5">
              <input
                type="radio"
                name="mode"
                value={o.v}
                defaultChecked={listing.mode === o.v}
              />
              {o.l}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="rounded-xl border border-line bg-sand/40 p-4">
        <p className="text-sm font-medium text-ink">
          Best way to reach you <span className="text-clay">*</span>
        </p>
        <p className="mb-3 text-xs text-muted">At least one is required.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="WhatsApp number">
            <input name="whatsapp" inputMode="tel" defaultValue={listing.whatsapp ?? ""} className={inputCls} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" defaultValue={listing.email ?? ""} className={inputCls} />
          </Field>
          <Field label="Website">
            <input name="website" defaultValue={listing.website ?? ""} className={inputCls} />
          </Field>
          <Field label="Instagram">
            <input name="instagram" defaultValue={listing.instagram ?? ""} className={inputCls} />
          </Field>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Pricing note" hint="e.g. sliding scale, PWYC">
          <input name="pricing_note" defaultValue={listing.pricing_note ?? ""} className={inputCls} />
        </Field>
        <Field label="Languages spoken" hint="Optional">
          <input name="languages" defaultValue={listing.languages ?? ""} className={inputCls} />
        </Field>
      </div>

      <Field label="Keywords / offerings" hint="Optional — helps people find you">
        <input name="keywords" defaultValue={listing.keywords ?? ""} className={inputCls} />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_member" defaultChecked={listing.is_member} />
        I’m a member of the community group
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="accepting_clients" defaultChecked={listing.accepting_clients} />
        I’m currently taking new clients
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-forest px-6 py-3 font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
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
