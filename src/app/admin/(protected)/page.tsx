import Link from "next/link";
import { getAdminOverview } from "@/lib/data/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const o = await getAdminOverview();
  const cards = [
    { label: "Pending practitioners", value: o.pendingPractitioners, href: "/admin/moderation" },
    { label: "Pending events", value: o.pendingEvents, href: "/admin/moderation" },
    { label: "Open reports", value: o.openReports, href: "/admin/reports" },
    { label: "Flagged practitioners", value: o.flaggedPractitioners, href: "/admin/reports" },
    { label: "New feedback", value: o.newFeedback, href: "/admin/feedback" },
  ];

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-semibold text-ink">
        Dashboard
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-[var(--radius-card)] border border-line bg-card p-5 transition-colors hover:bg-sand/40"
          >
            <p className="font-display text-3xl font-semibold text-forest">
              {c.value}
            </p>
            <p className="mt-1 text-sm text-muted">{c.label}</p>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">
        Use the tabs above to moderate submissions, review reports, manage
        practitioners and events, and edit categories.
      </p>
    </div>
  );
}
