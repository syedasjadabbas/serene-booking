"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useRoomTypesQuery } from "@/global/api/endpoints/roomsApi";
import { Alert } from "@/global/components/ui";
import { errorMessage } from "@/global/api/baseApi";
import { money } from "@/global/lib/format";
import { asset } from "@/global/lib/asset";
import { HorizontalScroll, Reveal, RevealWords, Tilt } from "@/global/components/motion";
import type { RoomType } from "@/global/api/types";

// Accommodation: on desktop the section pins and scrolling slides a row of arch-framed apartment cards
// sideways; on phones it is a swipeable row.
export default function HomeApartments() {
  const { data, isLoading, error } = useRoomTypesQuery();
  const types = data ?? [];

  return (
    <section className="bg-sand/60" aria-labelledby="apartments-title">
      <HorizontalScroll trackClassName="items-center gap-5 px-4 py-20 sm:gap-6 sm:px-6 lg:gap-10 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:py-0">
        {/* Intro */}
        <div className="w-[min(86vw,25rem)] shrink-0 snap-start pr-4 lg:pr-10">
          <Reveal>
            <p className="eyebrow">Accommodation</p>
          </Reveal>
          <h2 id="apartments-title" className="mt-5 text-[2.3rem] leading-[1.08] sm:text-5xl lg:text-6xl">
            <RevealWords text="Where Comfort Meets the Mountains" />
          </h2>
          <Reveal delay={200}>
            <p className="mt-6 max-w-sm text-[15px] font-light leading-relaxed">
              Fully furnished one-bedroom apartments, each with its own balcony or terrace. Choose the view and the space that suit your stay.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link href="/rooms" className="btn-primary">
                View all apartments
              </Link>
              <span className="hidden text-[11px] uppercase tracking-[0.3em] text-zinc-500 lg:inline-flex lg:items-center lg:gap-2">
                Scroll <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Reveal>
          {error && <Alert tone="error" className="mt-6">{errorMessage(error)}</Alert>}
        </div>

        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="arch h-[min(62vh,30rem)] w-[min(78vw,21rem)] shrink-0 animate-pulse bg-white/70" />
          ))}

        {types.map((t, i) => (
          <ArchCard key={t.id} type={t} index={i} />
        ))}

        {/* Closing card */}
        {types.length > 0 && (
          <Link
            href="/floor-plans"
            className="group flex h-[min(62vh,30rem)] w-[min(78vw,19rem)] shrink-0 snap-start flex-col items-center justify-center rounded-t-[999px] rounded-b-[6px] border border-gold/40 p-8 text-center transition hover:bg-white/60"
          >
            <span className="eyebrow">Floor plans</span>
            <span className="mt-4 font-display text-3xl leading-tight text-ink">Find your floor and view</span>
            <span className="mt-6 grid h-12 w-12 place-items-center rounded-full border border-gold text-gold transition group-hover:bg-gold group-hover:text-white">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </Link>
        )}
      </HorizontalScroll>
    </section>
  );
}

function ArchCard({ type, index }: { type: RoomType; index: number }) {
  const size = type.maxAreaSqft ? (type.minAreaSqft === type.maxAreaSqft ? `${type.maxAreaSqft}` : `${type.minAreaSqft}–${type.maxAreaSqft}`) : null;
  return (
    <div className="w-[min(78vw,21rem)] shrink-0 snap-start">
      <Tilt max={6} glare={false}>
        <Link href={`/rooms/${type.slug}`} className="group block" data-cursor="View">
          <div className="arch relative h-[min(56vh,27rem)] bg-brand-100 shadow-pop">
            <Image
              src={asset(type.images[0])}
              alt={type.name}
              fill
              sizes="(min-width: 1024px) 22rem, 78vw"
              className="object-cover transition duration-[1400ms] ease-out group-hover:scale-[1.07]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
            <div className="absolute inset-x-6 bottom-6 text-center text-white">
              <p className="text-[10px] uppercase tracking-[0.35em] text-lime">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-[1.7rem] leading-tight text-white">{type.name}</h3>
              <p className="mt-2 text-xs font-light tracking-wide text-white/80">
                {type.maxOccupancy} guests{size ? ` · ${size} ft²` : ""} · {type.outdoorSpace}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between px-1">
            <p className="text-sm text-zinc-500">
              From <span className="font-display text-xl text-ink">{money(type.baseRate)}</span> / night
            </p>
            <span className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink transition group-hover:border-gold group-hover:bg-gold group-hover:text-white">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      </Tilt>
    </div>
  );
}
