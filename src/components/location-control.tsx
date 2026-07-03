"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const RADII = [5, 10, 25, 50];

/**
 * Compact "near me" control shared by the directory (and events). It sets
 * ?lat=&lng=&radius= on the current path (preserving other filters) so the server
 * sorts nearest-first and filters by radius — location is used only to build the
 * URL, never stored or sent elsewhere (privacy-first). Inactive it's a single
 * "📍 Near me" pill (with a reveal-on-demand "type a place" fallback); active it's
 * a slim pill with an inline radius dropdown + clear.
 */
export function LocationControl({
  basePath,
  compact = false,
}: {
  basePath: string;
  /** Icon-only inactive state (a round 📍 button) — for slotting into a search row. */
  compact?: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const active = Boolean(params.get("lat") && params.get("lng"));
  const radius = params.get("radius") ?? "25";

  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function go(next: URLSearchParams) {
    const qs = next.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  function apply(lat: number, lng: number) {
    const next = new URLSearchParams(params.toString());
    next.set("lat", lat.toFixed(5));
    next.set("lng", lng.toFixed(5));
    if (!next.get("radius")) next.set("radius", "25");
    go(next);
  }

  function useMyLocation() {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Location isn’t available here. Type a place instead.");
      setShowManual(true);
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBusy(false);
        apply(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setBusy(false);
        setShowManual(true);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Permission denied. Type a place instead."
            : "Couldn’t get your location. Try typing a place.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  async function submitManual(e: React.FormEvent) {
    e.preventDefault();
    if (manual.trim().length < 3) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(manual)}`);
      const json = (await res.json()) as {
        results?: Array<{ lat: number; lng: number }>;
      };
      const first = json.results?.[0];
      if (!first) setError("Couldn’t find that place.");
      else apply(first.lat, first.lng);
    } finally {
      setBusy(false);
    }
  }

  function setRadius(r: string) {
    const next = new URLSearchParams(params.toString());
    next.set("radius", r);
    go(next);
  }

  function clear() {
    const next = new URLSearchParams(params.toString());
    next.delete("lat");
    next.delete("lng");
    next.delete("radius");
    go(next);
  }

  if (active) {
    return (
      <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-forest/30 bg-sand/50 px-3 py-1.5 text-sm">
        <span className="font-medium text-forest-deep">📍 within</span>
        <select
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          aria-label="Search radius"
          className="rounded bg-transparent font-medium text-forest-deep outline-none"
        >
          {RADII.map((r) => (
            <option key={r} value={r}>
              {r} km
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={clear}
          aria-label="Clear location"
          className="ml-0.5 text-muted hover:text-clay"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="shrink-0">
      {compact ? (
        <button
          type="button"
          onClick={useMyLocation}
          disabled={busy}
          aria-label="Show practitioners near me"
          title="Near me"
          className={`flex h-11 w-11 items-center justify-center rounded-full border border-forest/30 bg-card text-base transition-colors hover:bg-sand disabled:opacity-60 ${
            busy ? "animate-pulse" : ""
          }`}
        >
          📍
        </button>
      ) : (
        <button
          type="button"
          onClick={useMyLocation}
          disabled={busy}
          className="rounded-full border border-forest/30 bg-card px-4 py-2.5 text-sm font-medium text-forest transition-colors hover:bg-sand disabled:opacity-60"
        >
          📍 {busy ? "Locating…" : "Near me"}
        </button>
      )}
      {showManual && (
        <form onSubmit={submitManual} className="mt-2 flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Neighbourhood or city"
            className="w-44 rounded-full border border-line bg-card px-3 py-1.5 text-sm outline-none focus:border-sage"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-forest px-3 py-1.5 text-sm font-medium text-cream hover:bg-forest-deep disabled:opacity-60"
          >
            Go
          </button>
        </form>
      )}
      {error && <p className="mt-1 text-xs text-clay">{error}</p>}
    </div>
  );
}
