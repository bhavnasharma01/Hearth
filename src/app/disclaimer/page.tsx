import type { Metadata } from "next";
import Link from "next/link";
import { FEEDBACK_ENABLED } from "@/lib/features";

export const metadata: Metadata = {
  title: "Disclaimer · Hearth",
  description:
    "What Hearth is and isn't: a community directory where practitioners describe themselves, not a vetting service or a source of professional advice.",
};

/**
 * The site disclaimer — public, plain-language, warm but load-bearing. Linked
 * from the footer on every page, from the quiet line at the bottom of each
 * practitioner profile, and from the community-agreement checkbox on the add
 * form. Written to already cover events, so nothing here changes when the
 * events layer returns.
 */
export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">
        Disclaimer
      </h1>
      <p className="mt-2 text-muted">
        Hearth is a free community directory, made with care by volunteers.
        This page says plainly what Hearth is, and what it isn&rsquo;t.
      </p>
      <p className="mt-1 text-sm text-muted">In effect since July 11, 2026.</p>

      <Section title="A directory, not an endorsement">
        <p>
          Practitioners write their own listings. Hearth and its stewards
          don&rsquo;t vet, verify, certify, or endorse anyone who appears here.
          The <span className="text-gold">✦ community member</span> badge and
          the kind words on a profile are signals from our community, not
          professional vetting, and not a guarantee of anything.
        </p>
      </Section>

      <Section title="Practitioners are independent">
        <p>
          Everyone listed on Hearth practises independently. They are not
          employees, agents, partners, or representatives of Hearth or the
          people who run it. Sessions, payments, and outcomes are arranged
          directly between you and the practitioner; Hearth is never part of
          that relationship.
        </p>
      </Section>

      <Section title="Not medical or professional advice">
        <p>
          Nothing on Hearth is medical, mental-health, legal, or financial
          advice, and no listing or event here is a substitute for care from a
          qualified provider. For health concerns, please talk to a doctor; in
          an emergency, call 911. When choosing who to work with, use your own
          judgment, ask your own questions, and trust your own sense of what
          feels right.
        </p>
      </Section>

      <Section title="Events and outside links">
        <p>
          Listings and events on Hearth often link out: to websites, booking
          pages, and registration platforms that Hearth doesn&rsquo;t run and
          can&rsquo;t control. What happens there, and at any gathering shared
          here, is the responsibility of the people offering it.
        </p>
      </Section>

      <Section title="Offered as is">
        <p>
          Hearth is a free community project, offered as is and as available,
          without warranties of any kind. To the fullest extent the law
          allows, Hearth&rsquo;s stewards and volunteers are not liable for any
          loss or harm arising from a listing, an event, or your work with a
          practitioner found here.
        </p>
      </Section>

      <Section title="If something seems wrong">
        <p>
          Tell us. Every profile has a quiet{" "}
          <Link href="/report" className="text-forest underline">
            report
          </Link>{" "}
          link
          {FEEDBACK_ENABLED && (
            <>
              , and you can always reach the stewards through{" "}
              <Link href="/feedback" className="text-forest underline">
                Support &amp; feedback
              </Link>
            </>
          )}
          . A human looks at every report.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If this page changes, the date at the top moves with it.
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
