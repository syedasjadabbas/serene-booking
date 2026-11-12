"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/global/lib/cn";

import { asset } from "@/global/lib/asset";
export type Photo = { src: string; alt: string };

// Full-screen photo viewer: arrow keys / buttons to navigate, Escape or backdrop to close, thumbnail strip.
export default function Lightbox({ photos, index, onIndex, onClose }: { photos: Photo[]; index: number | null; onIndex: (i: number) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;
  const go = useCallback((delta: number) => index !== null && onIndex((index + delta + photos.length) % photos.length), [index, onIndex, photos.length]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const photo = index !== null ? photos[index] : null;
  const isPlan = photo?.src.includes("floor-plans");

  return (
    <dialog ref={ref} onClose={onClose} aria-label="Photo gallery" className="m-0 h-full max-h-none w-full max-w-none bg-zinc-950 p-0 text-white backdrop:bg-black/90">
      {photo && (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3 text-sm">
            <span>{index! + 1} / {photos.length} · {photo.alt}</span>
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-white/10" aria-label="Close gallery">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="relative flex-1">
            <Image src={asset(photo.src)} alt={photo.alt} fill sizes="100vw" className={cn("object-contain", isPlan && "bg-white")} priority />
            <button onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 hover:bg-white/25" aria-label="Previous photo">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 hover:bg-white/25" aria-label="Next photo">
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto px-4 py-3">
            {photos.map((p, i) => (
              <button key={p.src} onClick={() => onIndex(i)} className={cn("relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2", i === index ? "border-white" : "border-transparent opacity-60 hover:opacity-100")} aria-label={`Show photo ${i + 1}`}>
                <Image src={asset(p.src)} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </dialog>
  );
}
