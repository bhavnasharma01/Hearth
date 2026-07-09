import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/account";
import {
  getListingByOwner,
  findClaimableByEmail,
  getPractitionerServices,
} from "@/lib/data/practitioners";
import { getCategories } from "@/lib/data/categories";
import { claimListingByEmail } from "@/lib/actions/account";
import { ManageForm } from "@/components/forms/manage-form";
import { DeleteListing } from "@/components/delete-listing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My listing · Hearth",
  robots: { index: false, follow: false },
};

/**
 * The signed-in practitioner's home (accounts Phase B): edit your listing with
 * no link to remember. Reuses the manage-page editor by passing the listing's
 * own token server-side — rendered only to the verified owner.
 */
export default async function MyListingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/signin?next=/my-listing");

  const listing = await getListingByOwner(user.id);

  if (listing) {
    const [categories, services] = await Promise.all([
      getCategories(),
      getPractitionerServices(listing.id, true),
    ]);
    // manage_token is deliberately absent from the Practitioner TS type (it's a
    // secret; see Claude.md) but present on this service-role row. Passing it
    // here is safe: this page renders only to the verified owner.
    const token = (listing as unknown as { manage_token: string }).manage_token;
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-6">
          <h1 className="font-display text-3xl font-semibold text-ink">
            My listing
          </h1>
          <p className="mt-1 text-muted">
            Linked to your account. Update anything below, any time.
          </p>
          <Link
            href={`/p/${listing.slug}`}
            className="mt-2 inline-block text-sm text-gold hover:underline"
          >
            View your public profile →
          </Link>
        </header>
        <ManageForm
          listing={listing}
          categories={categories}
          services={services}
          token={token}
        />
        <DeleteListing token={token} />
      </div>
    );
  }

  // No owned listing — offer the claim path, then the add path.
  const claimable = user.email ? await findClaimableByEmail(user.email) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">
          My listing
        </h1>
      </header>

      {claimable ? (
        <div className="rounded-[var(--radius-card)] border border-gold/40 bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Is this you?
          </p>
          <p className="mt-2 text-ink">
            We found a listing whose contact email matches your account:{" "}
            <span className="font-medium">
              {claimable.practice_name || claimable.name}
            </span>
            .
          </p>
          <p className="mt-1 text-sm text-muted">
            Claiming links it to your account so you can edit it right here, no
            edit link needed.
          </p>
          <form action={claimListingByEmail} className="mt-4">
            <button
              type="submit"
              className="rounded-full bg-forest px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
            >
              Yes, claim my listing
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-card/60 p-6">
          <p className="text-ink">You don&rsquo;t have a listing yet.</p>
          <p className="mt-1 text-sm text-muted">
            Add your practice and it&rsquo;ll be linked to this account
            automatically.
          </p>
          <Link
            href="/add-practitioner"
            className="mt-4 inline-block rounded-full bg-forest px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
          >
            ＋ Add your practice
          </Link>
        </div>
      )}
    </div>
  );
}
