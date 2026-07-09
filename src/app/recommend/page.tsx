import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getPractitionerBySlug } from "@/lib/data/practitioners";
import { getSessionUser } from "@/lib/account";
import { RecommendForm } from "@/components/forms/recommend-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recommend · Hearth",
  robots: { index: false, follow: false },
};

/** Write a recommendation for a practitioner. This is the just-in-time sign-in
 *  gateway from the profile page (accounts Phase C). */
export default async function RecommendPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p: slug } = await searchParams;
  if (!slug) notFound();

  const user = await getSessionUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(`/recommend?p=${slug}`)}`);

  const practitioner = await getPractitionerBySlug(slug);
  if (!practitioner) notFound();

  const label = practitioner.practice_name || practitioner.name;
  const defaultName =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "";

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Link href={`/p/${practitioner.slug}`} className="text-sm text-muted hover:text-ink">
        ← Back to {label}
      </Link>
      <h1 className="mt-3 font-display text-2xl font-semibold text-ink">
        Recommend {label}
      </h1>
      <p className="mt-1 text-sm text-muted">
        Worked with them? A few warm, honest words help the community find the
        right person.
      </p>
      <div className="mt-6">
        <RecommendForm
          practitionerId={practitioner.id}
          practitionerLabel={label}
          defaultName={defaultName}
        />
      </div>
    </div>
  );
}
