import Link from "next/link";
import { Logo } from "@/components/logo";
import { FEEDBACK_ENABLED } from "@/lib/features";

/** Calm sign-off. The one link is Support & feedback (Build 58) — the footer is
 *  its natural, subtle home (it exists nowhere else in the nav; header links
 *  are deliberately not repeated here). Hidden when FEEDBACK_ENABLED is off. */
export function SiteFooter() {
  return (
    <footer className="mt-16 bg-night-deep text-on-night-deep/80">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Logo tone="light" />
        <div className="gold-rule my-4 max-w-xs" />
        <p className="max-w-prose text-sm leading-relaxed text-on-night-deep/80">
          Made with care by our community, in a spirit of respect and mutual
          support.
        </p>
        {FEEDBACK_ENABLED && (
          <p className="mt-4 text-sm">
            <Link
              href="/feedback"
              className="text-on-night-deep/80 underline transition-colors hover:text-on-night-deep"
            >
              Support &amp; feedback
            </Link>
          </p>
        )}
      </div>
    </footer>
  );
}
