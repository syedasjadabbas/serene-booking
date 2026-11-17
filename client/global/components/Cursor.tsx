"use client";

import { useEffect, useRef } from "react";

/**
 * A soft bronze ring that trails the mouse. It swells over links and buttons, and over anything marked
 * `data-cursor="View"` (or any other word) it becomes a dark disc showing that word.
 * The normal pointer stays visible; touch screens and reduced-motion users never get the ring.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let tx = -100;
    let ty = -100;
    let x = tx;
    let y = ty;
    let raf = 0;
    let state = "";

    const setState = (next: string, label = "") => {
      if (next !== state) {
        state = next;
        el.dataset.state = next;
      }
      if (el.textContent !== label) el.textContent = label;
    };

    const tick = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.2 ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!state) {
        x = tx;
        y = ty;
      }
      const target = e.target as Element | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      if (labelled) setState("label", labelled.dataset.cursor ?? "");
      else if (target?.closest("a, button, [role='button'], label, select, summary")) setState("link");
      else setState("idle");
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => setState("hidden");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <div ref={ref} className="cursor-ring" aria-hidden />;
}
