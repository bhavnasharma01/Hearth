/** Hearth flame mark + wordmark. The flame is always antique gold; the wordmark
 *  tone adapts to the surface ("light" on dark backgrounds, "dark" on parchment). */
export function Logo({
  tone = "dark",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <Flame className="h-6 w-6" />
      <span
        className={`font-display text-xl font-semibold tracking-tight ${
          tone === "light" ? "text-cream" : "text-forest-deep"
        }`}
      >
        Hearth
      </span>
    </span>
  );
}

export function Flame({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="url(#hearth-flame)"
    >
      <defs>
        <linearGradient id="hearth-flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dcc187" />
          <stop offset="1" stopColor="#c6a24a" />
        </linearGradient>
      </defs>
      <path d="M12 2c.7 3.2-1.6 4.8-3 6.5C7.4 10.4 6 12.2 6 14.8 6 18.2 8.7 21 12 21s6-2.8 6-6.2c0-2.1-1-3.7-2.2-5.2-.6 2-1.9 2.6-2.6 2.2C14.3 11 15 8.6 12 2z" />
    </svg>
  );
}
