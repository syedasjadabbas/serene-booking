import { useState } from "react";
import type { Quote, RatePlan, Stay } from "@/global/api/types";
import { fmtDate, fmtShort, guestsLabel, money, plural } from "@/global/lib/format";

export default function PriceSummary({ stay, roomName, ratePlan, quote: q }: { stay: Stay; roomName: string; ratePlan: RatePlan; quote: Quote }) {
  const [showNights, setShowNights] = useState(false);
  return (
    <div className="overflow-hidden border border-ink/10 bg-white">
      <div data-theme="dark" className="bg-pine px-6 py-6 text-bone">
        <p className="caps text-bone/60">Your stay</p>
        <p className="mt-3 font-display text-2xl uppercase leading-[1.05] text-bone">{roomName}</p>
        <p className="mt-2 text-sm text-bone/75">{ratePlan.name}</p>
      </div>
      <dl className="grid grid-cols-2 border-b border-ink/10 text-sm">
        <div className="border-r border-ink/10 px-6 py-5">
          <dt className="caps text-ink/50">Check-in</dt>
          <dd className="mt-2 font-display text-lg leading-tight text-ink">{fmtDate(stay.checkIn)}</dd>
          <dd className="mt-1 text-xs text-ink/50">From 2:00 PM</dd>
        </div>
        <div className="px-6 py-5">
          <dt className="caps text-ink/50">Check-out</dt>
          <dd className="mt-2 font-display text-lg leading-tight text-ink">{fmtDate(stay.checkOut)}</dd>
          <dd className="mt-1 text-xs text-ink/50">Until 12:00 PM</dd>
        </div>
        <div className="col-span-2 border-t border-ink/10 px-6 py-5">
          <dt className="caps text-ink/50">Guests</dt>
          <dd className="mt-2 text-ink">
            {guestsLabel(stay.adults, stay.children)} · {plural(stay.rooms, "apartment")} · {plural(q.nights, "night")}
          </dd>
        </div>
      </dl>
      <div className="space-y-2.5 px-6 py-5 text-sm">
        <Row label={`${plural(stay.rooms, "apartment")} × ${plural(q.nights, "night")}`} value={money(q.roomSubtotal, q.currency)} />
        <button type="button" onClick={() => setShowNights((s) => !s)} className="tap caps text-[10px] text-ink/60 underline decoration-ink/30 underline-offset-4 transition hover:text-ink hover:decoration-ink">
          {showNights ? "Hide" : "Show"} nightly rates
        </button>
        {showNights && (
          <ul className="divide-y divide-ink/10 border-y border-ink/10 bg-bone/60 px-3 text-xs text-ink/65">
            {q.nightly.map((n) => (
              <li key={n.date} className="flex justify-between gap-3 py-2">
                <span>{fmtShort(n.date)}</span>
                <span>{money(n.rate, q.currency)} per apartment</span>
              </li>
            ))}
          </ul>
        )}
        {q.discountTotal > 0 && <Row label={`Saver discount (${ratePlan.discountPercent}%)`} value={`− ${money(q.discountTotal, q.currency)}`} tone="text-emerald-800" />}
        {q.breakfastTotal > 0 && <Row label="Breakfast" value={money(q.breakfastTotal, q.currency)} />}
        <Row label={`Taxes (${q.taxPercent}%)`} value={money(q.taxTotal, q.currency)} />
        <div className="!mt-5 flex items-baseline justify-between gap-4 border-t border-ink/20 pt-5">
          <span className="caps text-ink">Total</span>
          <span className="font-display text-3xl leading-none text-ink">{money(q.grandTotal, q.currency)}</span>
        </div>
        <p className="text-xs text-ink/50">Payable at the property in Pakistani rupees.</p>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className={`flex justify-between gap-4 ${tone ?? "text-ink/75"}`}>
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
