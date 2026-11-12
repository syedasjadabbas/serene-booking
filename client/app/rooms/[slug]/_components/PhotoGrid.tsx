"use client";

import { useState } from "react";
import Image from "next/image";
import { Images } from "lucide-react";
import Lightbox, { type Photo } from "@/global/components/Lightbox";
import { cn } from "@/global/lib/cn";

import { asset } from "@/global/lib/asset";
// Booking.com-style grid: one large photo + four small, the last showing "+N photos". Any photo opens the lightbox.
export default function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const shown = photos.slice(0, 5);
  const extra = photos.length - shown.length;

  return (
    <>
      <div className="grid h-[260px] grid-cols-4 grid-rows-2 gap-2 sm:h-[420px]">
        {shown.map((p, i) => (
          <button
            key={p.src}
            onClick={() => setIndex(i)}
            className={cn("group relative overflow-hidden rounded-xl bg-zinc-100", i === 0 ? "col-span-4 row-span-2 sm:col-span-2" : "hidden sm:block")}
            aria-label={`Open photo ${i + 1}: ${p.alt}`}
          >
            <Image src={asset(p.src)} alt={p.alt} fill priority={i === 0} sizes={i === 0 ? "(min-width: 640px) 50vw, 100vw" : "25vw"} className={cn("object-cover transition duration-300 group-hover:scale-105", p.src.includes("floor-plans") && "bg-white object-contain")} />
            {i === shown.length - 1 && extra > 0 && (
              <span className="absolute inset-0 grid place-items-center bg-black/50 text-lg font-semibold text-white">+{extra} photos</span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-end">
        <button onClick={() => setIndex(0)} className="tap flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline">
          <Images className="h-4 w-4" /> Show all {photos.length} photos
        </button>
      </div>
      <Lightbox photos={photos} index={index} onIndex={setIndex} onClose={() => setIndex(null)} />
    </>
  );
}
