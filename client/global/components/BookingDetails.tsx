"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Phone, Printer, ShieldCheck, Users } from "lucide-react";
import type { Booking } from "@/global/api/types";
import { useCancelBookingMutation } from "@/global/api/endpoints/bookingsApi";
import { errorMessage } from "@/global/api/baseApi";
import { Alert, StatusPill } from "./ui";
import Modal from "./Modal";
import { fmtDate, fmtDateTime, guestsLabel, money, plural } from "@/global/lib/format";

const PAYMENT_LABEL = { PAY_AT_PROPERTY: "Pay at the property", CARD: "Card", BANK_TRANSFER: "Bank transfer" } as const;
const PAYMENT_STATUS = { UNPAID: "Not paid yet", PENDING: "Payment pending", PAID: "Paid", REFUNDED: "Refunded" } as const;

/** Full booking view. `guestEmail` is passed for guests (not signed in) so they can cancel. */
export default function BookingDetails({ booking: b, guestEmail, onChange }: { booking: Booking; guestEmail?: string; onChange?: (b: Booking) => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [cancel, { isLoading, error }] = useCancelBookingMutation();

  const doCancel = async () => {
    try {
      const updated = await cancel({ reference: b.reference, email: guestEmail, reason: reason || undefined }).unwrap();
      onChange?.(updated);
      setConfirmOpen(false);
    } catch {
      /* error shown in modal */
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="card overflow-hidden">
          <div className="grid sm:grid-cols-[220px_1fr]">
            <div className="relative aspect-[4/3] bg-zinc-100 sm:aspect-auto">
              {b.roomType.image && <Image src={b.roomType.image} alt={b.roomType.name} fill sizes="220px" className="object-cover" />}
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={b.displayStatus} />
                <span className="text-xs text-zinc-500">Booked {fmtDateTime(b.createdAt)}</span>
              </div>
              <h2 className="mt-2 text-xl font-medium">
                <Link href={`/rooms/${b.roomType.slug}`} className="hover:underline">{b.roomType.name}</Link>
              </h2>
              <p className="text-sm text-zinc-500">{b.ratePlan.name} · {b.roomType.bedType} · {b.roomType.outdoorSpace}</p>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <Item Icon={CalendarDays} label="Check-in" value={`${fmtDate(b.checkIn)}`} sub={b.property.checkIn} />
                <Item Icon={CalendarDays} label="Check-out" value={`${fmtDate(b.checkOut)}`} sub={b.property.checkOut} />
                <Item Icon={Users} label="Guests" value={`${guestsLabel(b.adults, b.children)}`} sub={`${plural(b.rooms, "apartment")} · ${plural(b.nights, "night")}`} />
                {b.arrivalTime && <Item Icon={Clock} label="Arrival" value={b.arrivalTime} />}
              </dl>
            </div>
          </div>
        </section>

        {b.status === "CANCELLED" && (
          <Alert tone="error" title="This booking was cancelled">
            Cancelled {b.cancelledAt ? fmtDateTime(b.cancelledAt) : ""}. The apartment has been released.
          </Alert>
        )}

        <section className="card p-5">
          <h3 className="font-medium">Lead guest</h3>
          <p className="mt-2 text-sm text-zinc-700">
            {b.guest.firstName} {b.guest.lastName} · {b.guest.email} · {b.guest.phone}
          </p>
          {b.specialRequests && (
            <p className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
              <span className="font-medium text-zinc-800">Special requests:</span> {b.specialRequests}
            </p>
          )}
        </section>

        <section className="card p-5">
          <h3 className="font-medium">Cancellation policy</h3>
          {b.ratePlan.refundable && b.freeCancellationUntil ? (
            <p className="mt-2 flex gap-2 text-sm text-emerald-700">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Free cancellation until {fmtDateTime(b.freeCancellationUntil)} (Pakistan time).
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-600">Non-refundable rate. If you cancel, the full amount is payable.</p>
          )}
          {b.canCancel && (
            <button onClick={() => setConfirmOpen(true)} className="btn-secondary mt-4 border-red-200 text-red-700 hover:bg-red-50">
              Cancel booking
            </button>
          )}
        </section>

        <section className="card p-5">
          <h3 className="font-medium">Getting there</h3>
          <p className="mt-2 flex gap-2 text-sm text-zinc-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{b.property.address}</p>
          <p className="mt-1 flex gap-2 text-sm text-zinc-600"><Phone className="mt-0.5 h-4 w-4 shrink-0" />Front desk: {b.property.phone}</p>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Booking reference</p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-wider text-brand-700">{b.reference}</p>
          <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-sm">
            <Row label={`Apartments × nights`} value={money(b.price.roomSubtotal, b.price.currency)} />
            {b.price.discountTotal > 0 && <Row label="Discount" value={`− ${money(b.price.discountTotal, b.price.currency)}`} />}
            {b.price.breakfastTotal > 0 && <Row label="Breakfast" value={money(b.price.breakfastTotal, b.price.currency)} />}
            <Row label="Taxes" value={money(b.price.taxTotal, b.price.currency)} />
            <div className="flex items-baseline justify-between border-t border-zinc-200 pt-3">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-semibold">{money(b.price.grandTotal, b.price.currency)}</span>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
            {PAYMENT_LABEL[b.payment.method]} · {PAYMENT_STATUS[b.payment.status]}
          </div>
          <button onClick={() => window.print()} className="btn-secondary mt-4 w-full py-2">
            <Printer className="h-4 w-4" /> Print confirmation
          </button>
        </div>
      </aside>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Cancel this booking?">
        <p className="text-sm text-zinc-600">
          {b.cancelIsFree
            ? "You're within the free cancellation window. Nothing will be charged."
            : b.ratePlan.refundable
              ? "The free cancellation window has passed. The front desk will contact you about any charge."
              : "This is a non-refundable rate. The full amount remains payable."}
        </p>
        <label className="mt-4 block">
          <span className="label">Reason (optional)</span>
          <textarea rows={2} maxLength={300} className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
        {error && <Alert tone="error" className="mt-3">{errorMessage(error)}</Alert>}
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setConfirmOpen(false)}>Keep booking</button>
          <button className="btn bg-red-600 text-white hover:bg-red-700" onClick={doCancel} disabled={isLoading}>
            {isLoading ? "Cancelling…" : "Yes, cancel"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Item({ Icon, label, value, sub }: { Icon: typeof Users; label: string; value: string; sub?: string }) {
  return (
    <div className="flex gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
      <div>
        <dt className="text-xs text-zinc-500">{label}</dt>
        <dd className="font-medium text-zinc-900">{value}</dd>
        {sub && <dd className="text-xs text-zinc-500">{sub}</dd>}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-zinc-700">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
