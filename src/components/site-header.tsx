"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { AccountControl } from "@/components/account-control";
import { EVENTS_ENABLED } from "@/lib/features";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/practitioners", label: "Practitioners" },
  // Events layer is hidden for the practitioner-only pilot (see @/lib/features).
  ...(EVENTS_ENABLED ? [{ href: "/events", label: "Events" }] : []),
];

export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-20 border-b border-gold/20 bg-night/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label="Hearth home">
          <Logo tone="light" />
        </Link>
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 transition-colors ${
                  isActive(item.href)
                    ? "bg-gold/15 text-gold-soft"
                    : "text-on-night/70 hover:bg-on-night/5 hover:text-on-night"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <AccountControl />
        </div>
      </div>
    </header>
  );
}
