import Image from "next/image";
import Link from "next/link";
import { BedDouble, Check, ChevronRight, Coffee, Flame, Images, MapPin, Maximize2, Trees, Users } from "lucide-react";
import type { AvailabilityResult, Stay } from "@/global/api/types";
import { areaRange, guestsLabel, money, plural } from "@/global/lib/format";
import { stayToQuery } from "@/global/lib/stay";
import { cn } from "@/global/lib/cn";
import { quoteFor, type ResultFilters } from "../_lib/filters";

export default function ResultCard({ result, stay, filters }: { result: AvailabilityResult; stay: Stay; filters: ResultFilters }) {
  const { roomType: t, available, soldOut, fitsParty, bookedPercent } = result;
  const q = quoteFor(result, filters);
  const bookable = !soldOut && fitsParty;
  const href = `/rooms/${t.slug}?${stayToQuery(stay)}#availability`;
  const nights = result.lowestQuote?.nights ?? 0;
  const discounted = q && q.undiscountedTotal > q.grandTotal;

  return (
    <article className={cn("card grid overflow-hidden sm:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_220px]", !bookable && "opacity-80")}>
      <Link href={href} className="relative block aspect-[4/3] bg-zinc-100 sm:aspect-auto sm:min-h-[240px]" aria-label={`${t.name} photos`}>
        <Image src={t.images[0]} alt={t.name} fill sizes="(min-width: 640px) 240px, 100vw" className="object-cover" />
        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
          <Images className="h-3.5 w-3.5" /> {t.images.length}
        </span>
      </Link>

      <div className="p-4 sm:p-5">
        <h2 className="text-xl font-semibold text-brand-700">
          <Link href={href} className="hover:underline">{t.name}</Link>
        </h2>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-zinc-600">
          <MapPin className="h-3.5 w-3.5" />
          <Link href="/contact" className="text-brand-700 underline">Nathia Gali</Link>
          <span>· 7,906 ft · Beside PAF Airbase</span>
        </p>

        <div className="mt-3 border-l-2 border-zinc-200 pl-3">
          <p className="text-sm font-semibold text-zinc-900">One-bedroom apartment</p>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
            <li className="flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5" />{areaRange(t.minAreaSqft, t.maxAreaSqft) ?? "—"}</li>
            <li className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{t.bedType}</li>
            <li className="flex items-center gap-1"><Trees className="h-3.5 w-3.5" />{t.outdoorSpace}</li>
            <li className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />Sleeps {t.maxOccupancy}</li>
          </ul>

          {bookable && q && (
            <ul className="mt-2.5 space-y-0.5 text-sm">
              {q.ratePlan.breakfastIncluded && <li className="flex items-center gap-1.5 font-semibold text-emerald-700"><Coffee className="h-4 w-4" />Breakfast included</li>}
              {q.ratePlan.refundable ? (
                <>
                  <li className="flex items-center gap-1.5 font-semibold text-emerald-700"><Check className="h-4 w-4" />Free cancellation</li>
                  <li className="flex items-center gap-1.5 text-emerald-700"><Check className="h-4 w-4" /><span><strong>No prepayment needed</strong> – pay at the property</span></li>
                </>
              ) : (
                <li className="text-zinc-600">Non-refundable · save {q.ratePlan.discountPercent}% · pay at the property</li>
              )}
            </ul>
          )}

          {bookable && available <= 3 && <p className="mt-2 text-sm font-semibold text-red-700">Only {available} left at this price on our site</p>}
          {bookable && available > 3 && bookedPercent >= 60 && (
            <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-red-700"><Flame className="h-4 w-4" />In high demand – {bookedPercent}% booked for your dates</p>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-end gap-2 border-t border-zinc-100 p-4 text-right sm:col-span-2 sm:p-5 lg:col-span-1 lg:border-l lg:border-t-0">
        {soldOut ? (
          <p className="text-sm font-semibold text-red-700">Sold out for your dates</p>
        ) : !fitsParty ? (
          <p className="text-sm text-amber-800">Sleeps {t.maxOccupancy} per apartment. Add an apartment or choose a larger type.</p>
        ) : q ? (
          <>
            <p className="text-xs text-zinc-500">
              {plural(nights, "night")}, {guestsLabel(stay.adults, stay.children)}
              {stay.rooms > 1 ? `, ${plural(stay.rooms, "apartment")}` : ""}
            </p>
            <p className="leading-tight">
              {discounted && <span className="mr-2 text-sm text-red-600 line-through">{money(q.undiscountedTotal)}</span>}
              <span className="text-2xl font-bold text-zinc-900">{money(q.grandTotal)}</span>
            </p>
            <p className="text-xs text-zinc-500">Includes taxes and charges</p>
          </>
        ) : null}
        <Link href={href} className={cn(bookable ? "btn-primary" : "btn-secondary", "mt-1 w-full sm:ml-auto sm:w-auto lg:w-full")}>
          {bookable ? "See availability" : "View apartment"} <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
