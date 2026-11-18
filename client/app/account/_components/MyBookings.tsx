"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarPlus, Star } from "lucide-react";
import { useMyBookingsQuery, type BookingTab } from "@/global/api/endpoints/bookingsApi";
import { errorMessage } from "@/global/api/baseApi";
import { Alert, EmptyState, StatusPill } from "@/global/components/ui";
import type { Booking } from "@/global/api/types";
import { fmtDate, guestsLabel, money, plural } from "@/global/lib/format";
import { cn } from "@/global/lib/cn";
import ReviewModal from "./ReviewModal";
import RollText from "@/global/components/RollText";

import { asset } from "@/global/lib/asset";
const TABS: { key: BookingTab; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

export default function MyBookings() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = (TABS.find((t) => t.key === params.get("tab"))?.key ?? "upcoming") as BookingTab;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const { data, isFetching, error } = useMyBookingsQuery({ status: tab, page });
  const [reviewing, setReviewing] = useState<Booking | null>(null);

  const go = (t: BookingTab, p = 1) => router.replace(`${pathname}?tab=${t}${p > 1 ? `&page=${p}` : ""}`, { scroll: false });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="caps flex items-center gap-4 text-ink">
            Your stays
            <span className="block h-px w-14 bg-ink/30" aria-hidden />
          </p>
          <h2 className="mt-5 text-[2rem] leading-[1.08] sm:text-5xl">My bookings</h2>
        </div>
        <div className="flex gap-6 sm:gap-8" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => go(t.key)}
              className={cn("caps roll-host border-b py-2 transition", tab === t.key ? "border-ink text-ink" : "border-transparent text-ink/50 hover:text-ink")}
            >
              <RollText>{t.label}</RollText>
            </button>
          ))}
        </div>
      </div>

      {error && <Alert tone="error" className="mt-8">{errorMessage(error)}</Alert>}

      <div className={cn("mt-10 border-t border-ink/15", isFetching && "opacity-60")}>
        {!data && isFetching && Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-40 animate-pulse border-b border-ink/15 bg-ink/[0.03]" />)}
        {data && data.items.length === 0 && (
          <div className="pt-10">
            <EmptyState icon={<CalendarPlus className="h-5 w-5" />} title={tab === "upcoming" ? "No upcoming stays" : tab === "past" ? "No past stays yet" : "No cancelled bookings"} action={tab === "upcoming" ? <Link href="/rooms" className="btn-primary roll-host"><RollText>Plan a stay</RollText></Link> : undefined}>
              {tab === "upcoming" ? "When you book while signed in, your stays appear here." : null}
            </EmptyState>
          </div>
        )}
        {data?.items.map((b) => (
          <article key={b.reference} className="grid gap-5 border-b border-ink/15 py-6 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-8 sm:py-8 lg:grid-cols-[240px_minmax(0,1fr)_auto]">
            <div className="zoom-img relative aspect-[16/10] overflow-hidden bg-mist sm:aspect-[4/3]">
              {b.roomType.image && <Image src={asset(b.roomType.image)} alt="" fill sizes="(min-width: 1024px) 240px, (min-width: 640px) 200px, 100vw" className="object-cover" />}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill status={b.displayStatus} />
                <span className="caps text-ink/50">Ref. {b.reference}</span>
              </div>
              <h3 className="mt-4 text-2xl uppercase leading-tight sm:text-[1.75rem]">{b.roomType.name}</h3>
              <p className="mt-3 font-display text-lg uppercase leading-snug text-ink">
                {fmtDate(b.checkIn, "EEE d MMM")} – {fmtDate(b.checkOut, "EEE d MMM yyyy")}
              </p>
              <p className="caps mt-3 text-ink/55">
                {plural(b.nights, "night")} · {guestsLabel(b.adults, b.children)} · {plural(b.rooms, "apartment")} · {b.ratePlan.name}
              </p>
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4 border-t border-ink/15 pt-5 sm:col-span-2 lg:col-span-1 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="lg:text-right">
                <p className="caps text-ink/50">Total</p>
                <p className="mt-1.5 font-display text-2xl text-ink sm:text-3xl">{money(b.price.grandTotal, b.price.currency)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {b.canReview && (
                  <button onClick={() => setReviewing(b)} className="btn-secondary roll-host px-5 py-3">
                    <Star className="h-3.5 w-3.5" /> <RollText>Review</RollText>
                  </button>
                )}
                <Link href={`/booking/${b.reference}`} className="btn-primary roll-host px-5 py-3">
                  <RollText>Manage</RollText>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-between gap-3 sm:justify-center sm:gap-8">
          <button className="btn-secondary roll-host px-5 py-3" disabled={page <= 1} onClick={() => go(tab, page - 1)}><RollText>Previous</RollText></button>
          <span className="caps text-ink/55">Page {page} of {data.totalPages}</span>
          <button className="btn-secondary roll-host px-5 py-3" disabled={page >= data.totalPages} onClick={() => go(tab, page + 1)}><RollText>Next</RollText></button>
        </div>
      )}

      <ReviewModal booking={reviewing} onClose={() => setReviewing(null)} />
    </>
  );
}
