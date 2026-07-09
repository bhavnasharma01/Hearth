import Link from "next/link";
import { Logo } from "@/components/logo";

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
        <nav className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href="/practitioners"
            className="text-on-night/60 transition-colors hover:text-on-night"
          >
            Browse practitioners
          </Link>
          <Link
            href="/add-practitioner"
            className="text-on-night/60 transition-colors hover:text-on-night"
          >
            Add your practice
          </Link>
        </nav>
      </div>
    </footer>
  );
}
