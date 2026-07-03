import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/admin/sign-out-button";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/listings", label: "Practitioners" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/categories", label: "Categories" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-full">
      <div className="bg-night text-cream">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <span className="font-display text-lg text-cream">Hearth admin</span>
          <AdminNav items={NAV} />
          <span className="ml-auto flex items-center gap-3 text-xs text-cream/60">
            {user.email}
            <SignOutButton />
          </span>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
