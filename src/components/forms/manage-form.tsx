"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateListing } from "@/lib/actions/manage-listing";
import { INITIAL_FORM_STATE } from "@/lib/actions/types";
import { AddressAutocomplete } from "@/components/forms/address-autocomplete";
import { AvatarUploader } from "@/components/forms/avatar-uploader";
import { ServicesEditor } from "@/components/forms/services-editor";
import type {
  Category,
  PractitionerService,
  PractitionerWithCategories,
} from "@/lib/types/database";

const labelCls = "block text-sm font-medium text-ink";
const inputCls =
  "mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm outline-none focus:border-sage";

export function ManageForm({
  listing,
  categories,
  services,
  token,
}: {
  listing: PractitionerWithCategories;
  categories: Category[];
  services: PractitionerService[];
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

      <div className="flex justify-center pt-1 pb-1">
        <AvatarUploader name="photo_url" initialUrl={listing.photo_url ?? ""} />
      </div>

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

      <SectionLabel>What you offer</SectionLabel>

      <fieldset>
        <legend className={labelCls}>
          Category <span className="text-clay">*</span>{" "}
          <span className="font-normal text-muted">(choose all that apply)</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => (
            <label
              key={c.id}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-sm text-ink transition-colors has-[:checked]:border-forest has-[:checked]:bg-forest has-[:checked]:text-cream has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-forest"
            >
              {/* Real checkbox as a peer so the marker reflects its state:
                  ＋ = tap to add, ✓ = chosen. */}
              <input
                type="checkbox"
                name="categories"
                value={c.slug}
                defaultChecked={chosen.has(c.slug)}
                className="peer sr-only"
              />
              <span aria-hidden className="text-muted peer-checked:hidden">＋</span>
              <span aria-hidden className="hidden peer-checked:inline">✓</span>
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Short description" required hint="~300 characters, shown on your card">
        <textarea
          name="description"
          required
          maxLength={400}
          rows={3}
          defaultValue={listing.description}
          className={inputCls}
        />
      </Field>

      <Field label="A little more about you" hint="Optional: shown on your profile">
        <textarea name="bio" rows={3} defaultValue={listing.bio ?? ""} className={inputCls} />
      </Field>

      <SectionLabel>Where &amp; how you work</SectionLabel>

      <Field
        label="Your area"
        required
        hint="How people find you in “near me.” As specific as a street address or as general as your city, whatever you’re comfortable sharing."
      >
        <AddressAutocomplete
          name="area"
          required
          defaultValue={listing.area ?? ""}
          placeholder="Start typing an address, neighbourhood, or city…"
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

      <SectionLabel>Ways to reach you</SectionLabel>

      <div className="rounded-xl border border-line bg-sand/40 p-4">
        <p className="mb-3 text-xs text-muted">
          At least one is required <span className="text-clay">*</span>
        </p>
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

      <SectionLabel>The details</SectionLabel>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Pricing note" hint="e.g. sliding scale, PWYC">
          <input name="pricing_note" defaultValue={listing.pricing_note ?? ""} className={inputCls} />
        </Field>
        <Field label="Languages spoken" hint="Optional">
          <input name="languages" defaultValue={listing.languages ?? ""} className={inputCls} />
        </Field>
      </div>

      <Field label="Keywords / offerings" hint="Optional: helps people find you">
        <input name="keywords" defaultValue={listing.keywords ?? ""} className={inputCls} />
      </Field>

      <SectionLabel>What I offer</SectionLabel>

      <div>
        <p className="mb-2 text-xs text-muted">
          Optional: a short menu of your services, shown on your profile.
        </p>
        <ServicesEditor initial={services} />
      </div>

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

/** Slim gold chapter heading — breaks the long form into scannable sections. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="pt-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
      {children}
    </p>
  );
}
