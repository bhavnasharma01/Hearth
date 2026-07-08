"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Horizontal-scroll wrapper that makes a rail *read* as swipeable: a soft edge
 * fade plus a round chevron button on whichever side has more content, hidden
 * once you reach that end. (July 6 call feedback: testers assumed the visible
 * categories were all there were.)
 *
 * Only the scroll affordance is client-side — the children are rendered on the
 * server and passed through, so URL-driven filtering stays server-rendered.
 */
export function ScrollRail({
  children,
  className = "",
  contentClassName = "",
}: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    update();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // Widths shift once the web fonts arrive; re-measure then.
    document.fonts?.ready.then(update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const nudge = (dir: 1 | -1) => {
    scroller.current?.scrollBy({
      left: dir * scroller.current.clientWidth * 0.7,
      behavior: "smooth",
    });
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scroller}
        className={`overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${contentClassName}`}
      >
        {children}
      </div>

      {canLeft && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-parchment to-transparent"
          />
          <button
            type="button"
            aria-label="Scroll back"
            onClick={() => nudge(-1)}
            className="absolute left-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-card text-sm text-ink shadow-sm transition-colors hover:bg-sand"
          >
            ‹
          </button>
        </>
      )}
      {canRight && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-parchment to-transparent"
          />
          <button
            type="button"
            aria-label="Scroll for more"
            onClick={() => nudge(1)}
            className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-card text-sm text-ink shadow-sm transition-colors hover:bg-sand"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
