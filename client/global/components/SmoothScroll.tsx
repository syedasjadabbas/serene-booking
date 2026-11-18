"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Smooth, inertial wheel scrolling for the whole site (Lenis), so sections glide into each other instead of
 * jumping in wheel steps. Native scrolling stays in charge underneath (scroll position, sticky, anchors), so
 * every scroll-linked effect keeps working. Off for reduced motion; touch devices keep their native feel.
 * Full-screen overlays opt out of it with `data-lenis-prevent`.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, smoothWheel: true });
    window.__lenis = lenis;
    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  // New page: start at the top immediately (no glide from the previous page's position).
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
