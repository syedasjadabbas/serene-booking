"use client";

import Image from "next/image";
import {
  Baby, Bath, Briefcase, Building, Camera, Car, Coffee, Dumbbell, Flame, Flag, HeartPulse, Landmark, Mountain, PartyPopper,
  Presentation, ShieldCheck, Sparkles, Target, Telescope, Trees, Utensils, Waves, Wifi, Zap, type LucideIcon,
} from "lucide-react";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { PageLoader } from "@/global/components/ui";

const ICONS: Record<string, LucideIcon> = {
  pool: Waves, spa: Bath, gym: Dumbbell, restaurant: Utensils, roomService: Coffee, housekeeping: Sparkles, concierge: Building,
  business: Briefcase, conference: Presentation, banquet: PartyPopper, lawn: Trees, golf: Flag, zipline: Mountain, climbing: Mountain,
  archery: Target, shooting: Target, telescope: Telescope, sports: Baby, heating: Flame, power: Zap, parking: Car, security: ShieldCheck,
  mosque: Landmark, wifi: Wifi,
};

export default function AmenitiesPage() {
  const { data: p, isLoading } = usePropertyQuery();
  if (isLoading || !p) return <PageLoader />;
  const groups = [...new Set(p.amenities.map((a) => a.group))];

  return (
    <div>
      <section className="relative isolate">
        <Image src="/images/gallery/infinity-pool.png" alt="Infinity pool" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-brand-900/60" />
        <div className="container-page py-20 text-white">
          <p className="eyebrow text-gold-light">Amenities</p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-light text-white sm:text-5xl">50+ world-class resort facilities</h1>
          <p className="mt-3 max-w-xl text-cream/90">Everything for a winter escape or a summer retreat, without leaving the resort.</p>
        </div>
      </section>

      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          {groups.map((g) => (
            <section key={g}>
              <h2 className="text-xl font-medium">{g}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {p.amenities.filter((a) => a.group === g).map((a) => {
                  const Icon = ICONS[a.key] ?? HeartPulse;
                  return (
                    <li key={a.key} className="flex gap-3 rounded-xl border border-zinc-200 p-3">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{a.name}</p>
                        {a.description && <p className="text-xs text-zinc-500">{a.description}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="section-title">Experiences</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {p.experiences.map((e) => (
              <div key={e.image} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image src={e.image} alt={e.title} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="section-title flex items-center gap-2"><Camera className="h-6 w-6 text-brand-600" />Gallery</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {p.gallery.map((g) => (
              <figure key={g.src} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-100">
                <Image src={g.src} alt={g.alt} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-xs text-white">{g.alt}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
