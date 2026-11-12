"use client";

import { Children, useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/global/lib/cn";

// Lightweight motion primitives (no animation library). All respect prefers-reduced-motion:
// globals.css disables the transitions, and the JS effects below bail out.

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Calls back once when the element scrolls into view. */
function useInView<T extends Element>(rootMargin = "0px 0px -10% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion() || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);
  return { ref, inView };
}

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Delay in ms before the reveal starts. */
  delay?: number;
  /** up (default) | left | right | zoom | none (fade only) */
  from?: "up" | "left" | "right" | "zoom" | "none";
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
    if (!el || reducedMotion()) return;
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
