import Image from "next/image";
import Link from "next/link";
import { BedDouble, Check, Maximize2, Trees, Users } from "lucide-react";
import type { AvailabilityResult, Stay } from "@/global/api/types";
import { areaRange, money, plural } from "@/global/lib/format";
import { stayToQuery } from "@/global/lib/stay";
import { cn } from "@/global/lib/cn";

export default function ResultCard({ result, stay }: { result: AvailabilityResult; stay: Stay }) {
  const { roomType: t, available, soldOut, fitsParty, lowestQuote: q } = result;
  const bookable = !soldOut && fitsParty;
  const href = `/rooms/${t.slug}?${stayToQuery(stay)}`;

  return (
    <article className={cn("card grid overflow-hidden md:grid-cols-[300px_1fr_240px]", !bookable && "opacity-75")}>
      <Link href={href} className="relative block aspect-[4/3] bg-zinc-100 md:aspect-auto md:min-h-[220px]">
        <Image src={t.images[0]} alt={t.name} fill sizes="(min-width: 768px) 300px, 100vw" className="object-cover" />
      </Link>

      <div className="p-5">
        <h2 className="text-xl font-medium">
          <Link href={href} className="hover:underline">{t.name}</Link>
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{t.tagline}</p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600">
          <li className="flex items-center gap-1.5"><Maximize2 className="h-4 w-4" />{areaRange(t.minAreaSqft, t.maxAreaSqft) ?? "—"}</li>
          <li className="flex items-center gap-1.5"><Users className="h-4 w-4" />Sleeps {t.maxOccupancy}</li>
          <li className="flex items-center gap-1.5"><BedDouble className="h-4 w-4" />{t.bedType}</li>
          <li className="flex items-center gap-1.5"><Trees className="h-4 w-4" />{t.outdoorSpace}</li>
        </ul>
        <ul className="mt-4 space-y-1 text-sm text-emerald-700">
          <li className="flex items-center gap-1.5"><Check className="h-4 w-4" />Free cancellation on flexible rates</li>
          <li className="flex items-center gap-1.5"><Check className="h-4 w-4" />No prepayment: pay at the property</li>
        </ul>
      </div>

      <div className="flex flex-col justify-between gap-4 border-t border-zinc-100 bg-zinc-50/60 p-5 md:border-l md:border-t-0">
        <div className="space-y-1">
          {soldOut ? (
            <span className="pill bg-red-50 text-red-700 ring-1 ring-red-200">Sold out for your dates</span>
          ) : !fitsParty ? (
            <span className="pill bg-amber-50 text-amber-800 ring-1 ring-amber-200">Too many guests for {plural(stay.rooms, "apartment")}</span>
          ) : available <= 3 ? (
            <span className="pill bg-amber-50 text-amber-800 ring-1 ring-amber-200">Only {available} left</span>
          ) : (
            <span className="pill bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">{available} available</span>
          )}
        </div>
        {q && (
          <div className="text-right">
            <p className="text-xs text-zinc-500">
              {plural(q.nights, "night")}, {plural(stay.rooms, "apartment")} from
            </p>
            <p className="text-2xl font-semibold text-zinc-900">{money(q.grandTotal, q.currency)}</p>
            <p className="text-xs text-zinc-500">≈ {money(q.avgNightlyPerRoom, q.currency)} / night · incl. taxes</p>
          </div>
        )}
        <Link href={href} className={cn(bookable ? "btn-primary" : "btn-secondary", "w-full")} aria-disabled={!bookable}>
          {bookable ? "See rates" : "View details"}
        </Link>
      </div>
    </article>
  );
}
