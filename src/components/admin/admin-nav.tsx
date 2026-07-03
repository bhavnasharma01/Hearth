"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Admin tab bar with an active state — so a steward always knows where they are. */
export function AdminNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-1 text-sm">
      {items.map((n) => {
        const active =
          n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`rounded-full px-3 py-1 transition-colors ${
              active
                ? "bg-gold/15 text-gold-soft"
                : "text-cream/70 hover:bg-white/10 hover:text-cream"
            }`}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
