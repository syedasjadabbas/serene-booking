"use client";

import Link from "next/link";
import { Car, MapPin } from "lucide-react";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { Reveal, Stagger } from "@/global/components/motion";

export default function HomeLocation() {
  const { data: p } = usePropertyQuery();
  if (!p) return null;
  return (
    <section className="container-page grid gap-10 py-20 lg:grid-cols-2 lg:items-center">
      <div>
        <Reveal>
          <h2 className="section-title">In the Heart of the Galiyat</h2>
          <p className="mt-3 flex gap-2 text-zinc-600">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /> {p.address}
          </p>
        </Reveal>
        <Stagger as="ul" itemAs="li" className="mt-6 space-y-2" step={70}>
          {p.distances.map((d) => (
            <div key={d.place} className="flex items-center justify-between gap-4 rounded-2xl bg-mist px-4 py-3 text-sm transition hover:translate-x-1 hover:bg-lime-soft">
              <span className="font-medium text-ink">{d.place}</span>
              <span className="flex items-center gap-2 text-zinc-600">
                {d.drive && <Car className="h-4 w-4" />}
                {d.distance}
                {d.drive ? ` · ${d.drive}` : ""}
              </span>
            </div>
          ))}
        </Stagger>
        <Reveal delay={200}>
          <Link href="/contact" className="btn-dark mt-6">Directions & contact</Link>
        </Reveal>
      </div>
      <Reveal from="right" className="overflow-hidden rounded-3xl bg-zinc-100 shadow-card">
        <iframe
          title="Map of Serene Heights Nathia Gali"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(p.mapsQuery)}&z=13&output=embed`}
          className="h-full min-h-[440px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </Reveal>
    </section>
  );
}
