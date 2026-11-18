"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { skipToken } from "@reduxjs/toolkit/query";
import { CheckCircle2 } from "lucide-react";
import { useMyBookingQuery } from "@/global/api/endpoints/bookingsApi";
import { errorMessage } from "@/global/api/baseApi";
import { useAuthStore } from "@/global/stores/authStore";
import { useBookingStore } from "@/global/stores/bookingStore";
import BookingDetails from "@/global/components/BookingDetails";
import BookingSteps from "@/global/components/BookingSteps";
import { Alert, PageLoader } from "@/global/components/ui";
import LookupForm from "@/app/manage/_components/LookupForm";

export default function BookingView() {
  const { reference } = useParams<{ reference: string }>();
  const ref = decodeURIComponent(reference).toUpperCase();
  const isNew = useSearchParams().get("new") === "1";
  const { status } = useAuthStore();
  const stored = useBookingStore((s) => s.byRef[ref]);
  const remember = useBookingStore((s) => s.remember);

  // Signed-in customers load from their account; guests use the booking kept in memory or look it up.
  const useAccount = !stored && status === "authenticated";
  const { data: mine, isLoading, error } = useMyBookingQuery(useAccount ? ref : skipToken);

  if (!stored && status === "unknown") return <PageLoader />;
  if (useAccount && isLoading) return <PageLoader />;

  const booking = stored?.booking ?? mine;

  return (
    <div className="min-h-screen bg-bone">
      <div className="container-page pb-24 pt-10 sm:pt-14">
        {isNew && booking?.status === "CONFIRMED" && (
          <div className="mb-10 max-w-2xl">
            <BookingSteps current={3} />
          </div>
        )}
        {isNew && booking?.status === "CONFIRMED" && (
          <div role="status" className="mb-10 flex items-start gap-4 border-l-2 border-emerald-700/60 bg-emerald-50/80 p-5 text-emerald-900 sm:p-6">
            <CheckCircle2 className="mt-1 h-6 w-6 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="font-display text-2xl uppercase leading-tight">Your booking is confirmed</p>
              <p className="mt-2 text-sm leading-relaxed">
                Thank you, {booking.guest.firstName}. Keep your reference <strong>{booking.reference}</strong> to manage your booking. You&apos;ll pay at the property.
              </p>
            </div>
          </div>
        )}
        <div className="mb-10 border-b border-ink/15 pb-8">
          <p className="caps flex items-center gap-4 text-ink/60">
            Your booking
            <span className="block h-px w-14 bg-ink/30" aria-hidden />
          </p>
          <h1 className="fade-up mt-5 break-words text-[2.3rem] leading-[1.02] sm:text-6xl">Booking {ref}</h1>
        </div>

        {booking ? (
          <BookingDetails booking={booking} guestEmail={stored?.email} onChange={(b) => stored && remember(b)} />
        ) : (
          <div className="max-w-lg [&_.input]:rounded-none">
            {useAccount && error && <Alert tone="warning" className="mb-4">{errorMessage(error)}</Alert>}
            <Alert tone="info" className="mb-6">Enter the email address used for this booking to view it.</Alert>
            <LookupForm defaultReference={ref} />
            <p className="mt-5 text-sm text-ink/60">
              Have an account? <Link className="font-semibold text-ink underline decoration-ink/30 underline-offset-4 transition hover:decoration-ink" href={`/login?next=/booking/${ref}`}>Sign in</Link> to see all your bookings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
