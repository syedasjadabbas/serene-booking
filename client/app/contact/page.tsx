"use client";

import { Building2, Car, Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { PageLoader } from "@/global/components/ui";

export default function ContactPage() {
  const { data: p, isLoading } = usePropertyQuery();
  if (isLoading || !p) return <PageLoader />;
  const tel = (n: string) => `tel:${n.replace(/[^0-9+]/g, "")}`;
  const wa = `https://wa.me/${p.contact.whatsapp.replace(/[^0-9]/g, "")}`;

  return (
    <div className="container-page py-10">
      <p className="eyebrow">Location & contact</p>
      <h1 className="mt-2 text-3xl font-medium sm:text-4xl">Getting to Serene Heights</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <div className="card space-y-4 p-6 text-sm">
            <p className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-brand-600" /><span><span className="block font-medium">Resort</span>{p.address}</span></p>
            <p className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-brand-600" /><span><span className="block font-medium">Reservations</span><a className="text-brand-700 underline" href={tel(p.contact.phone)}>{p.contact.phone}</a></span></p>
            <p className="flex gap-3"><MessageCircle className="h-5 w-5 shrink-0 text-brand-600" /><span><span className="block font-medium">WhatsApp</span><a className="text-brand-700 underline" href={wa} target="_blank" rel="noreferrer">{p.contact.whatsapp}</a></span></p>
            <p className="flex gap-3"><Building2 className="h-5 w-5 shrink-0 text-brand-600" /><span><span className="block font-medium">Head office</span>{p.contact.headOffice}</span></p>
            <p className="flex gap-3"><Clock className="h-5 w-5 shrink-0 text-brand-600" /><span><span className="block font-medium">Front desk</span>Open 24/7 · Check-in {p.policies.checkIn.toLowerCase()} · Check-out {p.policies.checkOut.toLowerCase()}</span></p>
          </div>
          <div className="card p-6">
            <h2 className="font-medium">Distances</h2>
            <ul className="mt-3 divide-y divide-zinc-100 text-sm">
              {p.distances.map((d) => (
                <li key={d.place} className="flex justify-between gap-4 py-2.5">
                  <span>{d.place}</span>
                  <span className="flex items-center gap-1.5 text-zinc-500">{d.drive && <Car className="h-4 w-4" />}{d.distance}{d.drive ? ` · ${d.drive}` : ""}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-zinc-500">Direct access via {p.access.join(", ")}.</p>
          </div>
        </div>
        <div className="min-h-[420px] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
          <iframe title="Map of Serene Heights Nathia Gali" src={`https://maps.google.com/maps?q=${encodeURIComponent(p.mapsQuery)}&z=13&output=embed`} className="h-full min-h-[420px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </div>
  );
}
