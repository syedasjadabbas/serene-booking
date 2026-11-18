"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Baby, Bath, Briefcase, Building, Car, Coffee, Dumbbell, Flag, Flame, HeartPulse, Landmark, Maximize2, Mountain, PartyPopper,
  Presentation, ShieldCheck, Sparkles, Target, Telescope, Trees, Utensils, Waves, Wifi, Zap, type LucideIcon,
} from "lucide-react";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { PageLoader } from "@/global/components/ui";
import PageHero from "@/global/components/PageHero";
import SectionHeading from "@/global/components/SectionHeading";
import Lightbox from "@/global/components/Lightbox";
import RollText from "@/global/components/RollText";
import { Parallax, Reveal, RevealWords } from "@/global/components/motion";
import { cn } from "@/global/lib/cn";
import { asset } from "@/global/lib/asset";

const ICONS: Record<string, LucideIcon> = {
  pool: Waves, spa: Bath, gym: Dumbbell, restaurant: Utensils, roomService: Coffee, housekeeping: Sparkles, concierge: Building,
  business: Briefcase, conference: Presentation, banquet: PartyPopper, lawn: Trees, golf: Flag, zipline: Mountain, climbing: Mountain,
  archery: Target, shooting: Target, telescope: Telescope, sports: Baby, heating: Flame, power: Zap, parking: Car, security: ShieldCheck,
  mosque: Landmark, wifi: Wifi,
};

const GROUP_BLURB: Record<string, string> = {
  Wellness: "Unwind after a day in the pines.",
  Dining: "Meals with a view at 7,906 ft.",
  Services: "A full hotel team, around the clock.",
  Events: "Space for weddings, retreats and meetings.",
  Activities: "Something for every age, every season.",
  Comfort: "Warm, safe and powered all year.",
};

const HIGHLIGHTS = ["Glass-roof pool", "Rooftop dining", "Ski slope", "Spa & sauna", "24/7 concierge"];

// Editorial rhythm for the experiences on wide screens: a repeating set of four staggered frames on a
// 12-column grid (wide landscape, tall portrait pushed down, medium portrait, wide landscape pushed down).
const LAYOUT = [
  { cell: "lg:col-span-7", frame: "lg:aspect-[4/3]" },
  { cell: "lg:col-span-4 lg:col-start-9 lg:mt-28", frame: "lg:aspect-[3/4]" },
  { cell: "lg:col-span-5 lg:col-start-1", frame: "lg:aspect-[4/5]" },
  { cell: "lg:col-span-6 lg:col-start-7 lg:mt-40", frame: "lg:aspect-[16/11]" },
];

const pad = (n: number) => String(n).padStart(2, "0");

export default function AmenitiesPage() {
  const { data: p, isLoading } = usePropertyQuery();
  const [lightbox, setLightbox] = useState<{ set: "exp" | "gal"; i: number } | null>(null);
  if (isLoading || !p) return <PageLoader />;

  const groups = [...new Set(p.amenities.map((a) => a.group))];
  const expPhotos = p.experiences.map((e) => ({ src: e.image, alt: e.title }));
  const galPhotos = p.gallery;

  return (
    <div>
      <PageHero
        image="/images/resort/aerial-rooftop-pool.jpg"
        imageAlt="Aerial view with the glass-roof rooftop pool"
        eyebrow="Amenities"
        title={"50+ Resort\nFacilities"}
        subtitle="Everything for a winter escape or a summer retreat, without leaving the resort."
        crumbs={[{ label: "Amenities" }]}
      >
        <ul className="caps flex flex-wrap gap-x-4 gap-y-2 border-t border-bone/20 pt-4 text-bone/80">
          {HIGHLIGHTS.map((t, i) => (
            <li key={t} className="flex items-center gap-4">
              {i > 0 && <span className="h-1 w-1 rotate-45 bg-bone/50" aria-hidden />}
              {t}
            </li>
          ))}
        </ul>
      </PageHero>

      {/* Signature experiences: staggered editorial frames */}
      <section className="bg-bone py-24 sm:py-32">
        <div className="container-page">
          <SectionHeading
            label="Signature experiences"
            title="Life at 7,906 ft"
            action={
              <button type="button" onClick={() => setLightbox({ set: "exp", i: 0 })} className="roll-host btn-secondary">
                <Maximize2 className="h-3.5 w-3.5" /> <RollText>{`View all ${expPhotos.length}`}</RollText>
              </button>
            }
          />

          <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 lg:mt-24 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-24">
            {p.experiences.map((e, i) => {
              const l = LAYOUT[i % LAYOUT.length];
              return (
                <li key={e.image} className={cn("min-w-0", l.cell)}>
                  <button type="button" onClick={() => setLightbox({ set: "exp", i })} className="group block w-full text-left" aria-label={`Open ${e.title}`}>
                    <Reveal as="span" from="clip" className={cn("zoom-img relative block aspect-[4/5] overflow-hidden bg-sky-light", l.frame)}>
                      <Image src={asset(e.image)} alt={e.title} fill sizes="(min-width: 1024px) 50vw, 50vw" className="object-cover" />
                    </Reveal>
                    <span className="mt-4 flex items-baseline gap-3 border-t border-ink/15 pt-4 sm:gap-5">
                      <span className="caps text-ink/50">{pad(i + 1)}</span>
                      <span className="min-w-0 flex-1 font-display text-base uppercase leading-tight sm:text-2xl">{e.title}</span>
                      <ArrowRight className="hidden h-4 w-4 shrink-0 -translate-x-2 opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100 sm:block" aria-hidden />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Full-bleed pause */}
      <section data-theme="dark" className="relative isolate grid min-h-[70svh] place-items-center overflow-hidden text-bone">
        <Parallax speed={-0.12} className="absolute inset-x-0 -top-[10%] -z-10 h-[120%]">
          <Image src={asset("/images/resort/aerial-snow-resort.jpg")} alt="The resort and ski slope under snow" fill sizes="100vw" className="object-cover" />
        </Parallax>
        <div className="pointer-events-none absolute inset-0 -z-10 bg-ink/45" />
        <div className="container-page py-24 text-center">
          <Reveal>
            <p className="caps text-bone/80">Facilities</p>
          </Reveal>
          <h2 className="mx-auto mt-6 max-w-4xl text-[2.2rem] leading-[1.02] text-bone sm:text-6xl lg:text-[5rem]">
            <RevealWords text="Everything on Site" />
          </h2>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-bone/85">From heated floors to a helping hand at 3 a.m.</p>
          </Reveal>
        </div>
      </section>

      {/* Facilities by group: one ruled row per group */}
      <section className="bg-sky-light py-24 sm:py-32">
        <div className="container-page">
          <Reveal className="flex items-center gap-4">
            <span className="caps">Facilities by group</span>
            <span className="block h-px w-14 bg-ink/30" aria-hidden />
          </Reveal>

          <div className="mt-10 border-t border-ink/20">
            {groups.map((g, gi) => (
              <Reveal key={g} className="grid gap-8 border-b border-ink/20 py-10 sm:py-14 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-4">
                  <p className="caps text-ink/50">{pad(gi + 1)}</p>
                  <h3 className="mt-3 font-display text-3xl uppercase leading-none sm:text-4xl">{g}</h3>
                  {GROUP_BLURB[g] && <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink/70">{GROUP_BLURB[g]}</p>}
                </div>
                <ul className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
                  {p.amenities.filter((a) => a.group === g).map((a) => {
                    const Icon = ICONS[a.key] ?? HeartPulse;
                    return (
                      <li key={a.key} className="flex gap-4 border-t border-ink/10 py-4 first:border-t-0 sm:[&:nth-child(2)]:border-t-0">
                        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" strokeWidth={1.4} aria-hidden />
                        <span className="min-w-0">
                          <span className="caps block text-ink">{a.name}</span>
                          {a.description && <span className="mt-1.5 block text-sm leading-relaxed text-ink/65">{a.description}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery strip */}
      <section className="bg-bone py-24 sm:py-32">
        <div className="container-page">
          <SectionHeading label="In pictures" title="Gallery" action={<p className="caps hidden text-ink/50 sm:block">Scroll sideways · tap to enlarge</p>} />
        </div>
        <div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 sm:gap-8 sm:px-8 lg:px-[max(3.5rem,calc((100vw-90rem)/2+3.5rem))]">
          {galPhotos.map((g, i) => (
            <button
              key={g.src}
              type="button"
              onClick={() => setLightbox({ set: "gal", i })}
              className="group w-[78vw] max-w-[480px] shrink-0 snap-start text-left sm:w-[46vw] lg:w-[34vw]"
              aria-label={`Open ${g.alt}`}
            >
              <span className="zoom-img relative block aspect-[4/5] overflow-hidden bg-sky-light">
                <Image src={asset(g.src)} alt={g.alt} fill sizes="(min-width: 1024px) 34vw, 78vw" className="object-cover" />
              </span>
              <span className="mt-4 flex items-baseline gap-4 border-t border-ink/15 pt-3">
                <span className="caps text-ink/50">{pad(i + 1)}</span>
                <span className="text-sm leading-snug text-ink/75">{g.alt}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sky py-24 sm:py-32">
        <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Reveal>
              <p className="caps">Book your stay</p>
            </Reveal>
            <h2 className="mt-8 max-w-4xl text-[2rem] leading-[1.06] sm:text-5xl lg:text-[4rem]">
              <RevealWords text="All of this, a lift ride from your apartment" />
            </h2>
          </div>
          <Reveal delay={200} className="lg:col-span-4 lg:text-right">
            <Link href="/rooms" className="roll-host btn-primary">
              <RollText>Check availability</RollText> <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <Lightbox
        photos={lightbox?.set === "gal" ? galPhotos : expPhotos}
        index={lightbox?.i ?? null}
        onIndex={(i) => setLightbox((l) => (l ? { ...l, i } : l))}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
