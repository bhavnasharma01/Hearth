import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admin sign in · Hearth" };

export default async function AdminLoginPage() {
  const user = await getAdminUser();
  if (user) redirect("/admin");

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Steward sign in
      </h1>
      <p className="mt-1 text-sm text-muted">
        For Hearth stewards only. Browsing the site never requires an account.
      </p>
      <div className="mt-6">
        <LoginForm />
      </div>
    </div>
  );
}
