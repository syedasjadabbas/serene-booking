import { Suspense } from "react";
import { PageLoader } from "@/global/components/ui";
import MyBookings from "./_components/MyBookings";

export default function AccountPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MyBookings />
    </Suspense>
  );
}
