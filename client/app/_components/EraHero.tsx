"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import SearchBar from "@/global/components/SearchBar";
import { Parallax, SplitLines } from "@/global/components/motion";
import { asset } from "@/global/lib/asset";
import { cn } from "@/global/lib/cn";
import type { Stay } from "@/global/api/types";
import { ARCH_RISE, HERO_H, INTRO_H, PHOTO_H, SCENE_H } from "./heroLayout";

// Each season: the photo, and the colour its sky fades to at the top edge (sampled from the image), so the
// painted sky above it blends in without a seam.
const SEASONS = {
  summer: { src: "/images/resort/hero-tower-mist.jpg", alt: "Serene Heights tower rising above green pines and mist in summer", position: "40% 0%", horizon: "#e9ecf3" },
  winter: { src: "/images/resort/aerial-snow-resort.jpg", alt: "Serene Heights and its slope above snow-covered pines in winter", position: "50% 0%", horizon: "#dbe2dd" },
} as const;
type Season = keyof typeof SEASONS;

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * The tall hero picture: a painted mountain sky (blue at the top, fading to the photo's own horizon colour)
 * with the photo feathered into it below, so it reads as one long image. Drawn at full scene height; callers
 * show a window of it (the first screen inside the pinned stage, the rest below it), which line up exactly.
 */
function Scene({ season, offset = "0px", priority = false }: { season: Season; offset?: string; priority?: boolean }) {
  return (
    <div className="absolute inset-x-0" style={{ top: `calc(-1 * ${offset})`, height: SCENE_H }}>
      {(Object.keys(SEASONS) as Season[]).map((key) => (
        <div
          key={key}
          className={cn("absolute inset-0 transition-opacity duration-[1400ms] ease-out", season === key ? "opacity-100" : "opacity-0")}
          style={{ background: `linear-gradient(to bottom, #2c4c66 0%, #5f86a2 22%, #a9c2d3 38%, ${SEASONS[key].horizon} 52%, ${SEASONS[key].horizon} 100%)` }}
          aria-hidden={season !== key}
        >
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: `calc(${PHOTO_H} + ${ARCH_RISE}svh)`,
              maskImage: "linear-gradient(to bottom, transparent 0%, #000 22%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 22%)",
            }}
          >
            <Image
              src={asset(SEASONS[key].src)}
              alt={priority ? SEASONS[key].alt : ""}
              fill
              priority={priority && key === "summer"}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: SEASONS[key].position }}
            />
          </div>
        </div>
      ))}
      {/* A light veil at the top keeps the name crisp */}
      <div className="absolute inset-x-0 top-0 h-[60svh] bg-gradient-to-b from-ink/25 to-transparent" />
    </div>
  );
}

// Full-screen opening: the name set huge in the condensed serif, an "in summer / in winter" switch that
// cross-fades the scene between seasons, and the booking search.
//
// Opening, as on the reference site: the page starts on a deep pine splash (a fine frame, a faint script,
// and an arch "window" onto the hero). Scrolling opens the arch until it fills the screen, while the first
// hero screen stays pinned underneath; then the page carries on. The picture is taller than the screen: a
// deep mountain sky behind the name first, then the tower comes up from below, and the sky arch rises over
// its lower part. The page wraps <EraHero> and <EraArch> in one container.
export default function EraHero({ initial }: { initial: Stay | null }) {
  const [season, setSeason] = useState<Season>("summer");
  const runwayRef = useRef<HTMLDivElement>(null);
  const holeRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Scroll-linked opening: 0 = splash, 1 = fully open. Eased in rAF; transforms and opacity only.
  useEffect(() => {
    const runway = runwayRef.current;
    if (!runway) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (overlayRef.current) overlayRef.current.style.display = "none";
      return;
    }
    let raf = 0;
    let current = -1;
    const apply = (p: number) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const hole = holeRef.current;
      if (hole) {
        // Scale the arch until its shoulders clear the screen corners.
        const w = hole.offsetWidth;
        const h = hole.offsetHeight;
        const need = Math.max(vw / w, (vh + w / 2) / h) * 1.15;
        const e = p * p * (3 - 2 * p); // smoothstep
        hole.style.transform = `translateX(-50%) scale(${(1 + (need - 1) * e).toFixed(4)})`;
      }
      if (decorRef.current) decorRef.current.style.opacity = (1 - clamp(p / 0.45)).toFixed(3);
      if (overlayRef.current) overlayRef.current.style.visibility = p >= 0.999 ? "hidden" : "visible";
      if (contentRef.current) {
        const o = clamp((p - 0.55) / 0.4);
        contentRef.current.style.opacity = o.toFixed(3);
        contentRef.current.style.transform = `translate3d(0, ${((1 - o) * 30).toFixed(1)}px, 0)`;
        contentRef.current.style.pointerEvents = o > 0.6 ? "auto" : "none";
      }
    };
    const target = () => clamp(window.scrollY / Math.max(1, runway.offsetHeight - window.innerHeight));
    const tick = () => {
      const t = target();
      current = current < 0 ? t : current + (t - current) * 0.12;
      if (Math.abs(t - current) < 0.0006) current = t;
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
    <>
      {/* Opening runway: the first hero screen stays pinned while the splash opens over it */}
      <div ref={runwayRef} className="intro-runway relative" style={{ height: `calc(${HERO_H} + ${INTRO_H})` }}>
        <div data-theme="dark" className="sticky top-0 overflow-hidden" style={{ height: HERO_H }}>
          <Scene season={season} priority />

          {/* Headline, season switch and search over the top of the photo */}
          <section ref={contentRef} className="intro-content relative flex h-full flex-col items-center px-4 pb-6 pt-[14vh] text-center text-bone sm:pb-8 sm:pt-[10vh]" style={{ opacity: 0 }}>
            <Parallax speed={0.25} className="relative">
              <h1 className="text-[23vw] leading-[0.8] text-bone sm:text-[13vw] lg:text-[11.5rem]">
                <SplitLines lines={["Serene", "Heights"]} baseDelay={150} />
              </h1>
            </Parallax>

            <div className="mt-[4vh] flex w-full max-w-6xl items-center justify-center gap-3 sm:grid sm:grid-cols-[1fr_auto_1fr]">
              <p className="hidden text-left font-display text-[2rem] uppercase leading-none sm:block">A home</p>
              <div role="radiogroup" aria-label="Season" className="flex items-center gap-2 sm:gap-3">
                {(Object.keys(SEASONS) as Season[]).map((key, i) => (
                  <span key={key} className="flex items-center gap-2 sm:gap-3">
                    {i === 1 && <span className="block h-px w-8 bg-bone/50 sm:w-16" aria-hidden />}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={season === key}
                      onClick={() => setSeason(key)}
                      className={cn("caps tap transition", season === key ? "text-bone" : "text-bone/45 hover:text-bone/80")}
                    >
                      In {key}
                    </button>
                  </span>
                ))}
              </div>
              <p className="hidden text-right font-display text-[2rem] uppercase leading-none sm:block">Above the clouds</p>
            </div>

            <div className="mt-auto w-full max-w-4xl text-left">
              <SearchBar variant="hero" submitLabel="Check availability" initial={initial} />
            </div>
          </section>

          {/* Splash: pine everywhere except an arch-shaped window, which grows as you scroll */}
          <div ref={overlayRef} className="intro-overlay pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div
              ref={holeRef}
              className="absolute bottom-0 left-1/2 h-[66svh] w-[min(34vw,560px)] min-w-[230px] origin-bottom rounded-t-[999px] will-change-transform"
              style={{ transform: "translateX(-50%)", boxShadow: "0 0 0 300vmax #0f241e" } as CSSProperties}
            />
            <div ref={decorRef} className="absolute inset-0">
              {/* Concentric outlines around the window */}
              {[28, 56].map((d) => (
                <span
                  key={d}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-[999px] border border-b-0 border-bone/10"
                  style={{ width: `calc(min(34vw, 560px) + ${d * 2}px)`, minWidth: `${230 + d * 2}px`, height: `calc(66svh + ${d}px)` }}
                />
              ))}
              {/* Fine frame with cut corners */}
              <svg className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] sm:inset-7 sm:h-[calc(100%-3.5rem)] sm:w-[calc(100%-3.5rem)]" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polygon points="2.5,0 97.5,0 100,4 100,96 97.5,100 2.5,100 0,96 0,4" fill="none" stroke="rgba(243,243,236,0.12)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              </svg>
              {/* Faint script across the background */}
              <p className="absolute inset-x-0 top-[12%] select-none text-center font-script text-[26vw] leading-none text-bone/[0.05] sm:text-[19vw]">Serene Heights</p>
              <p className="caps absolute inset-x-0 bottom-[70svh] text-center text-bone/70">Scroll to open</p>
            </div>
          </div>
        </div>
      </div>

      {/* The rest of the tall picture, continuing exactly below the pinned first screen */}
      <div data-theme="dark" className="relative overflow-hidden" style={{ height: `calc(${SCENE_H} - ${HERO_H})` }}>
        <Scene season={season} offset={HERO_H} />
      </div>
    </>
  );
}
