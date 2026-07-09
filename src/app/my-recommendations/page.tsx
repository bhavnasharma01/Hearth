import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/account";
import { getTestimonialsByAuthor } from "@/lib/data/testimonials";
import { deleteOwnTestimonial } from "@/lib/actions/testimonials";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My recommendations · Hearth",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  pending: { text: "waiting for their approval", cls: "bg-gold/15 text-gold" },
  approved: { text: "on their profile", cls: "bg-forest/12 text-forest-deep" },
  hidden: { text: "not shown", cls: "bg-line/60 text-muted" },
};

/** The recommendations a member has written, with status (accounts Phase C). */
export default async function MyRecommendationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/signin?next=/my-recommendations");

  const testimonials = await getTestimonialsByAuthor(user.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-ink">
          My recommendations
        </h1>
        <p className="mt-1 text-muted">
          The kind words you&rsquo;ve written for practitioners. Each appears on
          their profile once they approve it.
        </p>
      </header>

      {testimonials.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-card/60 p-6">
          <p className="text-ink">Nothing here yet.</p>
          <p className="mt-1 text-sm text-muted">
            Worked with someone wonderful? Open their profile and tap
            &ldquo;Recommend&rdquo;.
          </p>
          <Link
            href="/practitioners"
            className="mt-4 inline-block rounded-full bg-forest px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-forest-deep"
          >
            Browse practitioners
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {testimonials.map((t) => {
            const badge = STATUS_LABEL[t.status] ?? STATUS_LABEL.hidden;
            const who = t.practitioner
              ? t.practitioner.practice_name || t.practitioner.name
              : "(removed)";
            return (
              <li
                key={t.id}
                className="rounded-[var(--radius-card)] border border-line bg-card p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {t.practitioner ? (
                    <Link
                      href={`/p/${t.practitioner.slug}`}
                      className="font-medium text-ink hover:underline"
                    >
                      {who}
                    </Link>
                  ) : (
                    <span className="font-medium text-muted">{who}</span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.cls}`}
                  >
                    {badge.text}
                  </span>
                </div>
                <p className="mt-2 break-words text-sm leading-relaxed text-ink/90">
                  &ldquo;{t.body}&rdquo;
                </p>
                <form action={deleteOwnTestimonial} className="mt-3">
                  <input type="hidden" name="id" value={t.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-clay/50 px-3 py-1 text-xs text-clay transition-colors hover:bg-clay/10"
                  >
                    Remove
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
