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
import { asset } from "@/global/lib/asset";

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
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:gap-12">
      <div className="min-w-0 space-y-8">
        <section className="overflow-hidden border border-ink/10 bg-white">
          <div className="grid sm:grid-cols-[260px_1fr]">
            <div className="relative aspect-[4/3] bg-sky-light sm:aspect-auto sm:min-h-[240px]">
              {b.roomType.image && <Image src={asset(b.roomType.image)} alt={b.roomType.name} fill sizes="(min-width: 640px) 260px, 100vw" className="object-cover" />}
            </div>
            <div className="min-w-0 p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill status={b.displayStatus} />
                <span className="text-xs text-ink/50">Booked {fmtDateTime(b.createdAt)}</span>
              </div>
              <h2 className="mt-4 text-[1.7rem] leading-[1.05] sm:text-3xl">
                <Link href={`/rooms/${b.roomType.slug}`} className="transition hover:text-ink/70">{b.roomType.name}</Link>
              </h2>
              <p className="mt-2 text-sm text-ink/60">{b.ratePlan.name} · {b.roomType.bedType} · {b.roomType.outdoorSpace}</p>
              <dl className="mt-6 grid gap-x-6 gap-y-5 border-t border-ink/10 pt-5 text-sm sm:grid-cols-2">
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

        <div className="divide-y divide-ink/15 border-y border-ink/20">
          <section className="grid gap-3 py-6 sm:grid-cols-[200px_1fr] sm:gap-8">
            <h3 className="caps text-ink">Lead guest</h3>
            <div className="min-w-0">
              <p className="break-words text-sm text-ink/75">
                {b.guest.firstName} {b.guest.lastName} · {b.guest.email} · {b.guest.phone}
              </p>
              {b.specialRequests && (
                <p className="mt-3 border-l-2 border-ink/20 bg-white/70 px-4 py-3 text-sm text-ink/70">
                  <span className="font-semibold text-ink">Special requests:</span> {b.specialRequests}
                </p>
              )}
            </div>
          </section>

          <section className="grid gap-3 py-6 sm:grid-cols-[200px_1fr] sm:gap-8">
            <h3 className="caps text-ink">Cancellation policy</h3>
            <div>
              {b.ratePlan.refundable && b.freeCancellationUntil ? (
                <p className="flex gap-2 text-sm text-emerald-800">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} /> Free cancellation until {fmtDateTime(b.freeCancellationUntil)} (Pakistan time).
                </p>
              ) : (
                <p className="text-sm text-ink/65">Non-refundable rate. If you cancel, the full amount is payable.</p>
              )}
              {b.canCancel && (
                <button onClick={() => setConfirmOpen(true)} className="btn-secondary mt-5 border-red-700/30 text-red-700 hover:border-red-700 hover:bg-red-700 hover:text-white">
                  Cancel booking
                </button>
              )}
            </div>
          </section>

          <section className="grid gap-3 py-6 sm:grid-cols-[200px_1fr] sm:gap-8">
            <h3 className="caps text-ink">Getting there</h3>
            <div className="space-y-2 text-sm text-ink/70">
              <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" strokeWidth={1.5} />{b.property.address}</p>
              <p className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" strokeWidth={1.5} />Front desk: {b.property.phone}</p>
            </div>
          </section>
        </div>
      </div>

      <aside className="min-w-0 space-y-4 lg:sticky lg:top-28 lg:self-start">
        <div className="overflow-hidden border border-ink/10 bg-white">
          <div data-theme="dark" className="bg-pine px-6 py-6 text-bone">
            <p className="caps text-bone/60">Booking reference</p>
            <p className="mt-3 break-all font-display text-3xl leading-none tracking-wider text-bone">{b.reference}</p>
          </div>
          <div className="space-y-2.5 px-6 py-5 text-sm">
            <Row label={`Apartments × nights`} value={money(b.price.roomSubtotal, b.price.currency)} />
            {b.price.discountTotal > 0 && <Row label="Discount" value={`− ${money(b.price.discountTotal, b.price.currency)}`} />}
            {b.price.breakfastTotal > 0 && <Row label="Breakfast" value={money(b.price.breakfastTotal, b.price.currency)} />}
            <Row label="Taxes" value={money(b.price.taxTotal, b.price.currency)} />
            <div className="!mt-5 flex items-baseline justify-between gap-4 border-t border-ink/20 pt-5">
              <span className="caps text-ink">Total</span>
              <span className="font-display text-3xl leading-none text-ink">{money(b.price.grandTotal, b.price.currency)}</span>
            </div>
          </div>
          <div className="caps border-t border-ink/10 bg-bone/60 px-6 py-3.5 text-[10px] text-ink/65">
            {PAYMENT_LABEL[b.payment.method]} · {PAYMENT_STATUS[b.payment.status]}
          </div>
          <div className="px-6 pb-6 pt-5">
            <button onClick={() => window.print()} className="btn-secondary w-full">
              <Printer className="h-4 w-4" /> Print confirmation
            </button>
          </div>
        </div>
      </aside>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Cancel this booking?">
        <p className="text-sm leading-relaxed text-ink/70">
          {b.cancelIsFree
            ? "You're within the free cancellation window. Nothing will be charged."
            : b.ratePlan.refundable
              ? "The free cancellation window has passed. The front desk will contact you about any charge."
              : "This is a non-refundable rate. The full amount remains payable."}
        </p>
        <label className="mt-5 block">
          <span className="caps mb-2 block text-ink/70">Reason (optional)</span>
          <textarea rows={2} maxLength={300} className="input rounded-none" value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
        {error && <Alert tone="error" className="mt-3">{errorMessage(error)}</Alert>}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button className="btn-secondary" onClick={() => setConfirmOpen(false)}>Keep booking</button>
          <button className="btn bg-red-700 text-white hover:bg-red-800" onClick={doCancel} disabled={isLoading}>
            {isLoading ? "Cancelling…" : "Yes, cancel"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Item({ Icon, label, value, sub }: { Icon: typeof Users; label: string; value: string; sub?: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" strokeWidth={1.5} />
      <div>
        <dt className="caps text-ink/50">{label}</dt>
        <dd className="mt-1.5 font-display text-lg leading-tight text-ink">{value}</dd>
        {sub && <dd className="mt-1 text-xs text-ink/50">{sub}</dd>}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-ink/75">
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
