import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import { getSessionUser } from "@/lib/account";
import { PractitionerForm } from "@/components/forms/practitioner-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add your practice · Hearth",
  description: "Add yourself to the practitioner directory in about two minutes.",
};

export default async function AddPractitionerPage() {
  // Adding a practice is the just-in-time sign-in moment (accounts Phase B):
  // the listing binds to the account, so there's no edit link to lose.
  // Browsing stays accountless — this gate is only for contributing.
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-6">
          <h1 className="font-display text-3xl font-semibold text-ink">
            Add your practice
          </h1>
          <p className="mt-1 text-muted">
            It takes about two minutes, and clean listings appear right away.
          </p>
        </header>
        <div className="rounded-[var(--radius-card)] border border-line bg-card p-8 text-center">
          <p className="font-display text-xl text-ink">First, sign in</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Your listing is linked to your account, so you can edit it any time
            from &ldquo;My listing&rdquo;, with no edit link to keep track of.
          </p>
          <Link
            href="/signin?next=/add-practitioner"
            className="mt-5 inline-block rounded-full bg-forest px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
          >
            Sign in to continue
          </Link>
          <p className="mt-5 text-xs text-muted">
            Browsing the directory never needs an account.
          </p>
        </div>
      </div>
    );
  }

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Add your practice
        </h1>
        <p className="mt-1 text-muted">
          Share what you offer. It takes about two minutes, and clean listings
          appear right away.
        </p>
      </header>
      <PractitionerForm categories={categories} />
    </div>
  );
}
