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
    <div className="bg-zinc-50/60">
      <div className="container-page py-8">
        {isNew && booking?.status === "CONFIRMED" && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
            <div>
              <p className="text-lg font-medium">Your booking is confirmed</p>
              <p className="text-sm">
                Thank you, {booking.guest.firstName}. Keep your reference <strong>{booking.reference}</strong> to manage your booking. You&apos;ll pay at the property.
              </p>
            </div>
          </div>
        )}
        <h1 className="mb-6 text-3xl font-medium">Booking {ref}</h1>

        {booking ? (
          <BookingDetails booking={booking} guestEmail={stored?.email} onChange={(b) => stored && remember(b)} />
        ) : (
          <div className="max-w-lg">
            {useAccount && error && <Alert tone="warning" className="mb-4">{errorMessage(error)}</Alert>}
            <Alert tone="info" className="mb-4">Enter the email address used for this booking to view it.</Alert>
            <LookupForm defaultReference={ref} />
            <p className="mt-4 text-sm text-zinc-500">
              Have an account? <Link className="font-medium text-brand-700 underline" href={`/login?next=/booking/${ref}`}>Sign in</Link> to see all your bookings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
