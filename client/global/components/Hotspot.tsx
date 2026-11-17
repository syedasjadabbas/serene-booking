"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/global/lib/cn";

/**
 * A point of interest on a photo: a soft pulsing dot that opens a small bone card (title in the display
 * serif, a line of text) on hover, focus or tap; the dot turns into a close button while it's open.
 * Position with `x`/`y` in % of the photo box; the card opens towards the side with more room.
 */
export default function Hotspot({ x, y, title, text }: { x: number; y: number; title: string; text: string }) {
  const [open, setOpen] = useState(false);
  const toLeft = x > 55;
  return (
    <div
      className={cn("pointer-events-auto absolute z-10 -translate-x-1/2 -translate-y-1/2", open && "z-20")}
      style={{ left: `${x}%`, top: `${y}%` }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-expanded={open}
        aria-label={open ? `Close: ${title}` : `About: ${title}`}
        className="relative grid h-11 w-11 place-items-center rounded-full"
      >
        <span className={cn("absolute inset-0 rounded-full border border-bone/80 transition duration-300", open ? "scale-90 bg-bone" : "hotspot-pulse")} />
        {open ? <X className="relative h-4 w-4 text-ink" /> : <span className="relative h-1.5 w-1.5 rounded-full bg-bone" />}
      </button>

      <div
        role="tooltip"
        className={cn(
          "hotspot-card pointer-events-none absolute top-1/2 w-[17rem] -translate-y-1/2 bg-bone p-6 text-left text-ink shadow-pop transition duration-500 sm:w-[19rem]",
          toLeft ? "right-[calc(100%+14px)] origin-right" : "left-[calc(100%+14px)] origin-left",
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        )}
      >
        <p className="font-display text-[1.9rem] uppercase leading-[0.95]">{title}</p>
        <p className="mt-10 text-sm leading-relaxed text-ink/80">{text}</p>
      </div>
    </div>
  );
}
