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
import Lightbox from "@/global/components/Lightbox";
import { Reveal, Stagger, Tilt } from "@/global/components/motion";
import { cn } from "@/global/lib/cn";

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

// Bento layout: a few tiles span more cells for rhythm.
const BENTO = ["sm:col-span-2 sm:row-span-2", "", "", "sm:col-span-2", "", "", "sm:row-span-2", "", "sm:col-span-2", "", "", ""];

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
        title={"50+ World-Class\nResort Facilities"}
        subtitle="Everything for a winter escape or a summer retreat, without leaving the resort."
        crumbs={[{ label: "Amenities" }]}
      >
        <div className="flex flex-wrap gap-2">
          {["Glass-roof pool", "Rooftop dining", "Ski slope", "Spa & sauna", "24/7 concierge"].map((t) => (
            <span key={t} className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur">{t}</span>
          ))}
        </div>
      </PageHero>

      {/* Signature experiences — bento grid */}
      <section className="container-page py-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Signature experiences</p>
            <h2 className="section-title mt-2">Life at 7,906 ft</h2>
          </div>
          <button onClick={() => setLightbox({ set: "exp", i: 0 })} className="btn-secondary">
            <Maximize2 className="h-4 w-4" /> View all {expPhotos.length}
          </button>
        </Reveal>
        <Stagger className="mt-8 grid auto-rows-[200px] grid-cols-1 gap-4 sm:grid-flow-row-dense sm:grid-cols-4" step={60} itemClassName={(i) => cn("h-full", BENTO[i])}>
          {p.experiences.map((e, i) => (
            <Tilt key={e.image} className="h-full" max={5}>
              <button onClick={() => setLightbox({ set: "exp", i })} className="zoom-img group relative block h-full w-full overflow-hidden rounded-3xl text-left" aria-label={`Open ${e.title}`}>
                <Image src={e.image} alt={e.title} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <span className="absolute bottom-0 left-0 flex w-full items-end justify-between gap-2 p-4">
                  <span className="text-base font-bold text-white sm:text-lg">{e.title}</span>
                  <span className="grid h-8 w-8 shrink-0 translate-y-2 place-items-center rounded-full bg-lime text-ink opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </span>
              </button>
            </Tilt>
          ))}
        </Stagger>
      </section>

      {/* Facilities by group */}
      <section className="panel bg-mist">
        <div className="container-page py-20">
          <Reveal className="text-center">
            <h2 className="section-title">Everything on Site</h2>
            <p className="section-sub">From heated floors to a helping hand at 3 a.m.</p>
          </Reveal>
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" step={80} itemClassName="h-full">
            {groups.map((g) => (
              <Tilt key={g} className="h-full" max={5}>
                <div className="h-full rounded-3xl bg-white p-6 shadow-card">
                  <h3 className="text-lg font-bold">{g}</h3>
                  <p className="text-sm text-zinc-500">{GROUP_BLURB[g]}</p>
                  <ul className="mt-5 space-y-3">
                    {p.amenities.filter((a) => a.group === g).map((a) => {
                      const Icon = ICONS[a.key] ?? HeartPulse;
                      return (
                        <li key={a.key} className="flex gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime-soft text-ink"><Icon className="h-4 w-4" /></span>
                          <span>
                            <span className="block text-sm font-semibold text-ink">{a.name}</span>
                            {a.description && <span className="block text-xs text-zinc-500">{a.description}</span>}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Tilt>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Gallery strip */}
      <section className="py-20">
        <Reveal className="container-page flex items-end justify-between gap-4">
          <h2 className="section-title">Gallery</h2>
          <p className="hidden text-sm text-zinc-500 sm:block">Scroll sideways · tap to enlarge</p>
        </Reveal>
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:px-[max(1.5rem,calc((100vw-80rem)/2+2rem))]">
          {galPhotos.map((g, i) => (
            <button key={g.src} onClick={() => setLightbox({ set: "gal", i })} className="zoom-img relative h-[320px] w-[78vw] max-w-[520px] shrink-0 snap-start overflow-hidden rounded-3xl sm:h-[380px]">
              <Image src={g.src} alt={g.alt} fill sizes="520px" className="object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4 pt-12 text-left text-sm font-medium text-white">{g.alt}</span>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="panel mb-0 bg-lime">
        <Reveal from="zoom" className="container-page flex flex-col items-center gap-6 py-16 text-center">
          <h2 className="section-title max-w-2xl">All of this, a lift ride from your apartment</h2>
          <Link href="/rooms" className="btn-dark px-7 py-3">Check availability <ArrowRight className="h-4 w-4" /></Link>
        </Reveal>
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
