import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingByManageToken } from "@/lib/data/practitioners";
import { getCategories } from "@/lib/data/categories";
import { ManageForm } from "@/components/forms/manage-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage your listing — Hearth",
  // Private per-listing edit link — keep it out of search engines.
  robots: { index: false, follow: false },
};

export default async function ManageListingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [listing, categories] = await Promise.all([
    getListingByManageToken(token),
    getCategories(),
  ]);
  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Manage your listing
        </h1>
        <p className="mt-1 text-muted">
          Update anything about your Hearth profile below. This is your private
          edit link — keep it handy (bookmark it) to make changes any time.
        </p>
        <Link
          href={`/p/${listing.slug}`}
          className="mt-2 inline-block text-sm text-gold hover:underline"
        >
          View your public profile →
        </Link>
      </header>
      <ManageForm listing={listing} categories={categories} token={token} />
    </div>
  );
}
