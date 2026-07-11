import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy · Hearth",
  description:
    "How Hearth handles your information: plainly, and with as little of it as possible.",
};

/**
 * The privacy policy — public, plain-language, and honest (its commitments
 * mirror documentation/Security.md §7; keep the two in sync). Also serves as
 * the privacy-policy URL Google's OAuth brand verification requires.
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Privacy</h1>
      <p className="mt-2 text-muted">
        Hearth is a community directory, not a data business. This page says
        plainly what we collect, what we never do, and the choices you have.
      </p>
      <p className="mt-1 text-sm text-muted">In effect since July 10, 2026.</p>

      <Section title="What Hearth collects">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Your account</strong>: your email and name, from Google
            sign-in or what you enter when creating an account. Passwords are
            managed by our sign-in provider (Supabase Auth); Hearth never sees
            or stores them.
          </li>
          <li>
            <strong>Your practice listing</strong>: everything on it (name,
            description, area, contact details, photo, services) is public
            because you chose to publish it. Your location is whatever you
            chose to share, from a street address to just your city, and the
            map on your profile always stays zoomed to the neighbourhood
            level.
          </li>
          <li>
            <strong>Recommendations you write</strong>: your words and the name
            you sign them with, shown publicly only after the practitioner
            approves them.
          </li>
          <li>
            <strong>Reports</strong>: if you report a profile, we ask for a
            contact so duplicate reports can be counted once. It is kept
            private, shown only to stewards, and never displayed.
          </li>
          <li>
            <strong>Support &amp; feedback messages</strong>: read by the
            stewards, never published.
          </li>
        </ul>
      </Section>

      <Section title="What Hearth never does">
        <ul className="list-disc space-y-2 pl-5">
          <li>No ads, no trackers, no third-party analytics, no selling or sharing data.</li>
          <li>
            Your <strong>&ldquo;near me&rdquo; location is never stored</strong>: it is used
            once, in your browser, to sort results by distance, and requires
            your permission each time.
          </li>
          <li>
            Contact happens directly (WhatsApp, email, Instagram links), so your
            conversations with practitioners never pass through Hearth.
          </li>
        </ul>
      </Section>

      <Section title="Cookies">
        <p>
          Hearth uses only the cookies needed to keep you signed in. There are
          no advertising or tracking cookies. One exception to know about:
          practitioner profiles embed a small Google neighbourhood map, and
          Google may set its own cookies when that map loads.
        </p>
      </Section>

      <Section title="Where your information lives">
        <p>
          Hearth runs on trusted infrastructure: Supabase (database and
          sign-in), Vercel (hosting), and Resend (delivering emails like
          confirmations and notifications). Each processes data only to provide
          that service.
        </p>
      </Section>

      <Section title="Your choices">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Edit or delete your practice</strong> anytime from{" "}
            <Link href="/my-practice" className="text-forest underline">
              My practice
            </Link>
            . Deleting removes it entirely.
          </li>
          <li>
            <strong>Remove recommendations you wrote</strong> from{" "}
            <Link href="/my-recommendations" className="text-forest underline">
              My recommendations
            </Link>
            ; practitioners control what appears on their own page.
          </li>
          <li>
            <strong>Delete your account</strong> or ask anything about your
            data through{" "}
            <Link href="/feedback" className="text-forest underline">
              Support &amp; feedback
            </Link>{" "}
            and a steward will take care of it.
          </li>
        </ul>
      </Section>

      <Section title="Changes">
        <p>
          If Hearth&rsquo;s practices change, this page changes first, and the
          date at the top moves with it.
        </p>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
        {title}
      </h2>
      <div className="space-y-2 text-[15px] leading-relaxed text-ink/90">
        {children}
      </div>
    </section>
  );
}
