"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/practitioners", label: "Practitioners" },
  { href: "/events", label: "Events" },
];

export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span aria-hidden className="text-xl">
            🔥
          </span>
          <span className="font-display text-xl font-semibold text-forest">
            Hearth
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                isActive(item.href)
                  ? "bg-forest text-cream"
                  : "text-muted hover:bg-sand hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
