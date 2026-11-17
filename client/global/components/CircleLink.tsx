"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/global/lib/cn";
import RollText from "./RollText";
import ApartmentsPanel from "./ApartmentsPanel";

// Ring geometry (viewBox 208): circumference of r=103.5 is about 650.3; each arc is a short dash at rest and
// grows to half the ring on hover, so together the two arcs draw the circle closed.
const C = 650.31;
const REST = 27.12;

/**
 * Round call-to-action: a hairline ring with two short arcs that draw around to close the circle on hover,
 * and a rolling small-caps label. `glass` adds a frosted fill for use over photos. With `panel` it opens the
 * full-screen apartments panel instead of navigating.
 */
export default function CircleLink({
  href = "/rooms",
  children,
  className,
  glass = false,
  panel = false,
}: {
  href?: string;
  children: string;
  className?: string;
  glass?: boolean;
  panel?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const inner = (
    <>
      {glass && <span className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-[3px]" aria-hidden />}
      <svg viewBox="0 0 208 208" className="absolute inset-0 h-full w-full" aria-hidden>
        <circle cx="104" cy="104" r="103.5" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
        {[-150, 30].map((deg) => (
          <circle
            key={deg}
            className="circle-arc"
            cx="104"
            cy="104"
            r="103.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            transform={`rotate(${deg} 104 104)`}
            style={{ "--rest": `${REST} ${C}`, "--full": `${C / 2} ${C}` } as CSSProperties}
          />
        ))}
      </svg>
      <span className="caps relative max-w-[8.5rem] text-left leading-snug">
        <RollText>{children}</RollText>
      </span>
    </>
  );
  const cls = cn("roll-host circle-host relative grid h-44 w-44 shrink-0 place-items-center rounded-full sm:h-52 sm:w-52", className);

  if (panel) {
    return (
      <>
        <button type="button" onClick={() => setOpen(true)} className={cls} aria-haspopup="dialog">
          {inner}
        </button>
        {/* Portal: an animated (transformed) ancestor would otherwise trap the fixed panel inside it */}
        {open && createPortal(<ApartmentsPanel onClose={() => setOpen(false)} />, document.body)}
      </>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
