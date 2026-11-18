"use client";

import { useState } from "react";
import Image from "next/image";
import { Images } from "lucide-react";
import Lightbox, { type Photo } from "@/global/components/Lightbox";
import RollText from "@/global/components/RollText";
import { cn } from "@/global/lib/cn";
import { asset } from "@/global/lib/asset";

// Editorial photo grid: one large photo beside four smaller ones, the last showing "+N photos", with square
// edges and thin gutters. Any photo opens the lightbox.
export default function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const shown = photos.slice(0, 5);
  const extra = photos.length - shown.length;

  return (
    <>
      <div className="fade-up grid h-[280px] grid-cols-4 grid-rows-2 gap-2 sm:h-[460px] sm:gap-3 lg:h-[560px]" style={{ animationDelay: "400ms" }}>
        {shown.map((p, i) => (
          <button
            key={p.src}
            onClick={() => setIndex(i)}
            className={cn("group relative overflow-hidden bg-sky-light", i === 0 ? "col-span-4 row-span-2 sm:col-span-2" : "hidden sm:block")}
            aria-label={`Open photo ${i + 1}: ${p.alt}`}
          >
            <Image
              src={asset(p.src)}
              alt={p.alt}
              fill
              priority={i === 0}
              sizes={i === 0 ? "(min-width: 640px) 50vw, 100vw" : "25vw"}
              className={cn("object-cover transition duration-[1200ms] ease-out group-hover:scale-[1.05]", p.src.includes("floor-plans") && "bg-white object-contain")}
            />
            {i === shown.length - 1 && extra > 0 && (
              <span className="absolute inset-0 grid place-items-center bg-ink/55 font-display text-2xl uppercase text-bone transition duration-500 group-hover:bg-ink/65">+{extra} photos</span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={() => setIndex(0)} className="roll-host tap caps flex items-center gap-2 text-ink">
          <Images className="h-4 w-4" strokeWidth={1.5} /> <RollText>{`Show all ${photos.length} photos`}</RollText>
        </button>
      </div>
      <Lightbox photos={photos} index={index} onIndex={setIndex} onClose={() => setIndex(null)} />
    </>
  );
}
