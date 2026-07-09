import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/account";
import {
  getListingsByOwner,
  findClaimableByEmail,
  getPractitionerServices,
} from "@/lib/data/practitioners";
import { getCategories } from "@/lib/data/categories";
import { claimListingByEmail } from "@/lib/actions/account";
import { ManageForm } from "@/components/forms/manage-form";
import { DeleteListing } from "@/components/delete-listing";
import type { PractitionerWithCategories } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My listing · Hearth",
  robots: { index: false, follow: false },
};

const STATUS_BADGE: Record<string, string> = {
  live: "bg-forest/12 text-forest-deep",
  hidden: "bg-clay/15 text-clay",
  pending: "bg-gold/15 text-gold",
  rejected: "bg-clay/15 text-clay",
};

/**
 * The signed-in practitioner's home (accounts Phase B): edit your listing with
 * no link to remember. The rule is ONE listing per account (enforced at create,
 * Build 56) — but earlier listings/claims can mean more than one, so this page
 * lists everything the account owns and lets each be edited or removed.
 */
export default async function MyListingPage({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/signin?next=/my-listing");

  const { listing: listingParam } = await searchParams;
  const listings = await getListingsByOwner(user.id);

  // Which listing to edit: the ?listing= selection (must be owned), or the
  // only one when there's exactly one.
  const selected =
    listings.find((l) => l.id === listingParam) ??
    (listings.length === 1 ? listings[0] : null);

  if (selected) {
    return <Editor listing={selected} showBack={listings.length > 1} />;
  }

  if (listings.length > 1) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-6">
          <h1 className="font-display text-3xl font-semibold text-ink">
            My listings
          </h1>
          <p className="mt-1 text-muted">
            Your account holds {listings.length} listings. Accounts are meant to
            hold one, so keep the one that&rsquo;s yours and remove any extras
            (open a listing to edit or delete it).
          </p>
        </header>
        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-card">
          {listings.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
              <div className="min-w-0">
                <p className="font-medium text-ink">{l.practice_name || l.name}</p>
                <p className="mt-0.5 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      STATUS_BADGE[l.status] ?? "bg-line/60 text-muted"
                    }`}
                  >
                    {l.status}
                  </span>
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                {l.status === "live" && (
                  <Link
                    href={`/p/${l.slug}`}
                    className="rounded-full border border-line px-4 py-1.5 text-sm text-ink transition-colors hover:bg-sand"
                  >
                    View
                  </Link>
                )}
                <Link
                  href={`/my-listing?listing=${l.id}`}
                  className="rounded-full bg-forest px-4 py-1.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
        </ul>
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

async function Editor({
  listing,
  showBack,
}: {
  listing: PractitionerWithCategories;
  showBack: boolean;
}) {
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
        {showBack && (
          <Link
            href="/my-listing"
            className="mb-2 inline-block text-sm text-muted hover:text-ink"
          >
            ← All my listings
          </Link>
        )}
        <h1 className="font-display text-3xl font-semibold text-ink">
          {listing.practice_name || listing.name}
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
