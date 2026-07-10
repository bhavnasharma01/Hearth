/** Hearth heart-flame mark + wordmark (chosen 2026-07-10). A heart holding a
 *  flame cutout — the heart·earth·hearth wordplay made visible. IMPORTANT: the
 *  identity lives in the flame cutout; never simplify this to a plain heart.
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
    <span className={`flex items-center gap-2 ${className}`}>
      <Flame className="h-7 w-7" />
      <span
        className={`font-display text-[1.35rem] font-semibold tracking-tight ${
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
          d="M12 20.4C6.6 16 4 12.8 4 9.6 4 7.1 5.9 5.3 8.3 5.3c1.5 0 2.8.7 3.7 1.9.9-1.2 2.2-1.9 3.7-1.9 2.4 0 4.3 1.8 4.3 4.3 0 3.2-2.6 6.4-8 10.8zM12 15.8c1.3 0 2.3-.9 2.3-2.2 0-1.4-1.2-2-2.3-3.9-1.1 1.9-2.3 2.5-2.3 3.9 0 1.3 1 2.2 2.3 2.2z"
        />
      </svg>
    </span>
  );
}
