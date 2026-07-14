"use client";

import { useEffect, useState } from "react";

/**
 * A calm floating "back to top" button for long lists (the directory). Hidden
 * until the visitor has scrolled ~1.5 screens, then a small thumb-reachable
 * circle bottom-right. Chosen over a sticky search header, which would eat a
 * permanent slice of every phone screen (Build 94). Respects reduced motion.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 1.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        })
      }
      className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card/95 text-lg text-forest shadow-lg backdrop-blur transition-colors hover:bg-sand"
    >
      ↑
    </button>
  );
}
