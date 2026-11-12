"use client";

import Link from "next/link";
import { useRoomTypesQuery } from "@/global/api/endpoints/roomsApi";
import RoomTypeCard from "@/global/components/RoomTypeCard";
import { Alert } from "@/global/components/ui";
import { errorMessage } from "@/global/api/baseApi";

export default function HomeApartments() {
  const { data, isLoading, error } = useRoomTypesQuery();
  return (
    <section className="container-page py-16 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Stay</p>
          <h2 className="section-title mt-2">One-bedroom hotel apartments</h2>
          <p className="mt-2 max-w-2xl text-zinc-500">
            Every apartment has a bedroom, a separate sitting room with kitchenette, an en-suite bathroom and its own balcony or terrace.
          </p>
        </div>
        <Link href="/rooms" className="btn-secondary">
          See all apartments
        </Link>
      </div>
      {error && <Alert tone="error" className="mt-8">{errorMessage(error)}</Alert>}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-96 animate-pulse bg-zinc-50" />)}
        {data?.map((t) => <RoomTypeCard key={t.id} type={t} href={`/rooms/${t.slug}`} />)}
      </div>
    </section>
  );
}
