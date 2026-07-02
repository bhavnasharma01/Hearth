"use client";

import { useState } from "react";

/**
 * Share / copy-link control. On phones with the Web Share API it opens the
 * native share sheet (WhatsApp, Messages, …); everywhere else it copies the link
 * to the clipboard and briefly confirms.
 *
 * `url` is the absolute link to share — build it with `siteUrl()` at the call
 * site so it's the canonical deployed URL (not localhost / a preview host), and
 * so server and client render the same string (no hydration mismatch, no
 * effect). `showUrl` also renders the link in a selectable pill (used on the
 * "you're live" screen so a practitioner can see and grab their link).
 */
export function ShareButton({
  url,
  title,
  label = "Share",
  showUrl = false,
  className = "",
}: {
  url: string;
  title?: string;
  label?: string;
  showUrl?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user dismissed the sheet, or share failed — fall back to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked (rare) — the visible URL is still there to copy by hand
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showUrl && (
        <span className="min-w-0 flex-1 truncate rounded-full border border-line bg-sand/50 px-3 py-1.5 text-xs text-muted">
          {url.replace(/^https?:\/\//, "")}
        </span>
      )}
      <button
        type="button"
        onClick={handleShare}
        className="shrink-0 rounded-full border border-gold/50 px-4 py-1.5 text-sm font-medium text-forest transition-colors hover:bg-gold/10"
      >
        {copied ? "Link copied!" : label}
      </button>
    </div>
  );
}
