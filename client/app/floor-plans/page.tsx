"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { useRoomTypesQuery } from "@/global/api/endpoints/roomsApi";
import { PageLoader } from "@/global/components/ui";
import PageHero from "@/global/components/PageHero";
import SectionHeading from "@/global/components/SectionHeading";
import Lightbox from "@/global/components/Lightbox";
import RollText from "@/global/components/RollText";
import { Reveal, Stagger } from "@/global/components/motion";
import { areaRange, money } from "@/global/lib/format";
import { cn } from "@/global/lib/cn";
import { asset } from "@/global/lib/asset";

const pad = (n: number) => String(n).padStart(2, "0");

export default function FloorPlansPage() {
  const { data: p, isLoading } = usePropertyQuery();
  const { data: types } = useRoomTypesQuery();
  const [active, setActive] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);

  // Deep links like /floor-plans#floor-6 (used on apartment pages) open that floor.
  useEffect(() => {
    const m = window.location.hash.match(/^#floor-(.+)$/);
    if (m) setActive(decodeURIComponent(m[1]));
  }, []);

  if (isLoading || !p) return <PageLoader />;
  const current = p.floors.find((f) => f.key === active) ?? p.floors.find((f) => f.key === "1") ?? p.floors[0];
  const idx = p.floors.indexOf(current);
  const plans = p.floors.map((f) => ({ src: f.plans[0], alt: `${f.label} floor plan` }));
  const minArea = Math.min(...(types ?? []).map((t) => t.minAreaSqft ?? Infinity));
  const maxArea = Math.max(...(types ?? []).map((t) => t.maxAreaSqft ?? 0));

  const heroFacts = [
    { k: "Apartments", v: String(p.stats.apartments) },
    { k: "Floor plans", v: String(p.floors.length) },
    ...(types?.length ? [{ k: "Sq ft", v: `${minArea}–${maxArea}` }] : []),
  ];

  return (
    <div>
      <PageHero
        image="/images/resort/tower-front.jpg"
        imageAlt="Front facade of Serene Heights"
        eyebrow="Floor plans"
        title={"Find Your\nApartment"}
        subtitle={`${p.stats.apartments} one-bedroom apartments across the G1 to 8th floors, each with a bedroom, sitting room with kitchenette, bathroom and a balcony or terrace.`}
        crumbs={[{ label: "Floor plans" }]}
      >
        <dl className="grid grid-cols-3 divide-x divide-bone/20 border-y border-bone/20">
          {heroFacts.map((f) => (
            <div key={f.k} className="px-3 py-3 first:pl-0">
              <dt className="caps text-bone/60">{f.k}</dt>
              <dd className="mt-1.5 font-display text-lg leading-none text-bone sm:text-xl">{f.v}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Sticky floor selector */}
      <div className="sticky top-[84px] z-30 border-b border-ink/15 bg-bone/95 backdrop-blur">
        <div className="container-page flex gap-6 overflow-x-auto sm:gap-8" role="tablist" aria-label="Floors">
          {p.floors.map((f) => {
            const on = current.key === f.key;
            return (
              <button
                key={f.key}
                id={`floor-${f.key}`}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(f.key)}
                className={cn(
                  "caps relative shrink-0 whitespace-nowrap py-5 transition-colors",
                  on ? "text-ink" : "text-ink/45 hover:text-ink",
                )}
              >
                {f.label}
                <span className={cn("absolute inset-x-0 bottom-0 h-px origin-left bg-ink transition-transform duration-500", on ? "scale-x-100" : "scale-x-0")} aria-hidden />
              </button>
            );
          })}
        </div>
      </div>

      <section className="bg-bone py-20 sm:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div key={`info-${current.key}`} className="fade-up lg:col-span-4">
            <p className="caps flex items-center gap-4 text-ink/60">
              Floor {pad(idx + 1)} / {pad(p.floors.length)}
              <span className="block h-px w-14 bg-ink/30" aria-hidden />
            </p>
            <h2 className="mt-6 text-[2.6rem] leading-[0.98] sm:text-6xl">{current.label}</h2>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-ink/75">{current.summary}</p>

            <ul className="mt-10 divide-y divide-ink/15 border-y border-ink/15 text-sm leading-relaxed text-ink/75">
              <li className="flex gap-4 py-4">
                <span className="h-3 w-3 shrink-0 translate-y-1 bg-[#f2c94c]" aria-hidden /> Yellow outlines mark each apartment, with its number in a yellow circle.
              </li>
              <li className="flex gap-4 py-4">
                <span className="h-3 w-3 shrink-0 translate-y-1 bg-ink" aria-hidden /> Apartment floors include a table of apartment numbers and areas in sq ft.
              </li>
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <button type="button" className="roll-host btn-secondary" onClick={() => setZoom(idx)}>
                <Maximize2 className="h-3.5 w-3.5" /> <RollText>Full screen</RollText>
              </button>
              <Link href="/rooms" className="roll-host btn-primary">
                <RollText>Check availability</RollText>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 border-t border-ink/15">
              <button
                type="button"
                className="group flex flex-col items-start gap-2 py-5 pr-4 text-left transition disabled:cursor-not-allowed disabled:opacity-35"
                disabled={idx === 0}
                onClick={() => setActive(p.floors[idx - 1].key)}
              >
                <span className="caps inline-flex items-center gap-2 text-ink/50">
                  <ArrowLeft className="h-3.5 w-3.5 transition group-enabled:group-hover:-translate-x-1" aria-hidden /> Previous
                </span>
                <span className="font-display text-lg uppercase leading-tight">{idx > 0 ? p.floors[idx - 1].label : "Previous"}</span>
              </button>
              <button
                type="button"
                className="group flex flex-col items-end gap-2 border-l border-ink/15 py-5 pl-4 text-right transition disabled:cursor-not-allowed disabled:opacity-35"
                disabled={idx === p.floors.length - 1}
                onClick={() => setActive(p.floors[idx + 1].key)}
              >
                <span className="caps inline-flex items-center gap-2 text-ink/50">
                  Next <ArrowRight className="h-3.5 w-3.5 transition group-enabled:group-hover:translate-x-1" aria-hidden />
                </span>
                <span className="font-display text-lg uppercase leading-tight">{idx < p.floors.length - 1 ? p.floors[idx + 1].label : "Next"}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-8">
            <Reveal from="clip">
              <button type="button" onClick={() => setZoom(idx)} className="group relative block w-full border border-ink/10 bg-white" aria-label={`Enlarge ${current.label} plan`}>
                <span key={current.key} className="fade-in relative block aspect-[3/2]">
                  <Image src={asset(current.plans[0])} alt={`${current.label} floor plan`} fill sizes="(min-width: 1024px) 62vw, 100vw" className="object-contain p-4 sm:p-6" />
                </span>
                <span className="caps absolute right-0 top-0 inline-flex items-center gap-2 bg-ink px-4 py-2.5 text-bone opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Maximize2 className="h-3.5 w-3.5" aria-hidden /> Click to zoom
                </span>
              </button>
            </Reveal>
            <p className="caps mt-4 flex justify-between gap-4 text-ink/55">
              <span>{current.label}</span>
              <span>Serene Heights</span>
            </p>
          </div>
        </div>
      </section>

      {/* Apartment types as a ruled schedule */}
      {types && (
        <section className="bg-sky py-24 sm:py-32">
          <div className="container-page">
            <SectionHeading
              label="Bookable layouts"
              title="Apartment Types"
              action={
                <Link href="/rooms" className="roll-host btn-secondary">
                  <RollText>Compare all</RollText> <ArrowRight className="h-4 w-4" />
                </Link>
              }
            >
              Every layout on these plans is one of five bookable types.
            </SectionHeading>

            <div className="mt-14 hidden grid-cols-12 gap-6 pb-4 text-ink/55 lg:grid" aria-hidden>
              <span className="caps col-span-1">No.</span>
              <span className="caps col-span-6">Type</span>
              <span className="caps col-span-2">Area</span>
              <span className="caps col-span-1">Apts</span>
              <span className="caps col-span-2 text-right">From</span>
            </div>
            <Stagger as="ul" itemAs="li" className="mt-10 border-t border-ink/25 lg:mt-0" step={70}>
              {types.map((t, i) => (
                <Link key={t.id} href={`/rooms/${t.slug}`} className="group grid grid-cols-[88px_1fr] items-center gap-x-5 gap-y-1 border-b border-ink/25 py-5 transition-colors hover:bg-sky-light/60 sm:grid-cols-[140px_1fr] lg:grid-cols-12 lg:gap-6">
                  <span className="caps hidden text-ink/50 lg:col-span-1 lg:block">{pad(i + 1)}</span>
                  <span className="zoom-img relative row-span-3 block aspect-[4/3] overflow-hidden bg-sky-dark lg:col-span-2 lg:row-span-1">
                    <Image src={asset(t.images[0])} alt={t.name} fill sizes="(min-width: 1024px) 14vw, 140px" className="object-cover" />
                  </span>
                  <span className="min-w-0 font-display text-lg uppercase leading-tight sm:text-2xl lg:col-span-4">{t.name}</span>
                  <span className="caps text-ink/70 lg:col-span-2">{areaRange(t.minAreaSqft, t.maxAreaSqft)}</span>
                  <span className="flex items-baseline justify-between gap-4 lg:contents">
                    <span className="caps text-ink/70 lg:col-span-1">{t.totalApartments} apts</span>
                    <span className="font-display text-lg leading-none lg:col-span-2 lg:text-right lg:text-xl">
                      {money(t.baseRate)}
                      <span className="caps ml-1 text-ink/55">/night</span>
                    </span>
                  </span>
                </Link>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <Lightbox photos={plans} index={zoom} onIndex={setZoom} onClose={() => setZoom(null)} />
    </div>
  );
}
