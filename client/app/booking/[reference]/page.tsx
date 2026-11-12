import { Suspense } from "react";
import type { Metadata } from "next";
import { PageLoader } from "@/global/components/ui";
import BookingView from "./_components/BookingView";

export const metadata: Metadata = { title: "Your booking", robots: { index: false } };

export default function BookingPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BookingView />
    </Suspense>
  );
}
