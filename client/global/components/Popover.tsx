"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/global/lib/cn";

// Minimal accessible popover: closes on outside click and Escape.
export default function Popover({
  open,
  onClose,
  children,
  className,
  align = "left",
  side = "bottom",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  align?: "left" | "right";
  /** Open below (default) or above the trigger, e.g. for a search bar at the bottom of a full-screen hero. */
  side?: "bottom" | "top";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const parent = ref.current?.parentElement;
      if (parent && !parent.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      role="dialog"
      className={cn(
        "absolute z-50 border border-ink/10 bg-white p-4 text-ink shadow-pop",
        side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        align === "right" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
}
