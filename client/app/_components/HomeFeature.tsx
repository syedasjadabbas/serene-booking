"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRoomTypesQuery } from "@/global/api/endpoints/roomsApi";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { money } from "@/global/lib/format";
import { cn } from "@/global/lib/cn";

// Full-bleed image band with a floating booking card and experience thumbnails (reference design's "acclaimed" section).
export default function HomeFeature() {
  const { data: p } = usePropertyQuery();
  const { data: types } = useRoomTypesQuery();
  const [active, setActive] = useState(0);
  const featured = types?.find((t) => t.slug === "terrace-apartment") ?? types?.[0];
  // High-resolution gallery photos only (the experience tiles are small and have titles printed on them).
  const shots = (p?.gallery ?? []).map((g) => ({ image: g.src, title: g.alt })).filter((s) => !s.image.includes("render-"));
  const ordered = [...shots.filter((s) => s.image.includes("infinity-pool")), ...shots.filter((s) => !s.image.includes("infinity-pool"))];
  const bg = ordered[active]?.image ?? "/images/gallery/infinity-pool.png";

  return (
    <section className="panel relative isolate mt-6 sm:mt-8">
      <Image key={bg} src={bg} alt={ordered[active]?.title ?? "Resort experience"} fill sizes="100vw" className="-z-10 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/50 to-ink/20" />
      <div className="container-page grid min-h-[560px] gap-10 py-14 lg:grid-cols-[1fr_340px] lg:items-center">
        <div className="text-white">
          <h2 className="max-w-lg text-3xl font-bold leading-tight text-white sm:text-4xl">Pakistan&apos;s First Winter Resort, Open All Year</h2>
          <p className="mt-3 max-w-md text-sm text-white/80">
            Heated infinity pool, sauna and massage, rooftop dining, zipline, mini golf and stargazing, all a short walk from your apartment.
          </p>
          <div className="mt-10 flex flex-wrap gap-2.5">
            {ordered.map((s, i) => (
              <button
                key={s.image}
                onClick={() => setActive(i)}
                className={cn("relative h-14 w-14 overflow-hidden rounded-full border-2 transition sm:h-16 sm:w-16", i === active ? "scale-110 border-lime" : "border-white/60 opacity-80 hover:opacity-100")}
                aria-label={`Show ${s.title}`}
                aria-pressed={i === active}
              >
                <Image src={s.image} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {featured && (
          <div className="rounded-3xl bg-white p-3 shadow-pop">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
              <Image src={featured.images[0]} alt={featured.name} fill sizes="340px" className="object-cover" />
            </div>
            <div className="px-2 pb-2 pt-4">
              <p className="font-bold text-ink">{featured.name} – Nathia Gali</p>
              <p className="mt-0.5 text-sm text-zinc-500">{featured.tagline}</p>
              <p className="mt-3 text-xl font-bold text-ink">
                {money(featured.baseRate)}
                <span className="text-sm font-medium text-zinc-500">/night</span>
              </p>
              <Link href={`/rooms/${featured.slug}`} className="btn-primary mt-4 w-full">Book Now</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
