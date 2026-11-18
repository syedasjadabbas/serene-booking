"use client";

import Image from "next/image";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import CircleLink from "@/global/components/CircleLink";
import { Parallax, Reveal, RevealWords } from "@/global/components/motion";
import { asset } from "@/global/lib/asset";

// The concept: a portrait photo beside an editorial statement in sentence case (key words picked out in
// the accent colour) that rises in word by word, then a short note and the round "view available apartments" button.
export default function EraConcept() {
  const { data: p } = usePropertyQuery();
  const count = p?.stats.apartments ?? 130;

  return (
    <section className="relative overflow-hidden bg-bone py-28 sm:py-36">
      <div className="container-page grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Parallax speed={0.06}>
            <Reveal from="clip" className="relative mx-auto aspect-[3/4] max-w-[340px] overflow-hidden lg:mx-0">
              <Image src={asset("/images/interiors/sunrise-balcony.jpg")} alt="A guest opening the balcony doors to the morning sun" fill sizes="(min-width: 1024px) 26vw, 80vw" className="object-cover" />
            </Reveal>
          </Parallax>
          <p className="caps mt-4 text-center text-ink/50 lg:text-left">Morning light from the balcony</p>
        </div>

        <div className="lg:col-span-8">
          <Reveal className="flex items-center gap-4">
            <span className="caps">The concept</span>
            <span className="block h-px w-16 bg-ink/30" aria-hidden />
          </Reveal>
          <h2 className="mt-8 max-w-3xl text-[2.1rem] normal-case leading-[1.12] sm:text-5xl lg:text-[3.6rem]">
            <RevealWords text={`Serene Heights is a resort of ${count} fully furnished hotel apartments, designed around *calm,* *comfort* and *mountain* *air.*`} />
          </h2>
          <div className="mt-14 flex flex-col items-start gap-10 sm:flex-row sm:items-center sm:gap-14">
            <Reveal delay={150}>
              <CircleLink panel>View available apartments</CircleLink>
            </Reveal>
            <Reveal delay={250} className="max-w-sm">
              <p className="text-[15px] leading-relaxed text-ink/70">
                One-bedroom apartments with their own balcony or terrace, a fitted kitchenette and heated floors, serviced daily by the hotel team.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
