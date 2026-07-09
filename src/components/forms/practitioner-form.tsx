"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitPractitioner } from "@/lib/actions/submit-practitioner";
import { INITIAL_FORM_STATE } from "@/lib/actions/types";
import { ShareButton } from "@/components/share-button";
import { AddressAutocomplete } from "@/components/forms/address-autocomplete";
import { AvatarUploader } from "@/components/forms/avatar-uploader";
import { siteUrl } from "@/lib/url";
import type { Category } from "@/lib/types/database";

const labelCls = "block text-sm font-medium text-ink";
const inputCls =
  "mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm outline-none focus:border-sage";

export function PractitionerForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(
    submitPractitioner,
    INITIAL_FORM_STATE,
  );

  if (state.status === "success") {
    const live = !state.pendingReview && Boolean(state.slug);
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-card p-8 text-center">
        <p className="font-display text-2xl text-forest">{state.message}</p>
        <p className="mt-2 text-sm text-muted">
          {state.pendingReview
            ? "We’ll take a quick look and it’ll be visible soon."
            : "Thank you for adding your practice to Hearth."}
        </p>

        {live && (
          <div className="mx-auto mt-6 max-w-sm">
            <p className="mb-2 text-sm font-medium text-ink">
              Your profile is live. Share it anywhere 🌿
            </p>
            <ShareButton
              url={siteUrl(`/p/${state.slug}`)}
              title="My Hearth profile"
              label="Copy link"
              showUrl
            />
          </div>
        )}

        {/* The listing is linked to the signed-in account — editing happens
            from "My practice", so no secret edit link to surface or lose. */}
        <p className="mx-auto mt-5 max-w-sm text-sm text-muted">
          Your practice is linked to your account. Update it anytime from{" "}
          <Link href="/my-practice" className="text-forest underline">
            My practice
          </Link>
          .
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {live && (
            <Link
              href={`/p/${state.slug}`}
              className="rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream hover:bg-forest-deep"
            >
              View your profile
            </Link>
          )}
          <Link
            href="/practitioners"
            className={
              live
                ? "rounded-full border border-line px-5 py-2.5 text-sm text-forest hover:bg-sand"
                : "rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-cream hover:bg-forest-deep"
            }
          >
            See the directory
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

      <div className="flex justify-center pt-1 pb-1">
        <AvatarUploader name="photo_url" />
      </div>

      <Field label="Your name" required>
        <input name="name" required className={inputCls} />
      </Field>

      <Field label="Practice or business name" hint="Optional: defaults to your name">
        <input name="practice_name" className={inputCls} />
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
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-sm text-ink transition-colors has-[:checked]:border-forest has-[:checked]:bg-forest has-[:checked]:text-cream"
            >
              {/* Real checkbox, used as a peer so the marker below can reflect
                  its state: ＋ = tap to add, ✓ = chosen (removes the
                  "is this selected or a button?" ambiguity of colour alone). */}
              <input type="checkbox" name="categories" value={c.slug} className="peer sr-only" />
              <span aria-hidden className="text-muted peer-checked:hidden">＋</span>
              <span aria-hidden className="hidden peer-checked:inline">✓</span>
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label="Short description of what you offer"
        required
        hint="~300 characters, shown on your card"
      >
        <textarea
          name="description"
          required
          maxLength={400}
          rows={3}
          className={inputCls}
        />
      </Field>

      <Field label="A little more about you" hint="Optional: shown on your profile">
        <textarea name="bio" rows={3} className={inputCls} />
      </Field>

      <SectionLabel>Where &amp; how you work</SectionLabel>

      <Field
        label="Your area"
        required
        hint="A neighbourhood or city. This is how people find you in “near me.” Pick a suggestion so it pins reliably. Use your general area, not your home address."
      >
        <AddressAutocomplete
          name="area"
          required
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
          ].map((o, i) => (
            <label key={o.v} className="flex items-center gap-1.5">
              <input
                type="radio"
                name="mode"
                value={o.v}
                defaultChecked={i === 2}
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
            <input name="whatsapp" inputMode="tel" className={inputCls} />
          </Field>
          <Field label="Email">
            <input name="email" type="email" className={inputCls} />
          </Field>
          <Field label="Website">
            <input name="website" className={inputCls} />
          </Field>
          <Field label="Instagram">
            <input name="instagram" className={inputCls} />
          </Field>
        </div>
      </div>

      <SectionLabel>The details</SectionLabel>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Pricing note" hint="e.g. sliding scale, PWYC">
          <input name="pricing_note" className={inputCls} />
        </Field>
        <Field label="Languages spoken" hint="Optional">
          <input name="languages" className={inputCls} />
        </Field>
      </div>

      <Field
        label="Keywords / offerings"
        hint="Optional: helps people find you (e.g. Thai massage, prenatal, lymphatic)"
      >
        <input name="keywords" className={inputCls} />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_member" />
        I’m a member of the community group
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="agreement" required className="mt-1" />
        <span>
          I offer this in good faith and agree to the community’s spirit of
          respect and care. <span className="text-clay">*</span>
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-forest px-6 py-3 font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add my practice"}
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
