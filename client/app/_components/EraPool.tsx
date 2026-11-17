import Image from "next/image";
import CircleLink from "@/global/components/CircleLink";
import { Parallax, Reveal } from "@/global/components/motion";
import { asset } from "@/global/lib/asset";

// A full-bleed pause on the rooftop pool with the frosted-glass "View available apartments" circle in the
// middle; it opens the apartments panel.
export default function EraPool() {
  return (
    <section data-theme="dark" className="relative isolate grid min-h-[100svh] place-items-center overflow-hidden text-bone">
      <Parallax speed={-0.12} className="absolute inset-x-0 -top-[10%] -z-10 h-[120%]">
        <Image src={asset("/images/resort/glass-roof-pool.jpg")} alt="The heated infinity pool under its glass roof" fill sizes="100vw" className="object-cover" />
      </Parallax>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-ink/30" />
      <Reveal from="zoom">
        <CircleLink glass panel>
          View available apartments
        </CircleLink>
      </Reveal>
      <p className="caps absolute bottom-8 left-1/2 -translate-x-1/2 text-bone/80">Heated pool · open all year</p>
    </section>
  );
}
