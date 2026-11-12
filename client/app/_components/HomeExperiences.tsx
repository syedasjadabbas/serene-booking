"use client";

import Image from "next/image";
import Link from "next/link";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";

export default function HomeExperiences() {
  const { data: p } = usePropertyQuery();
  if (!p) return null;
  return (
    <section className="bg-brand-800 py-16 text-cream sm:py-20">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Experiences</p>
            <h2 className="section-title mt-2 text-white">50+ resort facilities at 7,906 ft</h2>
            <p className="mt-2 max-w-2xl text-cream/70">Heated infinity pool, rooftop dining, spa, zipline, mini golf and more, all on site.</p>
          </div>
          <Link href="/amenities" className="btn border border-cream/30 text-cream hover:bg-white/10">
            All amenities
          </Link>
        </div>
        {/* Each tile's title is printed on the official artwork, so the alt text carries it. */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {p.experiences.slice(0, 8).map((e) => (
            <div key={e.image} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image src={e.image} alt={e.title} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
