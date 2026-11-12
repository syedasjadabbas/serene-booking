import { useState } from "react";
import type { Quote, RatePlan, Stay } from "@/global/api/types";
import { fmtDate, fmtShort, guestsLabel, money, plural } from "@/global/lib/format";

export default function PriceSummary({ stay, roomName, ratePlan, quote: q }: { stay: Stay; roomName: string; ratePlan: RatePlan; quote: Quote }) {
  const [showNights, setShowNights] = useState(false);
  return (
    <div className="card overflow-hidden">
      <div className="bg-ink px-5 py-4 text-white">
        <p className="text-xs uppercase tracking-widest text-cream/80">Your stay</p>
        <p className="mt-1 font-display text-lg">{roomName}</p>
        <p className="text-sm text-cream/90">{ratePlan.name}</p>
      </div>
      <dl className="grid grid-cols-2 gap-4 border-b border-zinc-100 p-5 text-sm">
        <div>
          <dt className="text-xs text-zinc-500">Check-in</dt>
          <dd className="font-medium">{fmtDate(stay.checkIn)}</dd>
          <dd className="text-xs text-zinc-500">From 2:00 PM</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">Check-out</dt>
          <dd className="font-medium">{fmtDate(stay.checkOut)}</dd>
          <dd className="text-xs text-zinc-500">Until 12:00 PM</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-zinc-500">Guests</dt>
          <dd className="font-medium">
            {guestsLabel(stay.adults, stay.children)} · {plural(stay.rooms, "apartment")} · {plural(q.nights, "night")}
          </dd>
        </div>
      </dl>
      <div className="space-y-2 p-5 text-sm">
        <Row label={`${plural(stay.rooms, "apartment")} × ${plural(q.nights, "night")}`} value={money(q.roomSubtotal, q.currency)} />
        <button type="button" onClick={() => setShowNights((s) => !s)} className="text-xs font-medium text-brand-700 hover:underline">
          {showNights ? "Hide" : "Show"} nightly rates
        </button>
        {showNights && (
          <ul className="space-y-1 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
            {q.nightly.map((n) => (
              <li key={n.date} className="flex justify-between">
                <span>{fmtShort(n.date)}</span>
                <span>{money(n.rate, q.currency)} per apartment</span>
              </li>
            ))}
          </ul>
        )}
        {q.discountTotal > 0 && <Row label={`Saver discount (${ratePlan.discountPercent}%)`} value={`− ${money(q.discountTotal, q.currency)}`} tone="text-emerald-700" />}
        {q.breakfastTotal > 0 && <Row label="Breakfast" value={money(q.breakfastTotal, q.currency)} />}
        <Row label={`Taxes (${q.taxPercent}%)`} value={money(q.taxTotal, q.currency)} />
        <div className="mt-3 flex items-baseline justify-between border-t border-zinc-200 pt-3">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-semibold">{money(q.grandTotal, q.currency)}</span>
        </div>
        <p className="text-xs text-zinc-500">Payable at the property in Pakistani rupees.</p>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className={`flex justify-between gap-4 ${tone ?? "text-zinc-700"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
