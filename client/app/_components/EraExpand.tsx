"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { asset } from "@/global/lib/asset";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Pinned "grow to full screen" moment inside the sky section, as on the reference site: a huge headline with
 * a small photo in the middle; scrolling opens the photo (a clip that widens from a small frame to the whole
 * screen) while it settles from a slight zoom, and the headline drifts up and fades. Its edges stay crisp. Eased in rAF; transforms, clip and opacity only.
 */
export default function EraExpand() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let current = -1;

    const apply = (p: number) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Small frame: about a quarter of the width (wider on phones), 2:1, centred a little below the middle.
      const w0 = Math.min(vw * (vw < 640 ? 0.62 : 0.27), 560);
      const h0 = w0 / 2;
      // Open over the first 72% of the runway, then rest at full screen before the page moves on.
      const q = clamp(p / 0.72);
      const e = q * q * (3 - 2 * q);
      const top = (vh * 0.56 - h0 / 2) * (1 - e);
      const bottom = (vh - (vh * 0.56 + h0 / 2)) * (1 - e);
      const side = ((vw - w0) / 2) * (1 - e);
      if (clipRef.current) clipRef.current.style.clipPath = `inset(${top.toFixed(1)}px ${side.toFixed(1)}px ${bottom.toFixed(1)}px ${side.toFixed(1)}px)`;
      if (imgRef.current) imgRef.current.style.transform = `scale(${(1.25 - 0.25 * e).toFixed(4)})`;
      if (titleRef.current) {
        titleRef.current.style.opacity = (1 - clamp(p / 0.4)).toFixed(3);
        titleRef.current.style.transform = `translate3d(0, ${(-60 * e).toFixed(1)}px, 0)`;
      }
      if (capRef.current) capRef.current.style.opacity = (1 - clamp(p / 0.3)).toFixed(3);
    };

    if (still) {
      apply(1);
      return;
    }
    const target = () => {
      const r = runway.getBoundingClientRect();
      return clamp(-r.top / Math.max(1, runway.offsetHeight - window.innerHeight));
    };
    const tick = () => {
      const t = target();
      current = current < 0 ? t : current + (t - current) * 0.18;
      if (Math.abs(t - current) < 0.0005) current = t;
      apply(current);
      raf = current === t ? 0 : requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={runwayRef} className="relative h-[260svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={titleRef} className="absolute inset-x-0 top-[11vh] z-10 px-4 text-center will-change-transform">
          <h2 className="text-[11vw] leading-[0.95] sm:text-[7.5vw] lg:text-[7rem]">Above the clouds</h2>
        </div>

        {/* The photo: clipped to a small frame that widens to the full screen */}
        <div ref={clipRef} className="absolute inset-0 will-change-[clip-path]" style={{ clipPath: "inset(40% 36% 30% 36%)" }}>
          <div ref={imgRef} className="absolute inset-0 will-change-transform" style={{ transform: "scale(1.25)" }}>
            <Image src={asset("/images/resort/tower-day.jpg")} alt="Serene Heights tower against a clear mountain sky" fill sizes="100vw" className="object-cover object-[50%_35%]" />
          </div>
        </div>

        <p ref={capRef} className="caps absolute inset-x-0 bottom-[12vh] text-center text-ink/70">
          7,906 ft · The Galiyat
        </p>
      </div>
    </div>
  );
}
