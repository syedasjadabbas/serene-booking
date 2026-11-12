import { Suspense } from "react";
import type { Metadata } from "next";
import { PageLoader } from "@/global/components/ui";
import Checkout from "./_components/Checkout";

export const metadata: Metadata = { title: "Complete your booking", robots: { index: false } };

export default function BookPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Checkout />
    </Suspense>
  );
}
