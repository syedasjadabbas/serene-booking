"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { PageLoader } from "@/global/components/ui";
import { cn } from "@/global/lib/cn";

export default function FloorPlansPage() {
  const { data: p, isLoading } = usePropertyQuery();
  const [active, setActive] = useState<string | null>(null);
  // Deep links like /floor-plans#floor-6 (used on apartment pages) open that floor.
  useEffect(() => {
    const m = window.location.hash.match(/^#floor-(.+)$/);
    if (m) setActive(decodeURIComponent(m[1]));
  }, []);
  if (isLoading || !p) return <PageLoader />;
  const current = p.floors.find((f) => f.key === active) ?? p.floors.find((f) => f.key === "1") ?? p.floors[0];

  return (
    <div className="container-page py-10">
      <p className="eyebrow">Floor plans</p>
      <h1 className="mt-2 text-3xl font-medium sm:text-4xl">Find your apartment</h1>
      <p className="mt-2 max-w-2xl text-zinc-600">
        {p.stats.apartments} one-bedroom apartments across the G1 to 8th floors, each with a bedroom, sitting room with kitchenette, bathroom and a balcony or terrace. Apartment numbers and areas are shown on each plan.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Floors" className="flex gap-2 overflow-x-auto lg:flex-col">
          {p.floors.map((f) => (
            <button
              key={f.key}
              id={`floor-${f.key}`}
              onClick={() => setActive(f.key)}
              className={cn("shrink-0 rounded-xl px-4 py-3 text-left text-sm transition", current.key === f.key ? "bg-brand-600 text-white" : "bg-white ring-1 ring-zinc-200 hover:bg-zinc-50")}
            >
              <span className="block font-medium">{f.label}</span>
              <span className={cn("hidden text-xs lg:block", current.key === f.key ? "text-cream/80" : "text-zinc-500")}>{f.summary}</span>
            </button>
          ))}
        </nav>
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-5 py-3">
            <div>
              <h2 className="font-medium">{current.label}</h2>
              <p className="text-sm text-zinc-500">{current.summary}</p>
            </div>
            <a href={current.plans[0]} target="_blank" rel="noreferrer" className="btn-secondary py-2">Open full size</a>
          </div>
          <div className="relative aspect-[3/2] bg-white">
            <Image src={current.plans[0]} alt={`${current.label} floor plan`} fill sizes="(min-width: 1024px) 70vw, 100vw" className="object-contain p-3" />
          </div>
        </div>
      </div>
      <p className="mt-6 text-sm text-zinc-500">
        Ready to stay? <Link href="/rooms" className="font-medium text-brand-700 underline">Check availability</Link>
      </p>
    </div>
  );
}
