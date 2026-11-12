"use client";

import Image from "next/image";
import { Building2, Star } from "lucide-react";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";

const POINTS = [
  { title: "Pay at the Property", text: "Reserve with no card and no prepayment. Pay by cash or card when you arrive." },
  { title: "Free Cancellation", text: "Flexible rates can be cancelled free of charge up to 48 hours before check-in." },
  { title: "Instant Confirmation", text: "Your booking reference arrives the moment you book. Manage it online any time." },
  { title: "24/7 Front Desk & Concierge", text: "Express check-in and check-out, luggage storage, room service and daily housekeeping." },
];

export default function HomeUnique() {
  const { data: p } = usePropertyQuery();
  return (
    <section className="panel bg-mist">
      <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-20">
        <div>
          <h2 className="section-title">What Makes Serene Heights Unique</h2>
          <p className="section-sub max-w-lg">A fully managed hotel-apartment resort at 7,906 ft, two hours from Islamabad, with 50+ facilities on site.</p>
          <dl className="mt-10 space-y-7">
            {POINTS.map((pt) => (
              <div key={pt.title} className="max-w-md">
                <dt className="font-bold text-ink">{pt.title}</dt>
                <dd className="mt-1 text-sm text-zinc-600">{pt.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Collage with floating badges */}
        <div className="relative mx-auto h-[440px] w-full max-w-lg">
          <div className="absolute right-0 top-0 h-[380px] w-[72%] overflow-hidden rounded-3xl">
            <Image src="/images/resort/aerial-pool-portrait.jpg" alt="The tower and its glass-roof rooftop pool above the misty pines" fill sizes="(min-width: 1024px) 30vw, 70vw" className="object-cover" />
          </div>
          <div className="absolute bottom-0 left-0 h-[200px] w-[48%] overflow-hidden rounded-3xl border-[6px] border-mist">
            <Image src="/images/dining/rooftop-restaurant.jpg" alt="Rooftop restaurant with glass walls" fill sizes="(min-width: 1024px) 20vw, 45vw" className="object-cover" />
          </div>
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-card">
            <Star className="h-3.5 w-3.5 fill-lime text-ink" /> 50+ resort facilities
          </span>
          <span className="absolute bottom-[38%] left-[30%] inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 text-xs font-semibold text-ink shadow-pop">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-lime"><Building2 className="h-3.5 w-3.5" /></span>
            {p ? `${p.stats.apartments} apartments` : "Hotel apartments"}
          </span>
        </div>
      </div>
    </section>
  );
}
