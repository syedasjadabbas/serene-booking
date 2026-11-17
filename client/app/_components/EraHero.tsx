"use client";

import { useState } from "react";
import Image from "next/image";
import SearchBar from "@/global/components/SearchBar";
import { Parallax, SplitLines } from "@/global/components/motion";
import { asset } from "@/global/lib/asset";
import { cn } from "@/global/lib/cn";
import type { Stay } from "@/global/api/types";

const SEASONS = {
  summer: { src: "/images/resort/hero-tower-mist.jpg", alt: "Serene Heights tower rising above green pines and mist in summer", position: "50% 40%" },
  winter: { src: "/images/resort/tower-snow-night.jpg", alt: "Serene Heights tower above snow-covered pines in winter", position: "50% 45%" },
} as const;
type Season = keyof typeof SEASONS;

// Full-screen opening: the name set huge in the condensed serif with a script flourish, a
// "in summer / in winter" switch that cross-fades the photo between seasons, and the booking search.
export default function EraHero({ initial }: { initial: Stay | null }) {
  const [season, setSeason] = useState<Season>("summer");

  return (
    <section data-theme="dark" className="relative isolate h-[100svh] min-h-[680px] overflow-hidden bg-ink text-bone">
      <Parallax speed={-0.18} className="absolute inset-x-0 -top-[6%] -z-10 h-[112%]">
        {(Object.keys(SEASONS) as Season[]).map((key) => (
          <div key={key} className={cn("absolute inset-0 transition-opacity duration-[1400ms] ease-out", season === key ? "opacity-100" : "opacity-0")} aria-hidden={season !== key}>
            <div className="ken-burns relative h-full w-full">
              <Image
                src={asset(SEASONS[key].src)}
                alt={SEASONS[key].alt}
                fill
                priority={key === "summer"}
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: SEASONS[key].position }}
              />
            </div>
          </div>
        ))}
      </Parallax>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/55 via-ink/10 to-ink/60" />

      <div className="flex h-full flex-col items-center px-4 pb-6 pt-[14vh] text-center sm:pb-8 sm:pt-[10vh]">
        {/* Name */}
        <Parallax speed={0.25} className="relative">
          <h1 className="text-[23vw] leading-[0.8] text-bone sm:text-[13vw] lg:text-[11.5rem]">
            <SplitLines lines={["Serene", "Heights"]} baseDelay={150} />
          </h1>
          <p className="fade-up pointer-events-none absolute -bottom-[0.32em] right-[-4%] -rotate-[8deg] font-script text-[16vw] leading-none text-bone sm:text-[8.5vw] lg:text-[7.5rem]" style={{ animationDelay: "650ms" }} aria-hidden>
            Nathia Gali
          </p>
        </Parallax>

        {/* Phrase split around the season switch */}
        <div className="fade-up mt-[8vh] flex w-full max-w-6xl items-center justify-center gap-3 sm:grid sm:grid-cols-[1fr_auto_1fr]" style={{ animationDelay: "850ms" }}>
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

        {/* Booking */}
        <div className="fade-up mt-auto w-full max-w-4xl text-left" style={{ animationDelay: "1000ms" }}>
          <SearchBar variant="hero" submitLabel="Check availability" initial={initial} />
        </div>
      </div>
    </section>
  );
}
