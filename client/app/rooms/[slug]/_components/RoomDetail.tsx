"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, BedDouble, Check, Maximize2, Trees, Users } from "lucide-react";
import { useRoomTypeQuery } from "@/global/api/endpoints/roomsApi";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { errorMessage } from "@/global/api/baseApi";
import { Alert, PageLoader } from "@/global/components/ui";
import SearchBar from "@/global/components/SearchBar";
import { areaRange } from "@/global/lib/format";
import { isPastStay, parseStay, stayToQuery } from "@/global/lib/stay";
import RatesPanel from "./RatesPanel";

export default function RoomDetail() {
  const { slug } = useParams<{ slug: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const paramsKey = params.toString();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stay = useMemo(() => parseStay(params), [paramsKey]);
  const { data: t, isLoading, error } = useRoomTypeQuery(slug);
  const { data: property } = usePropertyQuery();
  const [active, setActive] = useState(0);
  const [showAll, setShowAll] = useState(false);

  if (isLoading) return <PageLoader />;
  if (error || !t) {
    return (
      <div className="container-page py-16">
        <Alert tone="error" title="Apartment type not found">{errorMessage(error)}</Alert>
        <Link href="/rooms" className="btn-secondary mt-6">Back to apartments</Link>
      </div>
    );
  }

  const floorPlans = property?.floors.filter((f) => t.floors.some((tf) => tf.label === f.label)) ?? [];
  const apartments = showAll ? t.apartments : t.apartments.slice(0, 12);

  return (
    <div className="container-page py-8">
      <Link href={stay ? `/rooms?${stayToQuery(stay)}` : "/rooms"} className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> All apartments
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0">
          <h1 className="text-3xl font-medium sm:text-4xl">{t.name}</h1>
          <p className="mt-2 text-zinc-500">{t.tagline}</p>

          {/* Gallery */}
          <div className="mt-6">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100">
              <Image src={t.images[active]} alt={`${t.name}, photo ${active + 1}`} fill priority sizes="(min-width: 1024px) 60vw, 100vw" className={t.images[active].includes("floor-plans") ? "object-contain bg-white" : "object-cover"} />
            </div>
            <div className="mt-3 flex gap-3">
              {t.images.map((src, i) => (
                <button key={src} onClick={() => setActive(i)} className={`relative h-20 w-28 overflow-hidden rounded-xl border-2 ${i === active ? "border-brand-600" : "border-transparent opacity-80 hover:opacity-100"}`} aria-label={`Show photo ${i + 1}`}>
                  <Image src={src} alt="" fill sizes="112px" className="object-cover" />
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-zinc-500">Building renders and floor plan. Apartment interior photos coming soon.</p>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-zinc-200 p-5 text-sm sm:grid-cols-4">
            <Fact Icon={Maximize2} label="Size" value={areaRange(t.minAreaSqft, t.maxAreaSqft) ?? "—"} />
            <Fact Icon={Users} label="Sleeps" value={`Up to ${t.maxOccupancy}`} />
            <Fact Icon={BedDouble} label="Beds" value={t.bedType} />
            <Fact Icon={Trees} label="Outdoor" value={t.outdoorSpace} />
          </ul>

          <section className="mt-8">
            <h2 className="text-xl font-medium">About this apartment</h2>
            <p className="mt-2 leading-relaxed text-zinc-600">{t.description}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-medium">Where you&apos;ll stay</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {t.totalApartments} apartments of this type across {t.floors.map((f) => f.label).join(", ")}. Your apartment number is assigned at check-in.
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Apartment</th>
                    <th className="px-4 py-2.5 font-medium">Floor</th>
                    <th className="px-4 py-2.5 font-medium">Area</th>
                    <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Outdoor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {apartments.map((a) => (
                    <tr key={a.number}>
                      <td className="px-4 py-2.5 font-medium text-zinc-900">{a.number}</td>
                      <td className="px-4 py-2.5 text-zinc-600">{a.floorLabel}</td>
                      <td className="px-4 py-2.5 text-zinc-600">{a.areaSqft ? `${a.areaSqft} sq ft` : "—"}</td>
                      <td className="hidden px-4 py-2.5 text-zinc-600 sm:table-cell">{a.outdoorSpace}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {t.apartments.length > 12 && (
                <button onClick={() => setShowAll((s) => !s)} className="w-full border-t border-zinc-100 py-2.5 text-sm font-medium text-brand-700 hover:bg-zinc-50">
                  {showAll ? "Show fewer" : `Show all ${t.apartments.length}`}
                </button>
              )}
            </div>
            {floorPlans.length > 0 && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {floorPlans.slice(0, 2).map((f) => (
                  <Link key={f.key} href={`/floor-plans#floor-${f.key}`} className="card overflow-hidden hover:shadow-pop">
                    <div className="relative aspect-[3/2] bg-white">
                      <Image src={f.plans[0]} alt={`${f.label} plan`} fill sizes="(min-width: 640px) 30vw, 100vw" className="object-contain p-2" />
                    </div>
                    <p className="border-t border-zinc-100 px-4 py-2.5 text-sm font-medium">{f.label} plan →</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {property && (
            <section className="mt-10">
              <h2 className="text-xl font-medium">House rules</h2>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                {(["checkIn", "checkOut", "children", "pets", "smoking", "id"] as const).map((k) => (
                  <div key={k} className="rounded-xl bg-zinc-50 p-3">
                    <dt className="font-medium capitalize text-zinc-900">{k === "checkIn" ? "Check-in" : k === "checkOut" ? "Check-out" : k === "id" ? "ID" : k}</dt>
                    <dd className="mt-0.5 text-zinc-600">{property.policies[k]}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="text-lg font-medium">Choose your dates</h2>
            <div className="mt-3">
              <SearchBar variant="panel" initial={stay} onSearch={(s) => router.replace(`${pathname}?${stayToQuery(s)}`, { scroll: false })} submitLabel={stay ? "Update" : "Check rates"} />
            </div>
            {stay && isPastStay(stay) && <Alert tone="warning" className="mt-4">Those dates have passed. Pick new dates.</Alert>}
            {stay && !isPastStay(stay) ? (
              <RatesPanel slug={t.slug} stay={stay} />
            ) : (
              !stay && <p className="mt-4 text-sm text-zinc-500">Select dates to see rates and availability.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Fact({ Icon, label, value }: { Icon: typeof Users; label: string; value: string }) {
  return (
    <li>
      <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-500"><Icon className="h-3.5 w-3.5" />{label}</span>
      <span className="mt-1 block font-medium text-zinc-900">{value}</span>
    </li>
  );
}
