"use client";

import Image from "next/image";
import { Building2, Star } from "lucide-react";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { CountUp, Parallax, Reveal, Stagger } from "@/global/components/motion";

import { asset } from "@/global/lib/asset";
const POINTS = [
  { title: "Pay at the Property", text: "Reserve with no card and no prepayment. Pay by cash or card when you arrive." },
  { title: "Free Cancellation", text: "Flexible rates can be cancelled free of charge up to 48 hours before check-in." },
  { title: "Instant Confirmation", text: "Your booking reference arrives the moment you book. Manage it online any time." },
  { title: "24/7 Front Desk & Concierge", text: "Express check-in and check-out, luggage storage, room service and daily housekeeping." },
];

export default function HomeUnique() {
  const { data: p } = usePropertyQuery();
  const stats = [
    { value: 7906, suffix: " ft", label: "Altitude" },
    { value: p?.stats.apartments ?? 130, suffix: "", label: "Apartments" },
    { value: 50, suffix: "+", label: "Resort facilities" },
    { value: 80, suffix: " km", label: "From Islamabad" },
  ];

  return (
    <section className="panel bg-mist">
      <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <Reveal>
            <p className="eyebrow">Why stay with us</p>
            <h2 className="section-title mt-4">What Makes Serene Heights Unique</h2>
            <p className="mt-4 max-w-lg text-[15px] font-light leading-relaxed">A fully managed hotel-apartment resort at 7,906 ft, two hours from Islamabad, with 50+ facilities on site.</p>
          </Reveal>
          <Stagger className="mt-10 space-y-7" step={110}>
            {POINTS.map((pt) => (
              <div key={pt.title} className="flex max-w-md gap-4">
                <span className="mt-2 h-2 w-2 shrink-0 rotate-45 border border-gold" />
                <div>
                  <h3 className="text-xl text-ink">{pt.title}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{pt.text}</p>
                </div>
              </div>
            ))}
          </Stagger>
        </div>

        {/* Collage: layers drift at different speeds while scrolling; badges float */}
        <div className="relative mx-auto h-[460px] w-full max-w-lg">
          <Parallax speed={0.06} className="absolute right-0 top-0 h-[400px] w-[72%]">
            <Reveal from="clip" className="arch relative h-full w-full shadow-pop">
              <Image src={asset("/images/interiors/sunrise-balcony.jpg")} alt="Sunrise through the arched balcony doors of an apartment" fill sizes="(min-width: 1024px) 30vw, 70vw" className="object-cover" />
            </Reveal>
          </Parallax>
          <Parallax speed={-0.1} className="absolute bottom-0 left-0 h-[210px] w-[50%]">
            <Reveal from="clip" delay={250} className="relative h-full w-full overflow-hidden rounded-[6px] border-[6px] border-mist shadow-pop">
              <Image src={asset("/images/interiors/kitchenette.jpg")} alt="Fitted kitchenette with marble backsplash" fill sizes="(min-width: 1024px) 20vw, 45vw" className="object-cover object-[50%_60%]" />
            </Reveal>
          </Parallax>
          <span className="float-slow absolute right-4 top-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-card">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" /> 50+ resort facilities
          </span>
          <span className="float-slower absolute bottom-[40%] left-[28%] inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 text-xs font-semibold text-ink shadow-pop">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-pine text-white"><Building2 className="h-3.5 w-3.5" /></span>
            {p ? `${p.stats.apartments} apartments` : "Hotel apartments"}
          </span>
        </div>
      </div>

      <div className="container-page pb-14">
        <dl className="grid grid-cols-2 gap-y-8 border-y border-ink/10 py-10 sm:grid-cols-4 sm:divide-x sm:divide-ink/10">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse text-center">
              <dt className="mt-2 text-[11px] font-medium uppercase tracking-[0.3em] text-gold">{s.label}</dt>
              <dd className="font-display text-4xl text-ink sm:text-5xl">
                <CountUp to={s.value} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
