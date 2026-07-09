/** Hearth flame mark + wordmark. The flame's gradient and glow come from the
 *  palette's `flame-*` tokens (see globals.css) so a reskin recolours it; the
 *  wordmark tone adapts to the surface ("light" = on a night surface, "dark" =
 *  on parchment). */
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
          tone === "light" ? "text-on-night" : "text-forest-deep"
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
          <linearGradient id="hearth-flame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-flame-hi)" />
            <stop offset="0.55" stopColor="var(--color-flame-mid)" />
            <stop offset="1" stopColor="var(--color-flame-lo)" />
          </linearGradient>
        </defs>
        {/* outer flame */}
        <path
          fill="url(#hearth-flame)"
          d="M12 2c.7 3.2-1.6 4.8-3 6.5C7.4 10.4 6 12.2 6 14.8 6 18.2 8.7 21 12 21s6-2.8 6-6.2c0-2.1-1-3.7-2.2-5.2-.6 2-1.9 2.6-2.6 2.2C14.3 11 15 8.6 12 2z"
        />
        {/* brighter inner ember */}
        <path
          fill="var(--color-flame-core)"
          opacity="0.9"
          d="M12.1 12.4c.45 1.2-.8 1.8-.8 3 0 1 .8 1.8 1.7 1.8s1.6-.85 1.35-1.9c-.2-.9-1.1-1.4-1.3-2.5-.3.8-.62.8-.92-.4z"
        />
      </svg>
    </span>
  );
}
