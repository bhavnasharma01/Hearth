import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeedbackForm } from "@/components/forms/feedback-form";
import { FEEDBACK_ENABLED } from "@/lib/features";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Support & feedback · Hearth",
  // Keep it out of search results — it's for people already on Hearth.
  robots: { index: false, follow: false },
};

export default function FeedbackPage() {
  // Gated by FEEDBACK_ENABLED (flip off → 404 and the footer link disappears).
  if (!FEEDBACK_ENABLED) notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Support &amp; feedback
      </h1>
      <p className="mt-1 text-sm text-muted">
        Need a hand, spotted a problem, or have an idea? Tell us here. It goes
        straight to the stewards, and it shapes what we build next.
      </p>

      <div className="mt-6">
        <FeedbackForm />
      </div>
    </div>
  );
}
