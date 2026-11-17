import Image from "next/image";
import type { CSSProperties } from "react";
import { Parallax, Reveal, RevealWords, ScrollRise, ScrollScale } from "@/global/components/motion";
import { asset } from "@/global/lib/asset";
import { ARCH_RISE, ARCH_TOP } from "./heroLayout";

const mark = asset("/brand/mark-cream.png");
const markStyle = {
  maskImage: `url(${mark})`,
  WebkitMaskImage: `url(${mark})`,
  maskSize: "contain",
  WebkitMaskSize: "contain",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskPosition: "center",
} as CSSProperties;

const REASONS = [
  {
    label: "Real mountain air",
    title: "7,906 ft above the noise, two hours from Islamabad",
    text: "Set in the pine forests of the Galiyat beside PAF Airbase Nathia Gali, with cool summers, snowy winters and views across the hills from every balcony.",
    image: "/images/resort/aerial-snow-resort.jpg",
    alt: "The resort and its slope under snow, surrounded by pine forest",
  },
  {
    label: "Made for every season",
    title: "Pakistan's first winter resort, open all year",
    text: "A heated infinity pool under glass, sauna and massage, a snow slope, mini golf, archery and a rooftop restaurant, all a short walk from your door.",
    image: "/images/resort/glass-roof-pool.jpg",
    alt: "The heated infinity pool under a glass roof",
  },
  {
    label: "Fully managed living",
    title: "A furnished apartment, with a hotel behind it",
    text: "Daily housekeeping, a 24/7 front desk and concierge, room service and heated floors. Arrive, unpack and settle in.",
    image: "/images/interiors/living-room-wide.jpg",
    alt: "An apartment living room with sofa and dining area",
  },
];

// The pale-sky arch that rises over the hero (widening as it scrolls in) with a line of text running along
// its curve, followed by three numbered reasons to stay.
export default function EraArch() {
  return (
    <ScrollRise rise={ARCH_RISE} span={1.15} className="relative z-10 text-ink" innerClassName="relative">
    <section style={{ marginTop: ARCH_TOP }}>
      <ScrollScale from={0.6} className="pointer-events-none relative">
        <svg viewBox="0 0 1000 420" className="block h-auto w-full" aria-hidden>
          <path d="M0 420 A500 420 0 0 1 1000 420 Z" fill="#B5CEDB" />
          <path id="arch-text" d="M90 420 A410 340 0 0 1 910 420" fill="none" />
          <text className="fill-ink font-display uppercase" style={{ fontSize: "34px", letterSpacing: "0.04em" }}>
            <textPath href="#arch-text" startOffset="50%" textAnchor="middle">
              Three reasons to choose Serene Heights
            </textPath>
          </text>
        </svg>
      </ScrollScale>

      <div className="-mt-px bg-sky pb-24 sm:pb-36">
        <div className="container-page flex flex-col items-center text-center">
          <Reveal className="flex items-center gap-4 sm:gap-6">
            <span className="caps">Nathia Gali</span>
            <span aria-hidden className="block h-9 w-7 bg-ink" style={markStyle} />
            <span className="caps">The Galiyat</span>
          </Reveal>
          <span className="rule-v mt-6" aria-hidden />
          <p className="caps mt-6 max-w-[16rem] leading-relaxed">A mountain home — to return to, season after season</p>
        </div>

        <ol className="container-page mt-24 space-y-28 sm:mt-32 sm:space-y-40">
          {REASONS.map((r, i) => (
            <li key={r.label} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
              <div className={i % 2 ? "lg:order-2 lg:col-span-6 lg:col-start-7" : "lg:col-span-6"}>
                <Parallax speed={0.05}>
                  <Reveal from="clip" className="relative aspect-[4/3.2] overflow-hidden bg-sky-dark">
                    <Image src={asset(r.image)} alt={r.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
                  </Reveal>
                </Parallax>
              </div>
              <div className={i % 2 ? "lg:order-1 lg:col-span-5" : "lg:col-span-5 lg:col-start-8"}>
                <Reveal className="flex items-center gap-4">
                  <span className="font-display text-5xl leading-none">{i + 1}</span>
                  <span className="block h-px w-14 bg-ink/40" aria-hidden />
                  <span className="caps">{r.label}</span>
                </Reveal>
                <h2 className="mt-8 text-[2.4rem] sm:text-6xl">
                  <RevealWords text={r.title} />
                </h2>
                <Reveal delay={150}>
                  <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink/75">{r.text}</p>
                </Reveal>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
    </ScrollRise>
  );
}
