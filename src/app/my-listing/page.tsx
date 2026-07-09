import { redirect } from "next/navigation";

/** The owner page moved to /my-practice (Build 57 — vocabulary: one account
 *  holds one *practice*; "listing" stays steward/admin language). This
 *  redirect keeps any old links working, preserving the ?listing selection. */
export default async function MyListingRedirect({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string }>;
}) {
  const { listing } = await searchParams;
  redirect(listing ? `/my-practice?listing=${listing}` : "/my-practice");
}
