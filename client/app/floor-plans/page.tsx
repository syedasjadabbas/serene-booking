"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Layers, Maximize2, Ruler } from "lucide-react";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { useRoomTypesQuery } from "@/global/api/endpoints/roomsApi";
import { PageLoader } from "@/global/components/ui";
import PageHero from "@/global/components/PageHero";
import Lightbox from "@/global/components/Lightbox";
import { Reveal, Stagger, Tilt } from "@/global/components/motion";
import { areaRange, money } from "@/global/lib/format";
import { cn } from "@/global/lib/cn";

import { asset } from "@/global/lib/asset";
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
        <div className="flex flex-wrap gap-2">
          {[
            { Icon: Building2, text: `${p.stats.apartments} apartments` },
            { Icon: Layers, text: `${p.floors.length} floor plans` },
            ...(types?.length ? [{ Icon: Ruler, text: `${minArea}–${maxArea} sq ft` }] : []),
          ].map(({ Icon, text }) => (
            <span key={text} className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25">
              <Icon className="h-3.5 w-3.5" /> {text}
            </span>
          ))}
        </div>
      </PageHero>

      {/* Sticky floor selector */}
      <div className="sticky top-16 z-30 mt-6 border-y border-zinc-200 bg-white sm:bg-white/90 sm:backdrop-blur">
        <div className="container-page flex gap-2 overflow-x-auto py-3" role="tablist" aria-label="Floors">
          {p.floors.map((f) => (
            <button
              key={f.key}
              id={`floor-${f.key}`}
              role="tab"
              aria-selected={current.key === f.key}
              onClick={() => setActive(f.key)}
              className={cn("chip shrink-0", current.key === f.key && "chip-active")}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <section className="container-page grid gap-8 py-12 lg:grid-cols-[320px_1fr]">
        <Reveal from="left" key={`info-${current.key}`}>
          <p className="eyebrow">Floor {idx + 1} of {p.floors.length}</p>
          <h2 className="mt-2 text-3xl font-bold">{current.label}</h2>
          <p className="mt-3 text-zinc-600">{current.summary}</p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex gap-3 rounded-2xl bg-mist p-4"><span className="h-3 w-3 shrink-0 translate-y-1 rounded-sm bg-[#f2c94c]" /> Yellow outlines mark each apartment, with its number in a yellow circle.</li>
            <li className="flex gap-3 rounded-2xl bg-mist p-4"><span className="h-3 w-3 shrink-0 translate-y-1 rounded-sm bg-ink" /> Apartment floors include a table of apartment numbers and areas in sq ft.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => setZoom(idx)}>
              <Maximize2 className="h-4 w-4" /> Full screen
            </button>
            <Link href="/rooms" className="btn-primary">Check availability</Link>
          </div>
          <div className="mt-8 flex gap-2">
            <button className="btn-secondary px-4 py-2" disabled={idx === 0} onClick={() => setActive(p.floors[idx - 1].key)}>← {idx > 0 ? p.floors[idx - 1].label : "Previous"}</button>
            <button className="btn-secondary px-4 py-2" disabled={idx === p.floors.length - 1} onClick={() => setActive(p.floors[idx + 1].key)}>{idx < p.floors.length - 1 ? p.floors[idx + 1].label : "Next"} →</button>
          </div>
        </Reveal>

        <Tilt max={3} glare={false}>
          <button onClick={() => setZoom(idx)} className="group relative block w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-card" aria-label={`Enlarge ${current.label} plan`}>
            <div key={current.key} className="fade-in relative aspect-[3/2]">
              <Image src={asset(current.plans[0])} alt={`${current.label} floor plan`} fill sizes="(min-width: 1024px) 70vw, 100vw" className="object-contain p-4" />
            </div>
            <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
              <Maximize2 className="h-3.5 w-3.5" /> Click to zoom
            </span>
          </button>
        </Tilt>
      </section>

      {/* Apartment types */}
      {types && (
        <section className="panel bg-mist">
          <div className="container-page py-16">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="section-title">Apartment Types</h2>
                <p className="section-sub">Every layout on these plans is one of five bookable types.</p>
              </div>
              <Link href="/rooms" className="tap inline-flex items-center gap-1 text-sm font-semibold text-ink hover:underline">Compare all <ArrowRight className="h-4 w-4" /></Link>
            </Reveal>
            <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5" step={70} itemClassName="h-full">
              {types.map((t) => (
                <Tilt key={t.id} className="h-full" max={6}>
                  <Link href={`/rooms/${t.slug}`} className="zoom-img block h-full overflow-hidden rounded-3xl bg-white shadow-card">
                    <div className="relative aspect-[4/3]">
                      <Image src={asset(t.images[0])} alt={t.name} fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover" />
                    </div>
                    <div className="p-4">
                      <p className="font-bold leading-tight text-ink">{t.name}</p>
                      <p className="mt-1 text-xs text-zinc-500">{areaRange(t.minAreaSqft, t.maxAreaSqft)} · {t.totalApartments} apts</p>
                      <p className="mt-2 text-sm font-bold text-ink">{money(t.baseRate)}<span className="font-medium text-zinc-500">/night</span></p>
                    </div>
                  </Link>
                </Tilt>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <Lightbox photos={plans} index={zoom} onIndex={setZoom} onClose={() => setZoom(null)} />
    </div>
  );
}
