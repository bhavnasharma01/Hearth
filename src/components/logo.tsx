/** Hearth heart-flame mark + wordmark (chosen 2026-07-10). A heart holding a
 *  flame cutout — the heart·earth·hearth wordplay made visible. IMPORTANT: the
 *  identity lives in the flame cutout; never simplify this to a plain heart.
 *  The cutout must stay a TRUE flame — asymmetric, flicked tip, side tongue
 *  (redrawn in Build 89: the original symmetric teardrop read as a blood drop).
 *  Colours come from the palette's `flame-*` tokens so a reskin recolours it;
 *  the wordmark tone adapts to the surface: "dark" for light surfaces (the
 *  header), "light" for the deep stage (the footer). */
export function Logo({
  tone = "dark",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    // Mark bumped 28px → 34px (Build 84) — presence without shouting.
    <span className={`flex items-center gap-2 ${className}`}>
      <Flame className="h-[2.125rem] w-[2.125rem]" />
      <span
        className={`font-display text-[1.45rem] font-semibold tracking-tight ${
          tone === "light" ? "text-on-night-deep" : "text-ink"
        }`}
      >
        Hearth
      </span>
    </span>
  );
}

export function Flame({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block drop-shadow-[0_0_6px_var(--color-flame-glow)] ${className}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden className="h-full w-full">
        <defs>
          <linearGradient id="hearth-heartflame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-flame-hi)" />
            <stop offset="0.55" stopColor="var(--color-flame-mid)" />
            <stop offset="1" stopColor="var(--color-flame-lo)" />
          </linearGradient>
        </defs>
        {/* Heart with a flame-shaped cutout (evenodd makes the inner flame a hole). */}
        <path
          fill="url(#hearth-heartflame)"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 20.4C6.6 16 4 12.8 4 9.6 4 7.1 5.9 5.3 8.3 5.3c1.5 0 2.8.7 3.7 1.9.9-1.2 2.2-1.9 3.7-1.9 2.4 0 4.3 1.8 4.3 4.3 0 3.2-2.6 6.4-8 10.8zM12 16.4c-1.45 0-2.5-.95-2.5-2.35 0-.95.5-1.7 1.05-2.5.55-.8 1.05-1.75.85-2.95 1.15 1.05 1.75 2.2 1.6 3.4.6-.3.95-.85 1-1.65.5 1.1.5 2.5.5 3.7 0 1.4-1.05 2.35-2.5 2.35z"
        />
      </svg>
    </span>
  );
}
