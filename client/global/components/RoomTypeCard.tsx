"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bath, BedDouble, Building2, Maximize2, Trees, Users } from "lucide-react";
import type { RoomType } from "@/global/api/types";
import { money } from "@/global/lib/format";
import { cn } from "@/global/lib/cn";
import { asset } from "@/global/lib/asset";

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

// Apartment-type card: a tall photo carrying the name (second photo fades in on hover), a single
// line of specs, and a price row with one consistent "View" button.
export default function RoomTypeCard({ type, href, wide = false }: { type: RoomType; href: string; wide?: boolean }) {
  const canHover = useCanHover();
  const hoverImage = canHover ? type.images.find((src, i) => i > 0 && !src.includes("floor-plans")) : undefined;
  const size = type.maxAreaSqft ? (type.minAreaSqft === type.maxAreaSqft ? `${type.maxAreaSqft}` : `${type.minAreaSqft}–${type.maxAreaSqft}`) : null;
  const sizes = wide ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

  const specs = [
    { icon: Users, label: `${type.maxOccupancy} guests` },
    { icon: BedDouble, label: `${type.bedrooms} bedroom` },
    { icon: Bath, label: `${type.bathrooms} bath` },
    ...(size ? [{ icon: Maximize2, label: `${size} ft²` }] : []),
  ];

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-card ring-1 ring-ink/[0.06] transition duration-500 hover:-translate-y-1 hover:shadow-pop hover:ring-brand-300/60"
    >
      {/* Photo with the name on it */}
      <div className={cn("relative overflow-hidden bg-brand-100", wide ? "aspect-[16/10] sm:aspect-[16/8]" : "aspect-[4/3.4]")}>
        <Image
          src={asset(type.images[0])}
          alt={type.name}
          fill
          sizes={sizes}
          className="object-cover transition duration-[1200ms] ease-out group-hover:scale-[1.06]"
        />
        {hoverImage && (
          <Image
            src={asset(hoverImage)}
            alt=""
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition duration-[1200ms] ease-out group-hover:scale-[1.06] group-hover:opacity-100"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/25 to-brand-900/10" />

        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-900/55 px-3 py-1.5 text-[11px] font-semibold text-white ring-1 ring-white/15 backdrop-blur-md">
            <Trees className="h-3.5 w-3.5" /> {type.outdoorSpace}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-900/55 px-3 py-1.5 text-[11px] font-semibold text-white ring-1 ring-white/15 backdrop-blur-md">
            <Building2 className="h-3.5 w-3.5" /> {type.totalApartments} apartments
          </span>
        </div>

        <div className="absolute inset-x-5 bottom-5">
          <h3 className="text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">{type.name}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-white/80">{type.tagline}</p>
        </div>
      </div>

      {/* Specs + price */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-zinc-600">
          {specs.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-brand-500" />
              {label}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="leading-tight">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">From</span>
            <span className="text-2xl font-bold tracking-tight text-ink">{money(type.baseRate)}</span>
            <span className="text-sm font-medium text-zinc-500"> / night</span>
          </p>
          <span
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-pine pl-4 pr-3 text-sm font-semibold text-white transition duration-300 group-hover:bg-pine-hover"
            aria-hidden
          >
            View
            <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:rotate-45" />
          </span>
        </div>
      </div>
    </Link>
  );
}
