"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const RADII = [5, 10, 25, 50];

/**
 * "Near me" control shared by the Events and Practitioners pages. Sets ?lat=&lng=
 * &radius= on the current path (preserving other filters) so the server can sort
 * nearest-first and filter by radius. Location is used only to build the URL — it
 * is never sent anywhere else or stored on a server (privacy-first).
 */
export function LocationControl({ basePath }: { basePath: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const active = Boolean(params.get("lat") && params.get("lng"));
  const radius = params.get("radius") ?? "25";

  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState("");
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
      setError("Location isn’t available in this browser.");
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
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied — you can type a place instead."
            : "Couldn’t get your location — try typing a place.",
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

  function setRadius(r: number) {
    const next = new URLSearchParams(params.toString());
    next.set("radius", String(r));
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
      <div className="rounded-xl border border-line bg-sand/40 px-3 py-2.5 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-forest-deep">
            📍 Nearest first · within {radius} km
          </span>
          <button
            onClick={clear}
            className="text-xs text-muted underline hover:text-ink"
          >
            Clear
          </button>
        </div>
        <div className="mt-2 flex gap-1.5">
          {RADII.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                String(r) === radius
                  ? "bg-forest text-cream"
                  : "border border-line bg-card text-muted hover:bg-sand"
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        onClick={useMyLocation}
        disabled={busy}
        className="shrink-0 rounded-full border border-forest/30 bg-card px-4 py-2 text-sm font-medium text-forest transition-colors hover:bg-sand disabled:opacity-60"
      >
        📍 {busy ? "Locating…" : "Near me"}
      </button>
      <form onSubmit={submitManual} className="flex flex-1 gap-2">
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="or enter a neighbourhood / city"
          className="w-full rounded-full border border-line bg-card px-3 py-2 text-sm outline-none focus:border-sage"
        />
        <button
          type="submit"
          disabled={busy}
          className="shrink-0 rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream hover:bg-forest-deep disabled:opacity-60"
        >
          Go
        </button>
      </form>
      {error && <p className="text-xs text-clay">{error}</p>}
    </div>
  );
}
