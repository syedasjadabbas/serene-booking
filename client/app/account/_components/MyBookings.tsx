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
      <div className="flex gap-2" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => go(t.key)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium", tab === t.key ? "bg-brand-600 text-white" : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50")}>
            {t.label}
          </button>
        ))}
      </div>

      {error && <Alert tone="error" className="mt-6">{errorMessage(error)}</Alert>}

      <div className={cn("mt-6 space-y-4", isFetching && "opacity-60")}>
        {!data && isFetching && Array.from({ length: 2 }).map((_, i) => <div key={i} className="card h-36 animate-pulse bg-white" />)}
        {data && data.items.length === 0 && (
          <EmptyState icon={<CalendarPlus className="h-5 w-5" />} title={tab === "upcoming" ? "No upcoming stays" : tab === "past" ? "No past stays yet" : "No cancelled bookings"} action={tab === "upcoming" ? <Link href="/rooms" className="btn-primary">Plan a stay</Link> : undefined}>
            {tab === "upcoming" ? "When you book while signed in, your stays appear here." : null}
          </EmptyState>
        )}
        {data?.items.map((b) => (
          <article key={b.reference} className="card grid overflow-hidden sm:grid-cols-[180px_1fr_auto]">
            <div className="relative aspect-[16/9] bg-zinc-100 sm:aspect-auto">
              {b.roomType.image && <Image src={b.roomType.image} alt="" fill sizes="180px" className="object-cover" />}
            </div>
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={b.displayStatus} />
                <span className="font-mono text-xs text-zinc-500">{b.reference}</span>
              </div>
              <h2 className="mt-1.5 font-medium">{b.roomType.name}</h2>
              <p className="text-sm text-zinc-600">
                {fmtDate(b.checkIn, "EEE d MMM")} – {fmtDate(b.checkOut, "EEE d MMM yyyy")} · {plural(b.nights, "night")}
              </p>
              <p className="text-sm text-zinc-500">{guestsLabel(b.adults, b.children)} · {plural(b.rooms, "apartment")} · {b.ratePlan.name}</p>
            </div>
            <div className="flex flex-row items-center justify-between gap-3 border-t border-zinc-100 p-4 sm:flex-col sm:items-end sm:border-l sm:border-t-0">
              <p className="text-lg font-semibold">{money(b.price.grandTotal, b.price.currency)}</p>
              <div className="flex gap-2">
                {b.canReview && (
                  <button onClick={() => setReviewing(b)} className="btn-secondary py-2">
                    <Star className="h-4 w-4" /> Review
                  </button>
                )}
                <Link href={`/booking/${b.reference}`} className="btn-primary py-2">
                  Manage
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <button className="btn-secondary py-2" disabled={page <= 1} onClick={() => go(tab, page - 1)}>Previous</button>
          <span className="text-zinc-500">Page {page} of {data.totalPages}</span>
          <button className="btn-secondary py-2" disabled={page >= data.totalPages} onClick={() => go(tab, page + 1)}>Next</button>
        </div>
      )}

      <ReviewModal booking={reviewing} onClose={() => setReviewing(null)} />
    </>
  );
}
