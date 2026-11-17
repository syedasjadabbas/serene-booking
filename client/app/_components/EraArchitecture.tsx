import Image from "next/image";
import { Parallax, Reveal, RevealWords } from "@/global/components/motion";
import { asset } from "@/global/lib/asset";
import Hotspot from "@/global/components/Hotspot";

// Positions are % of the (parallax) photo box, placed on the tower in tower-front.jpg.
const SPOTS = [
  { x: 52, y: 16, title: "The rooftop crown", text: "A glass-walled restaurant and open terraces top the tower, with views across the Galiyat in every direction." },
  { x: 60, y: 34, title: "Arched windows", text: "Tall arches bring in the mountain light and frame the pines from inside every apartment." },
  { x: 40, y: 52, title: "A balcony for every home", text: "Each apartment opens onto its own balcony or terrace, made for morning tea above the clouds." },
];

// Architecture: a full-bleed photo of the tower with the statement over it, and hotspots that open small cards.
export default function EraArchitecture() {
  return (
    <section data-theme="dark" className="relative isolate flex min-h-[105svh] items-end overflow-hidden text-bone">
      <Parallax speed={-0.14} className="absolute inset-x-0 -top-[10%] -z-10 h-[120%]">
        <Image src={asset("/images/resort/tower-front.jpg")} alt="The front of the Serene Heights tower with its arched balconies" fill sizes="100vw" className="object-cover" />
      </Parallax>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/30 to-ink/20" />
      {/* Points of interest: a twin of the photo's parallax box, above the shading, so they stay on the tower */}
      <Parallax speed={-0.14} className="pointer-events-none absolute inset-x-0 -top-[10%] z-10 hidden h-[120%] sm:block">
        {SPOTS.map((s) => (
          <Hotspot key={s.title} {...s} />
        ))}
      </Parallax>
      <div className="container-page grid gap-8 pb-20 pt-40 lg:grid-cols-12">
        <Reveal className="lg:col-span-3">
          <p className="caps">The architecture</p>
        </Reveal>
        <h2 className="text-[2.3rem] leading-[0.95] text-bone sm:text-6xl lg:col-span-9 lg:text-[5.2rem]">
          <RevealWords text="Arched windows, warm stone and a balcony on every floor, rising above the pines" />
        </h2>
      </div>
    </section>
  );
}
