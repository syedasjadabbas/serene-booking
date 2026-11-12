import Image from "next/image";
import Link from "next/link";
import { BedDouble, Maximize2, Trees, Users } from "lucide-react";
import type { RoomType } from "@/global/api/types";
import { areaRange, money } from "@/global/lib/format";

export default function RoomTypeCard({ type, href }: { type: RoomType; href: string }) {
  return (
    <Link href={href} className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-pop">
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
        <Image src={type.images[0]} alt={type.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-medium">{type.name}</h3>
        <p className="mt-1 text-sm text-zinc-500">{type.tagline}</p>
        <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-600">
          <li className="flex items-center gap-1.5"><Maximize2 className="h-3.5 w-3.5" />{areaRange(type.minAreaSqft, type.maxAreaSqft) ?? "—"}</li>
          <li className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Sleeps {type.maxOccupancy}</li>
          <li className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5" />{type.bedType}</li>
          <li className="flex items-center gap-1.5"><Trees className="h-3.5 w-3.5" />{type.outdoorSpace}</li>
        </ul>
        <div className="mt-auto flex items-end justify-between pt-5">
          <p className="text-xs text-zinc-500">
            From <span className="block text-lg font-semibold text-zinc-900">{money(type.baseRate)}</span> per night
          </p>
          <span className="text-sm font-semibold text-brand-700 group-hover:underline">View rates →</span>
        </div>
      </div>
    </Link>
  );
}
