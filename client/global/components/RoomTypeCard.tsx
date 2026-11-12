import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bath, BedDouble, Maximize2, Users } from "lucide-react";
import type { RoomType } from "@/global/api/types";
import { money } from "@/global/lib/format";

// Photo card with details overlaid on a dark gradient and a lime price (reference design).
export default function RoomTypeCard({ type, href }: { type: RoomType; href: string }) {
  return (
    <Link href={href} className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-zinc-200 sm:aspect-[5/6]">
      <Image src={type.images[0]} alt={type.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
      <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink transition group-hover:bg-lime">
        <ArrowUpRight className="h-4 w-4" />
      </span>
      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">{type.outdoorSpace}</span>
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <h3 className="text-lg font-bold text-white">{type.name}</h3>
        <p className="text-sm text-white/75">Nathia Gali, Pakistan</p>
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/85">
          <li className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{type.maxOccupancy} Guests</li>
          <li className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{type.bedrooms} Bed</li>
          <li className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{type.bathrooms} Bath</li>
          {type.maxAreaSqft && <li className="flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5" />{type.minAreaSqft === type.maxAreaSqft ? type.maxAreaSqft : `${type.minAreaSqft}–${type.maxAreaSqft}`} ft²</li>}
        </ul>
        <p className="mt-3 text-lg font-bold text-lime">
          {money(type.baseRate)}
          <span className="text-sm font-medium text-white/80">/night</span>
        </p>
      </div>
    </Link>
  );
}
