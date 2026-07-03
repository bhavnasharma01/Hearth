import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeedbackForm } from "@/components/forms/feedback-form";
import { FEEDBACK_ENABLED } from "@/lib/features";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Share feedback · Hearth",
  // Unlisted testing page — keep it out of search results too.
  robots: { index: false, follow: false },
};

export default function FeedbackPage() {
  // Unlisted link, gated for the testing phase — 404 once it's switched off.
  if (!FEEDBACK_ENABLED) notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Help us shape Hearth
      </h1>
      <p className="mt-1 text-sm text-muted">
        You’re one of the first to try Hearth. Thank you. Tell us anything: what
        felt easy, what tripped you up, what’s missing. It goes straight to the
        team and helps us decide what to build next.
      </p>

      <div className="mt-6">
        <FeedbackForm />
      </div>
    </div>
  );
}
