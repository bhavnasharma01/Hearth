"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const inputCls =
  "mt-1 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm outline-none focus:border-sage";
const linkCls = "text-forest underline hover:text-forest-deep";

type Mode = "signin" | "signup" | "forgot";

/**
 * Email + password sign-in for /signin (accounts Phase A2), beside Google.
 * Three modes in one calm form: sign in, create account (Supabase sends a
 * confirmation link; the 0008 trigger creates the profile row with the name
 * from user_metadata), and forgot password (reset link → /reset-password).
 * All auth emails send via Supabase SMTP through Resend (Domain Setup Part 4).
 */
export function EmailSignInForm({ next = "/" }: { next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setNotice(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = getSupabaseBrowser();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        setError("That email and password don't match. Please try again.");
        return;
      }
      router.push(next);
      router.refresh();
      return;
    }

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name.trim() || null },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
      setNotice(
        "Almost there. We sent a confirmation link to your email; click it to finish creating your account.",
      );
      return;
    }

    // forgot
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNotice("Check your email for a link to set a new password.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-xl border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-xl border border-sage/50 bg-sage/10 px-4 py-3 text-sm text-ink">
          {notice}
        </p>
      )}

      {mode === "signup" && (
        <div>
          <label className="block text-sm font-medium text-ink">Your name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className={inputCls}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-ink">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className={inputCls}
        />
      </div>

      {mode !== "forgot" && (
        <div>
          <label className="block text-sm font-medium text-ink">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className={inputCls}
          />
          {mode === "signup" && (
            <p className="mt-1 text-xs text-muted">At least 6 characters.</p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-forest px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-forest-deep disabled:opacity-60"
      >
        {busy
          ? "One moment…"
          : mode === "signin"
            ? "Sign in"
            : mode === "signup"
              ? "Create account"
              : "Send reset link"}
      </button>

      <div className="space-y-1 text-center text-xs text-muted">
        {mode === "signin" && (
          <>
            <p>
              New here?{" "}
              <button type="button" onClick={() => switchMode("signup")} className={linkCls}>
                Create an account
              </button>
            </p>
            <p>
              <button type="button" onClick={() => switchMode("forgot")} className={linkCls}>
                Forgot your password?
              </button>
            </p>
          </>
        )}
        {mode === "signup" && (
          <p>
            Already have an account?{" "}
            <button type="button" onClick={() => switchMode("signin")} className={linkCls}>
              Sign in
            </button>
          </p>
        )}
        {mode === "forgot" && (
          <p>
            <button type="button" onClick={() => switchMode("signin")} className={linkCls}>
              Back to sign in
            </button>
          </p>
        )}
      </div>
    </form>
  );
}
