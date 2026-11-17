"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import { useRoomTypesQuery } from "@/global/api/endpoints/roomsApi";
import { money } from "@/global/lib/format";
import { asset } from "@/global/lib/asset";
import { cn } from "@/global/lib/cn";
import RollText from "./RollText";

/**
 * Full-screen list of the apartment types, wiped open from the bottom. Each row: number, the name in large
 * capitals, key figures and the price; hovering a row shows its photo. Escape or "Close" dismisses it.
 */
export default function ApartmentsPanel({ onClose }: { onClose: () => void }) {
  const { data } = useRoomTypesQuery();
  const types = data ?? [];
  const [hover, setHover] = useState(0);

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Available apartments" className="panel-in fixed inset-0 z-50 overflow-y-auto bg-bone text-ink">
      <div className="container-page flex min-h-full flex-col py-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="caps">Available apartments</p>
            <p className="mt-2 max-w-xs text-sm text-ink/60">Fully furnished one-bedroom hotel apartments. Choose a type to see dates and prices.</p>
          </div>
          <button type="button" onClick={onClose} className="roll-host caps flex items-center gap-2" autoFocus>
            <RollText>Close</RollText> <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-12 grid flex-1 gap-10 lg:grid-cols-12">
          <ul className="divide-y divide-ink/15 border-y border-ink/15 lg:col-span-8">
            {types.map((t, i) => {
              const size = t.maxAreaSqft ? (t.minAreaSqft === t.maxAreaSqft ? `${t.maxAreaSqft}` : `${t.minAreaSqft}–${t.maxAreaSqft}`) : null;
              return (
                <li key={t.id} className="menu-item" style={{ "--i": i } as CSSProperties}>
                  <Link
                    href={`/rooms/${t.slug}`}
                    onClick={onClose}
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-5"
                  >
                    <span className="caps text-ink/50">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-display text-[2.2rem] uppercase leading-none transition duration-500 group-hover:translate-x-2 sm:text-6xl">{t.name}</span>
                      <span className="caps mt-2 block text-ink/55">
                        Sleeps {t.maxOccupancy}
                        {size ? ` · ${size} ft²` : ""} · {t.outdoorSpace} · {t.totalApartments} apartments
                      </span>
                    </span>
                    <span className="flex items-center gap-4">
                      <span className="hidden text-right sm:block">
                        <span className="caps block text-ink/50">From</span>
                        <span className="font-display text-2xl">{money(t.baseRate)}</span>
                      </span>
                      <span className="grid h-10 w-10 place-items-center rounded-full border border-ink/25 transition group-hover:bg-ink group-hover:text-bone">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="relative hidden lg:col-span-4 lg:block">
            <div className="sticky top-8 aspect-[3/4] overflow-hidden">
              {types.map((t, i) => (
                <Image
                  key={t.id}
                  src={asset(t.images[0])}
                  alt=""
                  fill
                  sizes="30vw"
                  className={cn("object-cover transition duration-700", i === hover ? "scale-100 opacity-100" : "scale-105 opacity-0")}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <Link href="/rooms" onClick={onClose} className="btn-primary">Check availability for your dates</Link>
          <Link href="/floor-plans" onClick={onClose} className="roll-host caps">
            <RollText>View floor plans</RollText>
          </Link>
        </div>
      </div>
    </div>
  );
}
