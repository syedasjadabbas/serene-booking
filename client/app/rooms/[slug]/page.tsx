import { Suspense } from "react";
import { PageLoader } from "@/global/components/ui";
import RoomDetail from "./_components/RoomDetail";

export default function RoomDetailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RoomDetail />
    </Suspense>
  );
}
