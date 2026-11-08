"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Galería con scroll-snap: sabe qué imagen está a la vista (al deslizar con el dedo)
 * y permite saltar a una imagen desde las miniaturas.
 */
export function useProductGallery(count: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActive(Math.min(count - 1, Math.max(0, index)));
  }, [count]);

  const goTo = useCallback(
    (index: number) => {
      const target = Math.min(count - 1, Math.max(0, index));
      const track = trackRef.current;
      if (track) {
        const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        track.scrollTo?.({ left: target * track.clientWidth, behavior: reduce ? "auto" : "smooth" });
      }
      setActive(target);
    },
    [count],
  );

  return { trackRef, active, onScroll, goTo };
}
