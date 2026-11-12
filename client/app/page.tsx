import Image from "next/image";
import SearchBar from "@/global/components/SearchBar";
import { Parallax, ScrollInset, SplitLines } from "@/global/components/motion";
import HomeMarquee from "./_components/HomeMarquee";
import HomeApartments from "./_components/HomeApartments";
import HomeUnique from "./_components/HomeUnique";
import HomeFeature from "./_components/HomeFeature";
import HomeReviews from "./_components/HomeReviews";
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
      {/* Hero: starts full-bleed, then insets into a rounded white-framed card as you scroll (ScrollInset).
          Header floats inside it; photo zooms in and drifts on scroll. */}
      <ScrollInset>
        <Parallax speed={-0.12} className="absolute inset-x-0 -top-[8%] -z-10 h-[116%]">
          <div className="ken-burns relative h-full w-full">
            <Image src={asset("/images/resort/hero-tower-mist.jpg")} alt="Serene Heights tower rising above the pines and mist" fill priority sizes="100vw" className="object-cover object-[50%_35%]" />
          </div>
        </Parallax>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/65 via-ink/30 to-ink/60" />
        {/* Fixed size (the frame is a clip mask, so nothing re-lays out while scrolling). */}
        <div className="flex h-full min-h-[640px] flex-col items-center justify-center px-4 pb-14 pt-32 text-center">
          <p className="fade-up inline-flex items-center gap-2 rounded-full bg-white/20 py-1.5 pl-1.5 pr-4 text-xs font-medium text-white ring-1 ring-white/25" style={{ animationDelay: "150ms" }}>
            <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold text-ink">7,906 ft</span>
            Pakistan&apos;s first winter resort<span className="hidden sm:inline"> · Nathia Gali</span>
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.1] text-white sm:text-6xl">
            <SplitLines lines={["Unwind in the Pines,", "Stay Above the Clouds."]} baseDelay={250} />
          </h1>
          <p className="fade-up mt-4 max-w-xl text-sm text-white/85 sm:text-base" style={{ animationDelay: "650ms" }}>
            Fully furnished hotel apartments with a heated infinity pool and rooftop dining. Book in minutes, pay at the property.
          </p>
          <div className="fade-up mt-10 w-full max-w-4xl text-left" style={{ animationDelay: "800ms" }}>
            <SearchBar variant="hero" submitLabel="Search" initial={initial} />
          </div>
        </div>
      </ScrollInset>

      <HomeMarquee />
      <HomeApartments />
      <HomeUnique />
      <HomeFeature />
      <HomeReviews />
      <HomeLocation />
    </>
  );
}
