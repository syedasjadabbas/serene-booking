"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRoomTypesQuery } from "@/global/api/endpoints/roomsApi";
import { Reveal } from "@/global/components/motion";
import { money } from "@/global/lib/format";
import { asset } from "@/global/lib/asset";
import { cn } from "@/global/lib/cn";

// Apartment types as a slider: the type name set huge across the section, a "1 — 5" control, the key
// figures in a ruled list and the photo cross-fading beside them.
export default function EraResidences() {
  const { data } = useRoomTypesQuery();
  const types = data ?? [];
  const [i, setI] = useState(0);
  const t = types[i];
  const go = (d: number) => types.length && setI((x) => (x + d + types.length) % types.length);

  if (!t) return <section className="min-h-[80vh] bg-sky" aria-busy />;

  const size = t.maxAreaSqft ? (t.minAreaSqft === t.maxAreaSqft ? `${t.maxAreaSqft}` : `${t.minAreaSqft} — ${t.maxAreaSqft}`) : null;
  const facts = [
    { k: "Bedrooms", v: String(t.bedrooms) },
    { k: "Sleeps", v: `Up to ${t.maxOccupancy}` },
    ...(size ? [{ k: "Area", v: `${size} ft²` }] : []),
    { k: "Outdoor", v: t.outdoorSpace },
    { k: "From", v: `${money(t.baseRate)} / night` },
  ];

  return (
    <section className="overflow-hidden bg-sky py-24 sm:py-32" aria-roledescription="carousel" aria-label="Apartment types">
      <div className="container-page">
        <Reveal className="flex items-center justify-between gap-6">
          <p className="caps">The apartments</p>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => go(-1)} className="tap grid h-9 w-9 place-items-center rounded-full border border-ink/25 transition hover:bg-ink hover:text-bone" aria-label="Previous apartment type">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="caps tabular-nums">{i + 1}</span>
            <span className="relative block h-px w-20 bg-ink/25 sm:w-32" aria-hidden>
              <span className="absolute inset-y-0 left-0 bg-ink transition-all duration-700" style={{ width: `${((i + 1) / types.length) * 100}%` }} />
            </span>
            <span className="caps tabular-nums">{types.length}</span>
            <button type="button" onClick={() => go(1)} className="tap grid h-9 w-9 place-items-center rounded-full border border-ink/25 transition hover:bg-ink hover:text-bone" aria-label="Next apartment type">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </Reveal>

        <h2 key={`title-${t.id}`} className="fade-up mt-10 text-[9.5vw] leading-[0.95] sm:text-[6.5vw] lg:text-[6rem]" aria-live="polite">
          {t.name}
        </h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-4">
            <dl className="divide-y divide-ink/20 border-y border-ink/20">
              {facts.map((f) => (
                <div key={f.k} className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="caps">{f.k}</dt>
                  <dd className="text-right font-display text-2xl leading-none">{f.v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-ink/75">{t.tagline}</p>
            <Link href={`/rooms/${t.slug}`} className="btn-primary mt-8">
              Select this apartment
            </Link>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <div className="relative aspect-[16/11] overflow-hidden bg-sky-dark">
              {types.map((x, k) => (
                <Image
                  key={x.id}
                  src={asset(x.images[0])}
                  alt={k === i ? x.name : ""}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className={cn("object-cover transition duration-[1100ms] ease-out", k === i ? "scale-100 opacity-100" : "scale-105 opacity-0")}
                />
              ))}
            </div>
            <p className="caps mt-4 text-right text-ink/60">{t.totalApartments} apartments of this type</p>
          </div>
        </div>
      </div>
    </section>
  );
}
