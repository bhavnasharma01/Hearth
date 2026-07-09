import { Logo } from "@/components/logo";

/** Calm sign-off only — no link row (it duplicated the header nav; Build 55).
 *  Future candidates live in Design.md §4 notes: an About page, community
 *  guidelines, or a steward contact — once those destinations exist. */
export function SiteFooter() {
  return (
    <footer className="mt-16 bg-night text-on-night/80">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Logo tone="light" />
        <div className="gold-rule my-4 max-w-xs" />
        <p className="max-w-prose text-sm leading-relaxed text-on-night/70">
          Made with care by our community, in a spirit of respect and mutual
          support.
        </p>
      </div>
    </footer>
  );
}
