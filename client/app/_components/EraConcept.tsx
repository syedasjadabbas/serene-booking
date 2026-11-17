"use client";

import Image from "next/image";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import CircleLink from "@/global/components/CircleLink";
import { Parallax, Reveal, RevealWords } from "@/global/components/motion";
import { asset } from "@/global/lib/asset";

// The concept: one giant statement in capitals that rises in word by word, a drifting cut-out photo,
// and the round "view available apartments" button.
export default function EraConcept() {
  const { data: p } = usePropertyQuery();
  const count = p?.stats.apartments ?? 130;

  return (
    <section className="relative overflow-hidden bg-bone py-28 sm:py-40">
      <Parallax speed={0.12} className="pointer-events-none absolute -left-10 top-0 hidden w-[22vw] max-w-[320px] lg:block">
        <Reveal from="clip" className="relative aspect-[3/4] overflow-hidden">
          <Image src={asset("/images/interiors/sunrise-balcony.jpg")} alt="" fill sizes="22vw" className="object-cover" />
        </Reveal>
      </Parallax>

      <div className="container-page relative text-center">
        <Reveal>
          <p className="caps">The concept</p>
        </Reveal>
        <h2 className="mx-auto mt-8 max-w-6xl text-[2.5rem] leading-[0.95] sm:text-7xl lg:text-[6.2rem]">
          <RevealWords text={`Serene Heights is a resort of ${count} fully furnished hotel apartments, designed around calm, comfort and mountain air`} />
        </h2>
        <div className="mt-16 flex flex-col items-center justify-center gap-10 sm:flex-row sm:gap-20">
          <Reveal delay={150}>
            <CircleLink href="/rooms">View available apartments</CircleLink>
          </Reveal>
          <Reveal delay={250} className="max-w-xs text-left">
            <p className="text-[15px] leading-relaxed text-ink/75">
              One-bedroom apartments with their own balcony or terrace, a fitted kitchenette and heated floors, serviced daily by the hotel team.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
