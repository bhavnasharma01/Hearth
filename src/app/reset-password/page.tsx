import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/account";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Set a new password · Hearth",
  robots: { index: false, follow: false },
};

/** Landing page for the password-reset email link. The link's code was already
 *  exchanged for a session by /auth/callback, so an unsigned visitor here
 *  means an expired/used link — send them back to request a fresh one. */
export default async function ResetPasswordPage() {
  const user = await getSessionUser();
  if (!user) redirect("/signin?error=reset");

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <div className="rounded-[var(--radius-card)] border border-line bg-card p-8">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Set a new password
        </h1>
        <p className="mt-2 text-sm text-muted">
          Choose a new password for {user.email}.
        </p>
        <div className="mt-6">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
