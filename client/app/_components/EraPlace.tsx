"use client";

import Image from "next/image";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { Parallax, Reveal, SplitLines } from "@/global/components/motion";
import { asset } from "@/global/lib/asset";

// The place: a full-bleed landscape that drifts behind the name of the location, with drive times
// in small capitals along the bottom.
export default function EraPlace() {
  const { data: p } = usePropertyQuery();
  const distances = (p?.distances ?? []).slice(0, 4);

  return (
    <section data-theme="dark" className="relative isolate flex min-h-[110svh] flex-col overflow-hidden text-bone">
      <Parallax speed={-0.15} className="absolute inset-x-0 -top-[10%] -z-10 h-[120%]">
        <Image src={asset("/images/resort/tower-sunset-forest.jpg")} alt="Serene Heights above a snowy pine forest at dusk" fill sizes="100vw" className="object-cover" />
      </Parallax>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/50 via-ink/10 to-ink/70" />

      <div className="container-page flex flex-1 flex-col items-center justify-center py-32 text-center">
        <Reveal>
          <p className="caps">The location</p>
        </Reveal>
        <h2 className="mt-6 text-[17vw] leading-[0.82] text-bone sm:text-[10vw] lg:text-[9rem]">
          <SplitLines lines={["Nathia Gali,", "The Galiyat"]} />
        </h2>
        <Reveal delay={200}>
          <p className="mt-8 font-script text-5xl text-bone sm:text-6xl">Khyber Pakhtunkhwa</p>
        </Reveal>
      </div>

      {distances.length > 0 && (
        <div className="container-page grid grid-cols-2 gap-6 border-t border-bone/20 py-8 sm:grid-cols-4">
          {distances.map((d) => (
            <div key={d.place}>
              <p className="caps text-bone/65">{d.place}</p>
              <p className="mt-2 font-display text-2xl leading-none">{d.drive ?? d.distance}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
