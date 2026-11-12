import { Suspense } from "react";
import type { Metadata } from "next";
import { PageLoader } from "@/global/components/ui";
import RoomsSearch from "./_components/RoomsSearch";

export const metadata: Metadata = { title: "Apartments & availability" };

export default function RoomsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RoomsSearch />
    </Suspense>
  );
}
