import { Logo } from "@/components/logo";
import { EVENTS_ENABLED } from "@/lib/features";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-night text-cream/80">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Logo tone="light" />
        <div className="gold-rule my-4 max-w-xs" />
        <p className="max-w-prose text-sm leading-relaxed text-cream/70">
          A volunteer community resource — a warm, lasting home for the{" "}
          {EVENTS_ENABLED
            ? "practitioners and conscious events we trust"
            : "practitioners our community trusts"}
          . Offered in a spirit of respect, care, and mutual support.
        </p>
      </div>
    </footer>
  );
}
