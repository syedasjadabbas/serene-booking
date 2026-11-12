"use client";

import Link from "next/link";
import { Coffee, ShieldCheck, Tag } from "lucide-react";
import { useRatesQuery } from "@/global/api/endpoints/roomsApi";
import { errorMessage } from "@/global/api/baseApi";
import { Alert, Spinner } from "@/global/components/ui";
import type { Stay } from "@/global/api/types";
import { money, plural } from "@/global/lib/format";
import { stayToQuery } from "@/global/lib/stay";

export default function RatesPanel({ slug, stay }: { slug: string; stay: Stay }) {
  const { data, isFetching, error } = useRatesQuery({ slug, ...stay });

  if (error) return <Alert tone="error" className="mt-4">{errorMessage(error)}</Alert>;
  if (!data) return <div className="mt-6 flex justify-center"><Spinner /></div>;

  if (data.soldOut) {
    return (
      <Alert tone="warning" className="mt-4" title="Sold out for these dates">
        Try different dates or <Link className="underline" href={`/rooms?${stayToQuery(stay)}`}>another apartment type</Link>.
      </Alert>
    );
  }
  if (!data.fitsParty) {
    return (
      <Alert tone="warning" className="mt-4" title="Too many guests">
        This apartment sleeps up to {data.roomType.maxOccupancy} ({data.roomType.maxAdults} adults). Add another apartment or choose a larger type.
      </Alert>
    );
  }

  return (
    <div className={`mt-5 space-y-3 transition ${isFetching ? "opacity-60" : ""}`}>
      <p className="text-xs text-zinc-500">
        {data.available <= 3 ? <span className="font-semibold text-amber-700">Only {data.available} left · </span> : null}
        {plural(data.rates[0]?.quote.nights ?? 0, "night")} · {plural(stay.rooms, "apartment")} · prices include {data.rates[0]?.quote.taxPercent}% tax
      </p>
      {data.rates.map(({ ratePlan: rp, quote: q }) => (
        <div key={rp.code} className="rounded-xl border border-zinc-200 p-4 hover:border-brand-300">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-zinc-900">{rp.name}</p>
              <ul className="mt-1.5 space-y-1 text-xs">
                {rp.refundable ? (
                  <li className="flex items-center gap-1 text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" />Free cancellation until {rp.freeCancelHours}h before check-in</li>
                ) : (
                  <li className="flex items-center gap-1 text-zinc-600"><Tag className="h-3.5 w-3.5" />Non-refundable · save {rp.discountPercent}%</li>
                )}
                {rp.breakfastIncluded && <li className="flex items-center gap-1 text-zinc-600"><Coffee className="h-3.5 w-3.5" />Breakfast for every guest</li>}
              </ul>
            </div>
            <div className="text-right">
              {q.discountTotal > 0 && <p className="text-xs text-zinc-400 line-through">{money(q.grandTotal + Math.round(q.discountTotal * (1 + q.taxPercent / 100)), q.currency)}</p>}
              <p className="text-lg font-semibold text-zinc-900">{money(q.grandTotal, q.currency)}</p>
              <p className="text-xs text-zinc-500">{money(q.avgNightlyPerRoom, q.currency)} / night</p>
            </div>
          </div>
          <Link href={`/book?${stayToQuery(stay, { room: slug, rate: rp.code })}`} className="btn-primary mt-3 w-full py-2">
            Reserve
          </Link>
        </div>
      ))}
      <p className="text-center text-xs text-zinc-500">You won&apos;t be charged yet. Pay at the property.</p>
    </div>
  );
}
