import Image from "next/image";
import Link from "next/link";
import { BedDouble, Check, ChevronRight, Coffee, Flame, Images, MapPin, Maximize2, Trees, Users } from "lucide-react";
import type { AvailabilityResult, Stay } from "@/global/api/types";
import { areaRange, guestsLabel, money, plural } from "@/global/lib/format";
import { stayToQuery } from "@/global/lib/stay";
import { cn } from "@/global/lib/cn";
import { quoteFor, type ResultFilters } from "../_lib/filters";
import RollText from "@/global/components/RollText";
import { asset } from "@/global/lib/asset";

export default function ResultCard({ result, stay, filters }: { result: AvailabilityResult; stay: Stay; filters: ResultFilters }) {
  const { roomType: t, available, soldOut, fitsParty, bookedPercent } = result;
  const q = quoteFor(result, filters);
  const bookable = !soldOut && fitsParty;
  const href = `/rooms/${t.slug}?${stayToQuery(stay)}#availability`;
  const nights = result.lowestQuote?.nights ?? 0;
  const discounted = q && q.undiscountedTotal > q.grandTotal;

  return (
    <article className={cn("group grid overflow-hidden border border-ink/10 bg-white transition duration-500 hover:border-ink/25 sm:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr_240px]", !bookable && "opacity-80")}>
      <Link href={href} className="zoom-img relative block aspect-[4/3] overflow-hidden bg-sky-light sm:aspect-auto sm:min-h-[260px]" aria-label={`${t.name} photos`}>
        <Image src={asset(t.images[0])} alt={t.name} fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 260px, 100vw" className="object-cover" />
        <span className="caps absolute bottom-3 left-3 flex items-center gap-1.5 bg-ink/70 px-2.5 py-1.5 text-[10px] text-bone backdrop-blur-sm">
          <Images className="h-3.5 w-3.5" /> {t.images.length}
        </span>
      </Link>

      <div className="min-w-0 p-5 sm:p-6">
        <p className="caps flex flex-wrap items-center gap-x-2 gap-y-1 text-ink/50">
          <MapPin className="h-3.5 w-3.5" />
          <Link href="/contact" className="underline decoration-ink/30 underline-offset-4 transition hover:text-ink hover:decoration-ink">Nathia Gali</Link>
          <span>· 7,906 ft · Beside PAF Airbase</span>
        </p>
        <h2 className="mt-3 text-2xl leading-[1.05] sm:text-[1.9rem]">
          <Link href={href} className="transition hover:text-ink/70">{t.name}</Link>
        </h2>

        <div className="mt-5 border-t border-ink/10 pt-4">
          <p className="caps text-ink">One-bedroom apartment</p>
          <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-ink/70">
            <li className="flex items-center gap-1.5"><Maximize2 className="h-3.5 w-3.5 text-ink/45" strokeWidth={1.5} />{areaRange(t.minAreaSqft, t.maxAreaSqft) ?? "—"}</li>
            <li className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 text-ink/45" strokeWidth={1.5} />{t.bedType}</li>
            <li className="flex items-center gap-1.5"><Trees className="h-3.5 w-3.5 text-ink/45" strokeWidth={1.5} />{t.outdoorSpace}</li>
            <li className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-ink/45" strokeWidth={1.5} />Sleeps {t.maxOccupancy}</li>
          </ul>

          {bookable && q && (
            <ul className="mt-4 space-y-1 text-sm">
              {q.ratePlan.breakfastIncluded && <li className="flex items-center gap-2 font-semibold text-emerald-800"><Coffee className="h-4 w-4" strokeWidth={1.5} />Breakfast included</li>}
              {q.ratePlan.refundable ? (
                <>
                  <li className="flex items-center gap-2 font-semibold text-emerald-800"><Check className="h-4 w-4" strokeWidth={1.5} />Free cancellation</li>
                  <li className="flex items-center gap-2 text-emerald-800"><Check className="h-4 w-4" strokeWidth={1.5} /><span><strong>No prepayment needed</strong> – pay at the property</span></li>
                </>
              ) : (
                <li className="text-ink/60">Non-refundable · save {q.ratePlan.discountPercent}% · pay at the property</li>
              )}
            </ul>
          )}

          {bookable && available <= 3 && <p className="caps mt-4 text-red-700">Only {available} left at this price on our site</p>}
          {bookable && available > 3 && bookedPercent >= 60 && (
            <p className="caps mt-4 flex items-center gap-1.5 text-red-700"><Flame className="h-3.5 w-3.5" />In high demand – {bookedPercent}% booked for your dates</p>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-end gap-2 border-t border-ink/10 bg-bone/50 p-5 text-right sm:col-span-2 sm:p-6 lg:col-span-1 lg:border-l lg:border-t-0">
        {soldOut ? (
          <p className="caps text-red-700">Sold out for your dates</p>
        ) : !fitsParty ? (
          <p className="text-sm text-amber-800">Sleeps {t.maxOccupancy} per apartment. Add an apartment or choose a larger type.</p>
        ) : q ? (
          <>
            <p className="caps text-ink/50">
              {plural(nights, "night")}, {guestsLabel(stay.adults, stay.children)}
              {stay.rooms > 1 ? `, ${plural(stay.rooms, "apartment")}` : ""}
            </p>
            <p className="mt-1 leading-tight">
              {discounted && <span className="mr-2 font-display text-base text-red-700/80 line-through">{money(q.undiscountedTotal)}</span>}
              <span className="font-display text-[1.9rem] leading-none text-ink">{money(q.grandTotal)}</span>
            </p>
            <p className="text-xs text-ink/50">Includes taxes and charges</p>
          </>
        ) : null}
        <Link href={href} className={cn(bookable ? "btn-primary" : "btn-secondary", "roll-host mt-3 w-full sm:ml-auto sm:w-auto lg:w-full")}>
          <RollText>{bookable ? "See availability" : "View apartment"}</RollText> <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
