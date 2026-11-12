"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRoomTypesQuery } from "@/global/api/endpoints/roomsApi";
import RoomTypeCard from "@/global/components/RoomTypeCard";
import { Alert } from "@/global/components/ui";
import { errorMessage } from "@/global/api/baseApi";
import { cn } from "@/global/lib/cn";
import { Reveal, Stagger, Tilt } from "@/global/components/motion";
import type { RoomType } from "@/global/api/types";

const CHIPS: { key: string; label: string; test: (t: RoomType) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "balcony", label: "Balcony", test: (t) => /balcony/i.test(t.outdoorSpace) },
  { key: "terrace", label: "Terrace", test: (t) => /terrace/i.test(t.outdoorSpace) },
  { key: "family", label: "Family (sleeps 4)", test: (t) => t.maxOccupancy >= 4 },
  { key: "large", label: "700 ft² +", test: (t) => (t.maxAreaSqft ?? 0) >= 700 },
];

// Balanced 6-column grid on desktop: rows of three cards; a leftover pair goes two-wide so there's no gap,
// and a single leftover card is centred.
const isWide = (i: number, n: number) => n % 3 === 2 && i >= n - 2;
function spanFor(i: number, n: number) {
  if (n === 1) return "lg:col-span-2 lg:col-start-3";
  if (isWide(i, n)) return "lg:col-span-3";
  if (n % 3 === 1 && i === n - 1) return "lg:col-span-2 lg:col-start-3";
  return "lg:col-span-2";
}

export default function HomeApartments() {
  const { data, isLoading, error } = useRoomTypesQuery();
  const [chip, setChip] = useState("all");
  const shown = (data ?? []).filter(CHIPS.find((c) => c.key === chip)!.test);

  return (
    <section className="container-page py-20">
      <Reveal className="text-center">
        <h2 className="section-title">Where Comfort Meets the Mountains</h2>
        <p className="section-sub">Fully furnished one-bedroom apartments, each with its own balcony or terrace.</p>
      </Reveal>
      <Reveal delay={120} className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Apartment categories">
          {CHIPS.map((c) => (
            <button key={c.key} role="tab" aria-selected={chip === c.key} onClick={() => setChip(c.key)} className={cn("chip", chip === c.key && "chip-active")}>
              {c.label}
            </button>
          ))}
        </div>
        <Link href="/rooms" className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:underline">
          See all <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>
      {error && <Alert tone="error" className="mt-8">{errorMessage(error)}</Alert>}
      {isLoading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[420px] animate-pulse rounded-3xl bg-zinc-100" />)}
        </div>
      ) : (
        <Stagger key={chip} className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-6" itemClassName={(i) => cn("h-full", spanFor(i, shown.length))}>
          {shown.map((t, i) => (
            <Tilt key={t.id} className="h-full" max={5}>
              <RoomTypeCard type={t} href={`/rooms/${t.slug}`} wide={isWide(i, shown.length)} />
            </Tilt>
          ))}
        </Stagger>
      )}
    </section>
  );
}
