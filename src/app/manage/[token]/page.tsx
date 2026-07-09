import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getListingByManageToken,
  getPractitionerServices,
} from "@/lib/data/practitioners";
import { getCategories } from "@/lib/data/categories";
import { getSessionUser } from "@/lib/account";
import { claimListingByToken } from "@/lib/actions/account";
import { ManageForm } from "@/components/forms/manage-form";
import { DeleteListing } from "@/components/delete-listing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage your listing · Hearth",
  // Private per-listing edit link — keep it out of search engines.
  robots: { index: false, follow: false },
};

export default async function ManageListingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [listing, categories, user] = await Promise.all([
    getListingByManageToken(token),
    getCategories(),
    getSessionUser(),
  ]);
  if (!listing) notFound();

  // Owner view — read services with the service-role client (listing may not be live).
  const services = await getPractitionerServices(listing.id, true);

  // Accounts Phase B: holding the link proves edit rights, so a signed-in
  // visitor may link an unowned listing to their account (then edit from
  // "My listing" with nothing to remember).
  const canClaim = user && !listing.owner_user_id;
  const isOwner = user && listing.owner_user_id === user.id;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Manage your listing
        </h1>
        <p className="mt-1 text-muted">
          Update anything about your Hearth profile below. This is your private
          edit link. Keep it handy (bookmark it) to make changes any time.
        </p>
        <Link
          href={`/p/${listing.slug}`}
          className="mt-2 inline-block text-sm text-gold hover:underline"
        >
          View your public profile →
        </Link>
      </header>

      {canClaim && (
        <div className="mb-6 rounded-[var(--radius-card)] border border-gold/40 bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Make it yours
          </p>
          <p className="mt-2 text-sm text-ink">
            You&rsquo;re signed in. Link this listing to your account and you can
            edit it from <span className="font-medium">My listing</span> any
            time, no link to remember.
          </p>
          <form action={claimListingByToken} className="mt-3">
            <input type="hidden" name="manage_token" value={token} />
            <button
              type="submit"
              className="rounded-full bg-forest px-5 py-2 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
            >
              Link to my account
            </button>
          </form>
        </div>
      )}

      {isOwner && (
        <p className="mb-6 rounded-xl border border-line bg-sand/40 px-4 py-3 text-sm text-muted">
          ✓ Linked to your account. You can also edit this any time from{" "}
          <Link href="/my-listing" className="text-forest underline">
            My listing
          </Link>
          .
        </p>
      )}

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
