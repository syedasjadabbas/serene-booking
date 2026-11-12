"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { asset } from "@/global/lib/asset";

/**
 * Scroll-scrubbed flythrough of the resort (the 3D animation, cut into five chapters).
 *
 * Lives inside <ScrollInset runway=…>: the hero stays pinned while the visitor scrolls, and scroll
 * position drives the film. Frames are pre-extracted WebP stills (public/images/cinematic/{d,m}/NNN.webp:
 * a 1280px landscape set and a 540px portrait-cropped set for phones), drawn on a canvas with a crossfade
 * between neighbouring frames so the 4 fps source scrubs smoothly.
 *
 * Performance: only the poster frame loads with the page; the rest stream in afterwards in coarse-to-fine
 * order (every 8th frame, then 4th, 2nd, all), and the nearest loaded frame is shown meanwhile. Per scroll
 * frame there is no React render and no layout read: progress is eased in rAF and applied as canvas draws,
 * opacity and transforms. Data saver / 2G loads every 4th frame only; reduced motion shows the poster.
 */

const CHAPTERS = [
  { frames: 11, label: "Arrival", eyebrow: "7,906 ft · Nathia Gali", title: "Rise Above the Pines", text: "Two hours from Islamabad, in the forests of the Galiyat." },
  { frames: 19, label: "Rooftop", eyebrow: "Dining", title: "Dinner on the Rooftop Crown", text: "Breakfast, lunch and dinner with the hills all around, plus room service." },
  { frames: 18, label: "Winter", eyebrow: "Pakistan's first winter resort", title: "Snow Slope by the Tower", text: "Winter fun a few steps from your apartment, with the pines all around." },
  { frames: 23, label: "Play", eyebrow: "50+ facilities", title: "Something for Every Day", text: "18-hole mini golf, archery, zipline and more for the whole family." },
  { frames: 25, label: "Stay", eyebrow: "Hotel apartments", title: "Your Apartment Is Waiting", text: "Fully furnished, serviced daily. Book in minutes and pay at the property." },
] as const;

const N = CHAPTERS.length;
const STARTS = CHAPTERS.reduce<number[]>((acc, c, i) => [...acc, i ? acc[i - 1] + CHAPTERS[i - 1].frames : 0], []);
const TOTAL = STARTS[N - 1] + CHAPTERS[N - 1].frames;
/** The film finishes at this share of the pinned scroll; the rest holds the last frame and the final call to action. */
const FILM_END = 0.9;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const ramp = (v: number, from: number, to: number) => clamp((v - from) / (to - from));
const frameUrl = (set: "d" | "m", i: number) => asset(`/images/cinematic/${set}/${String(i).padStart(3, "0")}.webp`);

/** Film progress (0–1) → fractional frame position, giving each chapter an equal share of the scroll. */
function framePos(s: number) {
  const c = clamp(s) * N;
  const ci = Math.min(N - 1, Math.floor(c));
  return Math.min(TOTAL - 1, STARTS[ci] + (c - ci) * CHAPTERS[ci].frames);
}

/** Visibility of chapter k's caption at film progress s (fade in, hold, fade out). */
function captionOpacity(k: number, s: number) {
  const t = s * N - k;
  const enter = k === 0 ? ramp(t, 0.35, 0.55) : ramp(t, 0.08, 0.28);
  const exit = k === N - 1 ? 1 : 1 - ramp(t, 0.78, 0.96);
  return enter * exit;
}

/** Load order for the frames: coarse pass first so scrubbing works early, then fill in. */
function loadOrder(lite: boolean) {
  const order: number[] = [];
  const seen = new Set<number>();
  for (const stride of lite ? [8, 4] : [8, 4, 2, 1]) {
    for (let i = 0; i < TOTAL; i += stride) {
      if (seen.has(i)) continue;
      seen.add(i);
      order.push(i);
    }
  }
  if (!seen.has(TOTAL - 1)) order.push(TOTAL - 1);
  return order;
}

function show(el: HTMLElement | null, opacity: number, y = 0) {
  if (!el) return;
  el.style.opacity = opacity.toFixed(3);
  el.style.transform = y ? `translate3d(0, ${y.toFixed(1)}px, 0)` : "";
  el.style.visibility = opacity < 0.01 ? "hidden" : "visible";
}

/**
 * `intro` is the opening headline + search; it stays while the hero insets and holds, then lifts away.
 * `startAt` (px) is how far the visitor scrolls before the film starts: by default ScrollInset's
 * distance + hold (320 + 220), so the white-frame inset and its pause play out first, unchanged.
 */
export default function CinematicFilm({ intro, startAt = 540 }: { intro: ReactNode; startAt?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pillRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const section = root?.closest("section");
    const track = section?.parentElement;
    if (!root || !canvas || !section || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const set: "d" | "m" = window.innerWidth / window.innerHeight < 0.9 ? "m" : "d";
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const lite = !!conn?.saveData || /2g/.test(conn?.effectiveType ?? "");

    const frames: (HTMLImageElement | null)[] = new Array(TOTAL).fill(null);
    let cancelled = false;
    let raf = 0;
    let current = -1; // eased film progress
    let lastKey = "";
    let shown = false;
    let activeChapter = -1;

    // Geometry (read on resize only, never per frame).
    let trackTop = 0;
    let range = 1;
    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(section.clientWidth * dpr);
      canvas.height = Math.round(section.clientHeight * dpr);
      trackTop = track.getBoundingClientRect().top + window.scrollY;
      range = Math.max(1, track.offsetHeight - section.offsetHeight - startAt);
      lastKey = "";
    };

    const nearest = (i: number) => {
      if (frames[i]) return i;
      for (let d = 1; d < TOTAL; d++) {
        if (i - d >= 0 && frames[i - d]) return i - d;
        if (i + d < TOTAL && frames[i + d]) return i + d;
      }
      return -1;
    };

    const drawCover = (img: HTMLImageElement, alpha: number) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const draw = (pos: number) => {
      const i = Math.floor(pos);
      const f = pos - i;
      const a = nearest(i);
      if (a < 0) return;
      const next = a === i && f > 0.02 && i + 1 < TOTAL ? frames[i + 1] : null;
      const key = next ? `${a}:${f.toFixed(2)}` : `${a}`;
      if (key === lastKey) return;
      lastKey = key;
      drawCover(frames[a]!, 1);
      if (next) drawCover(next, f);
      if (!shown) {
        shown = true;
        canvas.style.opacity = "1";
      }
    };

    const apply = (s: number) => {
      draw(framePos(s));

      // Gentle push-in during the opening, on top of the frame inset from <ScrollInset>.
      if (mediaRef.current) mediaRef.current.style.transform = `scale(${(1 + 0.07 * (1 - ramp(s, 0, 0.2))).toFixed(4)})`;

      const introOpacity = 1 - ramp(s, 0.015, 0.075);
      show(introRef.current, introOpacity, -48 * (1 - introOpacity));
      show(hintRef.current, 1 - ramp(window.scrollY - trackTop, 0, 140));
      if (scrimRef.current) scrimRef.current.style.opacity = introOpacity.toFixed(3);

      let finale = 0;
      captionRefs.current.forEach((el, k) => {
        const o = captionOpacity(k, s);
        if (k === N - 1) finale = o;
        show(el, o, 28 * (1 - o));
      });

      // Floating "book" pill between the intro search and the final call to action.
      show(pillRef.current, Math.min(ramp(s, 0.06, 0.1), 1 - finale));
      show(railRef.current, Math.min(ramp(s, 0.06, 0.1), 1 - ramp(s, 0.96, 1)));
      if (barRef.current) barRef.current.style.transform = `scaleX(${clamp(s).toFixed(4)})`;

      const chapter = Math.min(N - 1, Math.floor(clamp(s) * N));
      if (chapter !== activeChapter && railRef.current) {
        activeChapter = chapter;
        railRef.current.querySelectorAll<HTMLElement>("[data-chapter]").forEach((el) => {
          el.dataset.active = String(Number(el.dataset.chapter) <= chapter);
        });
      }
    };

    const target = () => clamp((window.scrollY - trackTop - startAt) / range / FILM_END);
    const tick = () => {
      const t = target();
      current = current < 0 ? t : current + (t - current) * 0.16;
      if (Math.abs(t - current) < 0.0004) current = t;
      apply(current);
      raf = current === t ? 0 : requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onResize = () => {
      measure();
      kick();
    };

    // Stream the frames in, a few at a time.
    const order = loadOrder(lite);
    let nextIdx = 0;
    let inFlight = 0;
    const pump = () => {
      while (!cancelled && inFlight < 4 && nextIdx < order.length) {
        const i = order[nextIdx++];
        inFlight++;
        const img = new Image();
        img.decoding = "async";
        img.src = frameUrl(set, i);
        img
          .decode()
          .then(() => {
            if (cancelled) return;
            frames[i] = img;
            lastKey = "";
            kick();
          })
          .catch(() => {})
          .finally(() => {
            inFlight--;
            pump();
          });
      }
    };
    const startLoading = () => !cancelled && pump();
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    let loadTimer = 0;
    const begin = () => (idle ? idle(startLoading, { timeout: 1200 }) : (loadTimer = window.setTimeout(startLoading, 300)));
    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });

    measure();
    tick();
    const ro = new ResizeObserver(onResize);
    ro.observe(section);
    ro.observe(track);
    window.addEventListener("scroll", kick, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(loadTimer);
      ro.disconnect();
      window.removeEventListener("scroll", kick);
      window.removeEventListener("load", begin);
    };
  }, [startAt]);

  return (
    <div ref={rootRef} className="absolute inset-0 isolate">
      {/* Film */}
      <div ref={mediaRef} className="absolute inset-0 origin-center will-change-transform" style={{ transform: "scale(1.07)" }}>
        <picture>
          <source media="(max-aspect-ratio: 9/10)" srcSet={frameUrl("m", 0)} />
          {/* eslint-disable-next-line @next/next/no-img-element -- the poster must match the canvas frames pixel for pixel */}
          <img src={frameUrl("d", 0)} alt="Serene Heights tower rising above snowy pine forest" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        </picture>
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300" />
      </div>

      {/* Legibility: a darker wash behind the intro, then soft top/bottom gradients for the captions */}
      <div ref={scrimRef} className="absolute inset-0 bg-ink/40" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/55 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-ink/80 via-ink/35 to-transparent" />

      {/* Intro: headline + search (fades and lifts away as the film starts) */}
      <div ref={introRef} className="absolute inset-0 z-10 will-change-transform">
        {intro}
      </div>
      <div ref={hintRef} className="pointer-events-none absolute inset-x-0 bottom-5 z-10 hidden justify-center sm:flex" aria-hidden>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white/90 ring-1 ring-white/25 backdrop-blur-sm">
          Scroll to explore the resort <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
        </span>
      </div>

      {/* Chapter captions (all stacked; scroll sets which one shows) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 pb-24 sm:pb-28">
        <div className="container-page relative">
          {CHAPTERS.map((c, k) => (
            <div
              key={c.label}
              ref={(el) => {
                captionRefs.current[k] = el;
              }}
              className="invisible absolute bottom-0 left-4 right-4 max-w-2xl text-white opacity-0 will-change-transform sm:left-6 lg:left-8"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lime">
                <span className="text-white/60">0{k + 1}</span> <span className="mx-1.5 text-white/40">/</span> {c.eyebrow}
              </p>
              <h2 className="mt-3 text-4xl font-bold leading-[1.05] text-white sm:text-6xl">{c.title}</h2>
              <p className="mt-3 max-w-md text-sm text-white/80 sm:text-base">{c.text}</p>
              {k === N - 1 && (
                <div className="pointer-events-auto mt-7 flex flex-wrap gap-3">
                  <Link href="/rooms" className="btn-primary px-6">
                    Check availability <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/floor-plans" className="inline-flex items-center justify-center rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm transition hover:bg-white/25">
                    View floor plans
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chapter rail + progress, and a booking shortcut that's always one tap away */}
      <div className="absolute inset-x-0 bottom-0 z-10 pb-6 sm:pb-8">
        <div className="container-page flex items-end justify-between gap-4">
          <div ref={railRef} className="invisible w-full max-w-md opacity-0" aria-hidden>
            <div className="hidden justify-between text-[11px] font-semibold uppercase tracking-widest sm:flex">
              {CHAPTERS.map((c, k) => (
                <span key={c.label} data-chapter={k} className="text-white/45 transition-colors duration-500 data-[active=true]:text-white">
                  {c.label}
                </span>
              ))}
            </div>
            <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-white/20">
              <span ref={barRef} className="block h-full origin-left scale-x-0 rounded-full bg-lime" />
            </div>
          </div>
          <div ref={pillRef} className="invisible shrink-0 opacity-0">
            <Link href="/rooms" className="inline-flex items-center gap-2 rounded-full bg-white py-2 pl-4 pr-2 text-sm font-semibold text-ink shadow-pop transition hover:bg-mist">
              Book your stay
              <span className="grid h-8 w-8 place-items-center rounded-full bg-pine text-white">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
