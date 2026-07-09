"use client";

import { useState } from "react";
import { deleteListingByToken } from "@/lib/actions/account";

/**
 * The owner's "delete my listing" (July 6 call): a quiet danger zone with a
 * type-nothing confirm step. Deletion is permanent — the profile, its
 * services, and its category links go with it (a fresh add takes ~2 minutes).
 */
export function DeleteListing({ token }: { token: string }) {
  const [arming, setArming] = useState(false);

  return (
    <div className="mt-8 rounded-[var(--radius-card)] border border-clay/30 bg-clay/5 p-5">
      <p className="text-sm font-medium text-ink">Remove your listing</p>
      <p className="mt-1 text-xs text-muted">
        Takes your profile off Hearth entirely. This can&rsquo;t be undone, but
        you can always add yourself again later.
      </p>

      {!arming ? (
        <button
          type="button"
          onClick={() => setArming(true)}
          className="mt-3 rounded-full border border-clay/50 px-4 py-1.5 text-sm text-clay transition-colors hover:bg-clay/10"
        >
          Delete my listing
        </button>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <form action={deleteListingByToken} className="inline">
            <input type="hidden" name="manage_token" value={token} />
            <button
              type="submit"
              className="rounded-full bg-clay px-4 py-1.5 text-sm font-medium text-cream transition-colors hover:bg-clay/90"
            >
              Yes, delete it permanently
            </button>
          </form>
          <button
            type="button"
            onClick={() => setArming(false)}
            className="rounded-full border border-line px-4 py-1.5 text-sm text-ink transition-colors hover:bg-sand"
          >
            Keep my listing
          </button>
        </div>
      )}
    </div>
  );
}
