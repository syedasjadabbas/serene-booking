"use client";

import { Children, Fragment, useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/global/lib/cn";

// Lightweight motion primitives (no animation library). All respect prefers-reduced-motion:
// globals.css disables the transitions, and the JS effects below bail out.

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Safety net for reveals: IntersectionObserver can miss an element when the page jumps past it in one
// go (fast fling, End key, anchor link). One shared, rAF-throttled scroll check reveals anything whose
// top has reached the viewport — including elements already scrolled past — so content never stays hidden.
const pendingReveals = new Map<Element, () => void>();
let revealRaf = 0;
let revealTimer = 0;
function checkPendingReveals() {
  cancelAnimationFrame(revealRaf);
  clearTimeout(revealTimer);
  revealRaf = 0;
  revealTimer = 0;
  const limit = window.innerHeight * 0.92;
  for (const [el, reveal] of pendingReveals) {
    if (el.getBoundingClientRect().top < limit) {
      pendingReveals.delete(el);
      reveal();
    }
  }
  if (!pendingReveals.size) {
    window.removeEventListener("scroll", scheduleRevealCheck);
    window.removeEventListener("resize", scheduleRevealCheck);
  }
}
function scheduleRevealCheck() {
  if (revealRaf || revealTimer) return;
  revealRaf = requestAnimationFrame(checkPendingReveals);
  // Backup in case animation frames are throttled (background tab, low-power mode).
  revealTimer = window.setTimeout(checkPendingReveals, 150);
}
function watchReveal(el: Element, reveal: () => void) {
  if (!pendingReveals.size) {
    window.addEventListener("scroll", scheduleRevealCheck, { passive: true });
    window.addEventListener("resize", scheduleRevealCheck);
  }
  pendingReveals.set(el, reveal);
  scheduleRevealCheck();
  return () => {
    pendingReveals.delete(el);
  };
}

/** Calls back once when the element scrolls into view (or has already been scrolled past). */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      setInView(true);
      return;
    }
    return watchReveal(el, () => setInView(true));
  }, []);
  return { ref, inView };
}

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Delay in ms before the reveal starts. */
  delay?: number;
  /** up (default) | left | right | zoom | clip (curtain wipe for photos) | none (fade only) */
  from?: "up" | "left" | "right" | "zoom" | "clip" | "none";
  style?: CSSProperties;
  id?: string;
};

/** Fades + slides its content in when it first scrolls into view. */
export function Reveal({ children, as: Tag = "div", className, delay = 0, from = "up", style, id }: RevealProps) {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <Tag ref={ref} id={id} className={cn("reveal", `reveal-${from}`, inView && "reveal-in", className)} style={{ ...style, transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

/** Reveals each direct child in turn. Children receive a staggered delay via --i. */
export function Stagger({
  children,
  className,
  itemClassName,
  step = 90,
  as: Tag = "div",
  itemAs: Item = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Class for each item wrapper; a function gets the index (e.g. bento grid spans). */
  itemClassName?: string | ((i: number) => string);
  step?: number;
  as?: ElementType;
  /** Wrapper element per child: use "li" when `as` is "ul"/"ol". */
  itemAs?: ElementType;
}) {
  const { ref, inView } = useInView<HTMLElement>();
  return (
    <Tag ref={ref} className={cn("stagger", inView && "stagger-in", className)} style={{ "--stagger-step": `${step}ms` } as CSSProperties}>
      {Children.toArray(children).map((child, i) => (
        <Item key={i} className={cn("stagger-item", typeof itemClassName === "function" ? itemClassName(i) : itemClassName)} style={{ "--i": i } as CSSProperties}>
          {child}
        </Item>
      ))}
    </Tag>
  );
}

/** 3D tilt that follows the pointer, with a soft moving sheen. Purely decorative. */
export function Tilt({ children, className, max = 8, glare = true }: { children: ReactNode; className?: string; max?: number; glare?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef<number>(0);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch" || reducedMotion()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
      el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
      el.style.setProperty("--gx", `${px * 100}%`);
      el.style.setProperty("--gy", `${py * 100}%`);
      el.dataset.active = "true";
    });
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.dataset.active = "false";
  };

  return (
    <div className={cn("tilt-wrap", className)}>
      <div ref={ref} className="tilt h-full" onPointerMove={onMove} onPointerLeave={onLeave}>
        {children}
        {glare && <span aria-hidden className="tilt-glare" />}
      </div>
    </div>
  );
}

/** Moves its content vertically at a fraction of the scroll speed (positive = slower than page). */
export function Parallax({ children, className, speed = 0.15 }: { children: ReactNode; className?: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    // Skip on touch devices: per-frame scroll work there costs smoothness for a barely visible effect.
    if (!el || reducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    const update = () => {
      const r = el.parentElement?.getBoundingClientRect() ?? el.getBoundingClientRect();
      const offset = (r.top + r.height / 2 - window.innerHeight / 2) * -speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);
  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

/**
 * Pinned hero that starts full-bleed (no frame, square corners). While the user scrolls through the
 * first `distance` px the section stays pinned on screen and insets into a rounded, white-framed card;
 * it then holds for `hold` px before the page continues to the next section.
 *
 * How: the section is `position: sticky` inside a track that is `distance + hold` px taller than the
 * section, so the page doesn't move on while the effect plays. Progress drives the CSS var --inset
 * (0 → 1; geometry in `.scroll-inset`, globals.css). The track height is published as
 * --hero-pin-height so the floating site header can stay pinned with the hero.
 */
export function ScrollInset({ children, className, distance = 320, hold = 220 }: { children: ReactNode; className?: string; distance?: number; hold?: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLElement>(null);
  const [pin, setPin] = useState(true);

  useEffect(() => {
    const track = trackRef.current;
    const el = ref.current;
    if (!track || !el) return;
    const root = document.documentElement;

    // Reduced motion: no pinning, show the framed card straight away.
    if (reducedMotion()) {
      setPin(false);
      el.style.setProperty("--inset", "1");
      root.style.setProperty("--hero-inset", "1");
      return () => root.style.removeProperty("--hero-inset");
    }

    root.style.setProperty("--hero-shrink", `${distance}px`);
    const publishHeight = () => root.style.setProperty("--hero-pin-height", `${track.offsetHeight}px`);
    publishHeight();
    const ro = new ResizeObserver(publishHeight);
    ro.observe(track);

    const cleanupBase = () => {
      ro.disconnect();
      root.style.removeProperty("--hero-pin-height");
      root.style.removeProperty("--hero-shrink");
      root.style.removeProperty("--hero-inset");
    };

    // Modern browsers: the scroll-driven CSS animation in globals.css does everything off the main thread.
    if (typeof CSS !== "undefined" && CSS.supports("animation-timeline: scroll()")) return cleanupBase;

    // Fallback: glide --inset toward the scroll position (no layout reads/writes per frame, so no jank,
    // and wheel "ticks" become a smooth motion instead of steps).
    let raf = 0;
    let current = -1;
    const target = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / distance));
      return 1 - Math.pow(1 - p, 3); // ease-out
    };
    const tick = () => {
      const t = target();
      current = current < 0 ? t : current + (t - current) * 0.2;
      if (Math.abs(t - current) < 0.0015) current = t;
      const v = current.toFixed(4);
      el.style.setProperty("--inset", v);
      root.style.setProperty("--hero-inset", v);
      raf = current === t ? 0 : requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      cleanupBase();
    };
  }, [distance]);

  return (
    <div ref={trackRef} className="relative">
      <section ref={ref} className={cn("scroll-inset isolate overflow-hidden", pin ? "sticky top-0 h-[max(640px,100svh)]" : "relative", className)}>
        {children}
      </section>
      {/* Scroll runway: while it passes, the hero above stays pinned (shrink, then hold). */}
      {pin && <div aria-hidden style={{ height: distance + hold }} />}
    </div>
  );
}

/** Counts up to `to` when scrolled into view. */
export function CountUp({ to, duration = 1400, prefix = "", suffix = "", className }: { to: number; duration?: number; prefix?: string; suffix?: string; className?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reducedMotion()) {
      setValue(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString("en-PK")}
      {suffix}
    </span>
  );
}

/** Splits a heading into lines that rise into view one after another. */
export function SplitLines({ lines, className, lineClassName, baseDelay = 0 }: { lines: string[]; className?: string; lineClassName?: string; baseDelay?: number }) {
  return (
    <span className={className}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <span className={cn("line-rise block", lineClassName)} style={{ animationDelay: `${baseDelay + i * 140}ms` }}>
            {l}
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * Headline that rises in word by word (each word slides up out of a mask) when it scrolls into view.
 * Screen readers get the plain sentence.
 */
export function RevealWords({ text, className, delay = 0, as: Tag = "span" }: { text: string; className?: string; delay?: number; as?: ElementType }) {
  const { ref, inView } = useInView<HTMLElement>();
  const words = text.split(/\s+/);
  return (
    <Tag ref={ref} className={cn(inView && "words-in", className)} style={{ "--d": `${delay}ms` } as CSSProperties}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {/* The space goes between the masks: inside an inline-block a trailing space collapses away. */}
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="word-mask">
              <span className="word" style={{ "--w": i } as CSSProperties}>
                {w}
              </span>
            </span>
            {i < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

/**
 * Gives its children a sense of depth: as the mouse moves over the page, it eases --px/--py (-1…1)
 * on itself, and any descendant with class `depth` (and its own --depth distance) drifts by that much.
 * Layers with larger --depth move further, so they read as nearer. Mouse/trackpad only; off for reduced motion.
 */
export function PointerDepth({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.setProperty("--px", x.toFixed(4));
      el.style.setProperty("--py", y.toFixed(4));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Horizontal gallery that is driven by vertical scrolling on desktop: the section pins while the track
 * slides sideways, then the page carries on. On touch screens, narrow windows and with reduced motion it
 * is an ordinary swipeable row with snap points instead.
 */
export function HorizontalScroll({ children, className, trackClassName }: { children: ReactNode; className?: string; trackClassName?: string }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    const update = () => setPinned(mq.matches && !reducedMotion());
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const outer = outerRef.current;
    const track = trackRef.current;
    if (!pinned || !outer || !track) return;
    let travel = 0;
    let top = 0;
    let raf = 0;
    let current = -1;
    const measure = () => {
      travel = Math.max(0, track.scrollWidth - window.innerWidth);
      outer.style.height = `${window.innerHeight + travel}px`;
      top = outer.getBoundingClientRect().top + window.scrollY;
    };
    const tick = () => {
      const target = Math.min(travel, Math.max(0, window.scrollY - top));
      current = current < 0 ? target : current + (target - current) * 0.14;
      if (Math.abs(target - current) < 0.4) current = target;
      track.style.transform = `translate3d(${(-current).toFixed(1)}px, 0, 0)`;
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onResize = () => {
      measure();
      onScroll();
    };
    measure();
    tick();
    const ro = new ResizeObserver(onResize);
    ro.observe(track);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      outer.style.height = "";
      track.style.transform = "";
    };
  }, [pinned]);

  return (
    <div ref={outerRef} className={cn("relative", className)}>
      <div className={cn(pinned ? "sticky top-0 flex h-screen items-center overflow-hidden" : "overflow-x-auto overscroll-x-contain [scrollbar-width:none] snap-x snap-mandatory")}>
        <div ref={trackRef} className={cn("flex w-max will-change-transform", trackClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Slides its content sideways as the page scrolls past (for image rows that drift in opposite directions). */
export function ScrollDrift({ children, className, speed = 0.2 }: { children: ReactNode; className?: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      const offset = (r.top + r.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = `translate3d(${offset.toFixed(1)}px, 0, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);
  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}

/**
 * Scales its content from `from` to `to` as it scrolls up into view (e.g. the arch that rises over the
 * hero, widening as it comes). Transform only, rAF-throttled; static at `to` with reduced motion.
 */
export function ScrollScale({ children, className, from = 0.82, to = 1, origin = "50% 100%" }: { children: ReactNode; className?: string; from?: number; to?: number; origin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.85)));
      const eased = 1 - Math.pow(1 - p, 2);
      el.style.transform = `scale(${(from + (to - from) * eased).toFixed(4)})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [from, to]);
  return (
    <div ref={ref} className={cn("will-change-transform", className)} style={{ transformOrigin: origin }}>
      {children}
    </div>
  );
}

/**
 * Holds its content `rise` (in % of the screen height) lower than its place in the page and lets it glide
 * up into place as the visitor scrolls, eased and scroll-linked (scrolling back lowers it again).
 * Progress is measured on the untransformed outer box, so the motion never feeds back into itself.
 * `span` is how much scrolling (in screen heights) the rise takes. Static, in place, for reduced motion.
 */
export function ScrollRise({ children, className, innerClassName, rise = 35, span = 1.1 }: { children: ReactNode; className?: string; innerClassName?: string; rise?: number; span?: number }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    if (reducedMotion()) {
      inner.style.transform = "none";
      inner.style.setProperty("--rise", "1");
      return;
    }
    let raf = 0;
    let current = -1;
    const target = () => {
      const vh = window.innerHeight;
      const top = outer.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (vh - top) / (vh * span)));
      return p * p * (3 - 2 * p); // smoothstep: eases in and out
    };
    const tick = () => {
      const t = target();
      current = current < 0 ? t : current + (t - current) * 0.075;
      if (Math.abs(t - current) < 0.0005) current = t;
      inner.style.transform = `translate3d(0, ${(((1 - current) * rise * window.innerHeight) / 100).toFixed(2)}px, 0)`;
      // Children can follow the same eased progress (e.g. scale with it) via var(--rise): one value, in step.
      inner.style.setProperty("--rise", current.toFixed(4));
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
  }, [rise, span]);
  return (
    <div ref={outerRef} className={className}>
      <div ref={innerRef} className={cn("will-change-transform", innerClassName)} style={{ transform: `translate3d(0, ${rise}vh, 0)`, "--rise": 0 } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}
