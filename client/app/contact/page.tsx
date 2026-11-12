"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Car, ChevronDown, Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { PageLoader } from "@/global/components/ui";
import PageHero from "@/global/components/PageHero";
import { Reveal, Stagger, Tilt } from "@/global/components/motion";
import { cn } from "@/global/lib/cn";

export default function ContactPage() {
  const { data: p, isLoading } = usePropertyQuery();
  const [open, setOpen] = useState<number | null>(0);
  if (isLoading || !p) return <PageLoader />;

  const tel = (n: string) => `tel:${n.replace(/[^0-9+]/g, "")}`;
  const wa = `https://wa.me/${p.contact.whatsapp.replace(/[^0-9]/g, "")}`;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.mapsQuery)}`;

  const cards = [
    { Icon: Phone, title: "Reservations", value: p.contact.phone, href: tel(p.contact.phone), cta: "Call now" },
    { Icon: MessageCircle, title: "WhatsApp", value: p.contact.whatsapp, href: wa, cta: "Message us", external: true },
    { Icon: MapPin, title: "Resort", value: p.address, href: mapsLink, cta: "Open in Maps", external: true },
    { Icon: Building2, title: "Head office", value: p.contact.headOffice },
  ];

  // Route from farthest to nearest, like a journey.
  const route = [...p.distances].reverse();

  const faqs = [
    { q: "What are the check-in and check-out times?", a: `Check-in ${p.policies.checkIn.toLowerCase()}, check-out ${p.policies.checkOut.toLowerCase()}. The front desk is open 24/7 for late arrivals.` },
    { q: "Do I pay when I book?", a: `${p.policies.payment} No card is needed to reserve.` },
    { q: "Can I cancel my booking?", a: "Flexible rates can be cancelled free of charge up to 48 hours before check-in, online from your confirmation page or account. Non-refundable saver rates can't be refunded." },
    { q: "What ID do I need?", a: p.policies.id },
    { q: "Are children welcome?", a: p.policies.children },
    { q: "Is smoking or bringing pets allowed?", a: `${p.policies.smoking} ${p.policies.pets}` },
    { q: "Is there parking?", a: "Yes. Serene Heights has a dedicated, climate-controlled parking floor for guests." },
  ];

  return (
    <div>
      <PageHero
        image="/images/resort/tower-snow-night.jpg"
        imageAlt="Serene Heights lit up on a snowy evening"
        eyebrow="Location & contact"
        title={"Getting to\nSerene Heights"}
        subtitle={`${p.address}. Two hours from Islamabad, with direct access via the ${p.access.join(", ")}.`}
        crumbs={[{ label: "Location & contact" }]}
      >
        <a href={mapsLink} target="_blank" rel="noreferrer" className="btn-primary px-6 py-3">
          <Navigation className="h-4 w-4" /> Get directions
        </a>
      </PageHero>

      {/* Contact cards */}
      <section className="container-page py-16">
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" itemClassName="h-full">
          {cards.map(({ Icon, title, value, href, cta, external }) => (
            <Tilt key={title} className="h-full" max={7}>
              <div className="flex h-full flex-col rounded-3xl border border-zinc-200 bg-white p-6 shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-ink"><Icon className="h-5 w-5" /></span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-zinc-500">{title}</p>
                <p className="mt-1 flex-1 font-semibold leading-snug text-ink">{value}</p>
                {href && (
                  <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
                    {cta} <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </Tilt>
          ))}
        </Stagger>
        <Reveal delay={200} className="mt-4 flex items-center gap-2 rounded-2xl bg-mist px-5 py-3 text-sm text-zinc-700">
          <Clock className="h-4 w-4 text-brand-700" /> Front desk & concierge open 24/7 · Check-in {p.policies.checkIn.toLowerCase()} · Check-out {p.policies.checkOut.toLowerCase()}
        </Reveal>
      </section>

      {/* Map + journey */}
      <section className="panel bg-mist">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <Reveal>
              <h2 className="section-title">Your Journey Up</h2>
              <p className="section-sub">Distances by road to the resort.</p>
            </Reveal>
            <Stagger as="ol" itemAs="li" className="relative mt-8 space-y-0" step={100}>
              {route.map((d, i) => (
                <div key={d.place} className="relative flex gap-4 pb-7">
                  {i < route.length - 1 && <span className="absolute left-[15px] top-8 h-full w-0.5 bg-ink/15" aria-hidden />}
                  <span className={cn("relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold", i === route.length - 1 ? "bg-lime text-ink" : "bg-white text-ink ring-1 ring-ink/15")}>
                    {i === route.length - 1 ? <MapPin className="h-4 w-4" /> : <Car className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{d.place}</p>
                    <p className="text-sm text-zinc-600">{d.distance}{d.drive ? ` · ${d.drive}` : ""}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-4">
                <span className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-lime"><Building2 className="h-4 w-4" /></span>
                <div>
                  <p className="font-semibold text-ink">Serene Heights</p>
                  <p className="text-sm text-zinc-600">Kala Bagh Air Base Road, 7,906 ft</p>
                </div>
              </div>
            </Stagger>
          </div>
          <Reveal from="right" className="min-h-[460px] overflow-hidden rounded-3xl bg-zinc-100 shadow-card">
            <iframe title="Map of Serene Heights Nathia Gali" src={`https://maps.google.com/maps?q=${encodeURIComponent(p.mapsQuery)}&z=13&output=embed`} className="h-full min-h-[460px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page grid gap-10 py-20 lg:grid-cols-[1fr_1.5fr]">
        <Reveal>
          <h2 className="section-title">Good to Know</h2>
          <p className="section-sub">Quick answers before you travel. Anything else? Call or WhatsApp us any time.</p>
          <Link href="/rooms" className="btn-dark mt-6">Check availability <ArrowRight className="h-4 w-4" /></Link>
        </Reveal>
        <Stagger className="space-y-3" step={60}>
          {faqs.map((f, i) => (
            <div key={f.q} className={cn("overflow-hidden rounded-2xl border transition", open === i ? "border-ink/20 bg-white shadow-card" : "border-zinc-200 bg-white")}>
              <button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-ink" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                {f.q}
                <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform duration-300", open === i && "rotate-180")} />
              </button>
              <div className={cn("grid transition-[grid-template-rows] duration-300 ease-out", open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <p className="overflow-hidden px-5 text-sm text-zinc-600">
                  <span className="block pb-4">{f.a}</span>
                </p>
              </div>
            </div>
          ))}
        </Stagger>
      </section>
    </div>
  );
}
