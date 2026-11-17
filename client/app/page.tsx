import Image from "next/image";
import SearchBar from "@/global/components/SearchBar";
import type { CSSProperties } from "react";
import { Star } from "lucide-react";
import { Parallax, PointerDepth, ScrollInset, SplitLines } from "@/global/components/motion";
import HomeWelcome from "./_components/HomeWelcome";
import HomeMarquee from "./_components/HomeMarquee";
import HomeApartments from "./_components/HomeApartments";
import HomeUnique from "./_components/HomeUnique";
import HomeFacilities from "./_components/HomeFacilities";
import HomeFeature from "./_components/HomeFeature";
import HomeReviews from "./_components/HomeReviews";
import HomeGallery from "./_components/HomeGallery";
import HomeLocation from "./_components/HomeLocation";

import { asset } from "@/global/lib/asset";
import { isPastStay, parseStay } from "@/global/lib/stay";
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  // Dates and guests can arrive in the URL (?checkIn&checkOut&adults…), e.g. from the Serene Heights Group
  // site's "Check availability" form; pre-fill the hero search with them. Past or invalid dates are ignored.
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(raw)) if (typeof v === "string") params.set(k, v);
  const parsed = parseStay(params);
  const initial = parsed && !isPastStay(parsed) ? parsed : null;

  return (
    <>
      {/* Hero: starts full-bleed, then insets into a framed card as you scroll (ScrollInset). The photo
          drifts with scroll and, on desktop, shifts against the mouse while the headline moves with it
          (PointerDepth), so the scene reads in layers. */}
      <ScrollInset>
        <PointerDepth className="h-full">
          <Parallax speed={-0.12} className="absolute inset-x-0 -top-[8%] -z-10 h-[116%]">
            <div className="depth absolute -inset-8" style={{ "--depth": "-16px" } as CSSProperties}>
              <div className="ken-burns relative h-full w-full">
                <Image src={asset("/images/resort/hero-tower-mist.jpg")} alt="Serene Heights tower rising above the pines and mist" fill priority sizes="100vw" className="object-cover object-[50%_35%]" />
              </div>
            </div>
          </Parallax>
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/35 to-ink/75" />
          {/* Fixed size (the frame is a clip mask, so nothing re-lays out while scrolling). */}
          <div className="flex h-full min-h-[640px] flex-col items-center justify-center px-4 pb-16 pt-32 text-center">
            <div className="depth" style={{ "--depth": "10px" } as CSSProperties}>
              <p className="fade-up flex items-center justify-center gap-1 text-lime" style={{ animationDelay: "100ms" }} aria-label="Luxury hotel apartments">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-3 w-3 fill-current" aria-hidden />
                ))}
              </p>
              <p className="fade-up mt-4 text-[11px] font-medium uppercase tracking-[0.4em] text-white/85" style={{ animationDelay: "180ms" }}>
                Serene Heights <span className="text-lime">·</span> Nathia Gali
              </p>
              <h1 className="mx-auto mt-6 max-w-5xl text-[2.25rem] leading-[1.05] text-white sm:text-7xl lg:text-[5.6rem]">
                <SplitLines lines={["Unwind in the Pines,", "Stay Above the Clouds"]} baseDelay={260} />
              </h1>
              <p className="fade-up mx-auto mt-6 max-w-xl text-[15px] font-light leading-relaxed text-white/85 sm:text-lg" style={{ animationDelay: "650ms" }}>
                Fully furnished hotel apartments at 7,906 ft, with a heated infinity pool and rooftop dining. Book in minutes, pay at the property.
              </p>
            </div>
            <div className="fade-up mt-10 w-full max-w-4xl text-left" style={{ animationDelay: "800ms" }}>
              <SearchBar variant="hero" submitLabel="Search" initial={initial} />
            </div>
          </div>
          {/* Corner details */}
          <div className="pointer-events-none absolute inset-x-0 bottom-6 hidden items-end justify-between px-10 text-white/70 lg:flex">
            <span className="fade-up flex items-center gap-3 text-[10px] uppercase tracking-[0.35em]" style={{ animationDelay: "1100ms" }}>
              <span className="scroll-cue relative block h-12 w-px overflow-hidden bg-white/25" aria-hidden />
              Scroll
            </span>
            <span className="fade-up text-right text-[10px] uppercase leading-relaxed tracking-[0.35em]" style={{ animationDelay: "1100ms" }}>
              7,906 ft above sea level
              <br />
              Galiyat, Pakistan
            </span>
          </div>
        </PointerDepth>
      </ScrollInset>

      <HomeWelcome />
      <HomeMarquee />
      <HomeApartments />
      <HomeUnique />
      <HomeFacilities />
      <HomeFeature />
      <HomeReviews />
      <HomeGallery />
      <HomeLocation />
    </>
  );
}
