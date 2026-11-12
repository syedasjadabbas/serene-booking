"use client";

import Link from "next/link";
import { Car, MapPin } from "lucide-react";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";

export default function HomeLocation() {
  const { data: p } = usePropertyQuery();
  if (!p) return null;
  return (
    <section className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-2">
      <div>
        <p className="eyebrow">Location</p>
        <h2 className="section-title mt-2">Beside PAF Airbase, in the heart of the Galiyat</h2>
        <p className="mt-3 flex gap-2 text-zinc-600">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /> {p.address}
        </p>
        <ul className="mt-6 divide-y divide-zinc-100 rounded-2xl border border-zinc-200">
          {p.distances.map((d) => (
            <li key={d.place} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <span className="text-zinc-700">{d.place}</span>
              <span className="flex items-center gap-2 text-zinc-500">
                {d.drive && <Car className="h-4 w-4" />}
                {d.distance}
                {d.drive ? ` · ${d.drive}` : ""}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-zinc-500">Direct access via {p.access.join(", ")}.</p>
        <Link href="/contact" className="btn-secondary mt-6">
          Directions & contact
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
        <iframe
          title="Map of Serene Heights Nathia Gali"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(p.mapsQuery)}&z=13&output=embed`}
          className="h-full min-h-[360px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
