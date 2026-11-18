"use client";

import Link from "next/link";
import { BedDouble, Check, Coffee, Maximize2, Tag, Trees, User } from "lucide-react";
import { useRatesQuery } from "@/global/api/endpoints/roomsApi";
import { errorMessage } from "@/global/api/baseApi";
import { Alert, Spinner } from "@/global/components/ui";
import type { RoomTypeDetail, Stay } from "@/global/api/types";
import { areaRange, fmtDate, money, plural } from "@/global/lib/format";
import { stayToQuery } from "@/global/lib/stay";
import { cn } from "@/global/lib/cn";
import RollText from "@/global/components/RollText";

// Booking.com-style availability table, set in the editorial style: one row per rate plan for this apartment type.
export default function AvailabilityTable({ type, stay }: { type: RoomTypeDetail; stay: Stay }) {
  const { data, isFetching, error } = useRatesQuery({ slug: type.slug, ...stay });

  if (error) return <Alert tone="error">{errorMessage(error)}</Alert>;
  if (!data) return <div className="flex justify-center py-10"><Spinner /></div>;

  if (data.soldOut) {
    return (
      <Alert tone="warning" title={`${type.name} is sold out for your dates`}>
        Try other dates (the calendar shows prices for free nights) or <Link className="underline" href={`/rooms?${stayToQuery(stay)}`}>see other apartment types</Link>.
      </Alert>
    );
  }
  if (!data.fitsParty) {
    return (
      <Alert tone="warning" title="Too many guests for this apartment">
        {type.name} sleeps up to {type.maxOccupancy} ({type.maxAdults} adults) per apartment. Add another apartment in the search above or choose a larger type.
      </Alert>
    );
  }

  const nights = data.rates[0]?.quote.nights ?? 0;
  const guests = stay.adults + stay.children;
  const freeUntil = (hours: number) => {
    const d = new Date(`${stay.checkIn}T14:00:00+05:00`);
    d.setHours(d.getHours() - hours);
    return fmtDate(d.toISOString().slice(0, 10), "d MMM yyyy");
  };

  return (
    <div className={cn("overflow-hidden border border-ink/15 bg-white transition-opacity", isFetching && "opacity-60")}>
      <table className="w-full border-collapse text-sm">
        <thead className="hidden bg-ink text-left text-bone md:table-header-group">
          <tr>
            <th className="caps w-[28%] px-5 py-4">Apartment type</th>
            <th className="caps px-4 py-4">Guests</th>
            <th className="caps px-4 py-4">Price for {plural(nights, "night")}</th>
            <th className="caps px-4 py-4">Your choices</th>
            <th className="w-[180px] px-4 py-4" />
          </tr>
        </thead>
        <tbody>
          {data.rates.map(({ ratePlan: rp, quote: q }, i) => {
            const undiscounted = q.grandTotal + Math.round(q.discountTotal * (1 + q.taxPercent / 100));
            return (
              <tr key={rp.code} className="flex flex-col border-t border-ink/10 first:border-t-0 md:table-row">
                {i === 0 && (
                  <td rowSpan={data.rates.length} className="border-ink/10 bg-bone/60 px-5 py-5 align-top md:border-r">
                    <p className="font-display text-xl leading-tight text-ink">{type.name}</p>
                    {data.available <= 3 && <p className="caps mt-2 text-[10px] text-red-700">Only {data.available} left on our site</p>}
                    <ul className="mt-4 space-y-1.5 border-t border-ink/10 pt-3 text-xs text-ink/70">
                      <li className="flex items-center gap-2"><BedDouble className="h-3.5 w-3.5 text-ink/45" strokeWidth={1.5} />{type.bedType}</li>
                      <li className="flex items-center gap-2"><Maximize2 className="h-3.5 w-3.5 text-ink/45" strokeWidth={1.5} />{areaRange(type.minAreaSqft, type.maxAreaSqft)}</li>
                      <li className="flex items-center gap-2"><Trees className="h-3.5 w-3.5 text-ink/45" strokeWidth={1.5} />{type.outdoorSpace}</li>
                    </ul>
                    <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                      {type.features.slice(0, 6).map((f) => (
                        <li key={f} className="flex items-center gap-1 text-[11px] text-ink/60"><Check className="h-3 w-3 text-emerald-700" />{f}</li>
                      ))}
                    </ul>
                  </td>
                )}
                <td className="px-5 pt-5 align-top md:px-4 md:py-5">
                  <span className="flex items-center gap-0.5 text-ink/70" aria-label={`${guests} guests`} title={`${guests} guests`}>
                    {Array.from({ length: Math.min(guests, 6) }).map((_, k) => <User key={k} className="h-4 w-4" />)}
                    {stay.rooms > 1 && <span className="ml-1 text-xs text-ink/50">× {plural(stay.rooms, "apt", "apts")}</span>}
                  </span>
                </td>
                <td className="px-5 py-3 align-top md:px-4 md:py-5">
                  {q.discountTotal > 0 && <p className="font-display text-sm text-red-700/80 line-through">{money(undiscounted)}</p>}
                  <p className="font-display text-2xl leading-tight text-ink">{money(q.grandTotal)}</p>
                  <p className="text-xs text-ink/50">Includes taxes and charges</p>
                  {q.discountTotal > 0 && <span className="caps mt-2 inline-flex items-center gap-1 bg-emerald-800 px-2 py-1 text-[10px] text-white"><Tag className="h-3 w-3" />{rp.discountPercent}% off</span>}
                </td>
                <td className="px-5 py-3 align-top md:px-4 md:py-5">
                  <ul className="space-y-1.5 text-xs">
                    {rp.breakfastIncluded ? (
                      <li className="flex items-start gap-1.5 font-semibold text-emerald-700"><Coffee className="mt-0.5 h-3.5 w-3.5 shrink-0" />Breakfast included for every guest</li>
                    ) : (
                      <li className="text-ink/60">Room only</li>
                    )}
                    {rp.refundable ? (
                      <li className="flex items-start gap-1.5 font-semibold text-emerald-700"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />Free cancellation before {freeUntil(rp.freeCancelHours ?? 0)}</li>
                    ) : (
                      <li className="text-ink/70"><strong>Non-refundable</strong> · no changes</li>
                    )}
                    <li className="flex items-start gap-1.5 text-emerald-700"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span><strong>No prepayment needed</strong> – pay at the property</span></li>
                  </ul>
                </td>
                <td className="px-5 pb-5 pt-2 align-top md:px-4 md:py-5">
                  <Link href={`/book?${stayToQuery(stay, { room: type.slug, rate: rp.code })}`} className="btn-primary roll-host w-full">
                    <RollText>I&apos;ll reserve</RollText>
                  </Link>
                  <p className="mt-2 text-center text-[11px] text-ink/50">You won&apos;t be charged yet</p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
