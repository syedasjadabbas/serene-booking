"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bath, BedDouble, Building2, Maximize2, Trees, Users } from "lucide-react";
import type { RoomType } from "@/global/api/types";
import { money } from "@/global/lib/format";
import { cn } from "@/global/lib/cn";

/** True only on devices with a real hover pointer (mouse/trackpad). Phones never load the hover photo. */
function useCanHover() {
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(mq.matches);
    const on = () => setCanHover(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return canHover;
}

// Apartment-type card: photo on top (second photo fades in on hover), clean details panel below.
export default function RoomTypeCard({ type, href, wide = false }: { type: RoomType; href: string; wide?: boolean }) {
  const canHover = useCanHover();
  const hoverImage = canHover ? type.images.find((src, i) => i > 0 && !src.includes("floor-plans")) : undefined;
  const size = type.maxAreaSqft ? (type.minAreaSqft === type.maxAreaSqft ? `${type.maxAreaSqft}` : `${type.minAreaSqft}–${type.maxAreaSqft}`) : null;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-card transition duration-500 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-pop"
    >
      {/* Photo */}
      <div className={cn("relative overflow-hidden bg-zinc-100", wide ? "h-60 sm:h-72" : "h-60")}>
        <Image src={type.images[0]} alt={type.name} fill sizes={wide ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"} className="object-cover transition duration-700 group-hover:scale-105" />
        {hoverImage && (
          <Image src={hoverImage} alt="" fill sizes={wide ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"} className="object-cover opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/40 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-sm">
            <Trees className="h-3 w-3 text-brand-600" /> {type.outdoorSpace}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-white">
            <Building2 className="h-3 w-3" /> {type.totalApartments} apartments
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-ink">{type.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{type.tagline}</p>

        <ul className="mb-5 mt-4 flex flex-wrap gap-1.5 text-xs font-medium text-zinc-700">
          <li className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1"><Users className="h-3.5 w-3.5 text-brand-600" />{type.maxOccupancy} guests</li>
          <li className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1"><BedDouble className="h-3.5 w-3.5 text-brand-600" />{type.bedrooms} bedroom</li>
          <li className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1"><Bath className="h-3.5 w-3.5 text-brand-600" />{type.bathrooms} bath</li>
          {size && <li className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1"><Maximize2 className="h-3.5 w-3.5 text-brand-600" />{size} ft²</li>}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-zinc-100 pt-4">
          <p className="leading-tight">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">From</span>
            <span className="text-xl font-extrabold text-ink">{money(type.baseRate)}</span>
            <span className="text-sm font-medium text-zinc-500"> /night</span>
          </p>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-lime text-ink transition duration-300 group-hover:rotate-45 group-hover:bg-ink group-hover:text-lime" aria-hidden>
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
