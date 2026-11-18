"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, MapPin, MessageCircle, Navigation, Phone, Plus } from "lucide-react";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { PageLoader } from "@/global/components/ui";
import PageHero from "@/global/components/PageHero";
import SectionHeading from "@/global/components/SectionHeading";
import RollText from "@/global/components/RollText";
import { Parallax, Reveal, Stagger } from "@/global/components/motion";
import { cn } from "@/global/lib/cn";
import { asset } from "@/global/lib/asset";

const pad = (n: number) => String(n).padStart(2, "0");

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
        title={"Getting\nHere"}
        subtitle={`${p.address}. Two hours from Islamabad, with direct access via the ${p.access.join(", ")}.`}
        crumbs={[{ label: "Location & contact" }]}
      >
        <a href={mapsLink} target="_blank" rel="noreferrer" className="roll-host btn-gold">
          <Navigation className="h-3.5 w-3.5" /> <RollText>Get directions</RollText>
        </a>
      </PageHero>

      {/* Contact details: a ruled four-column index */}
      <section className="bg-bone py-24 sm:py-32">
        <div className="container-page">
          <SectionHeading label="Contact" title="Talk to Us" />

          <Stagger className="mt-16 grid border-t border-ink/20 sm:grid-cols-2 lg:grid-cols-4" itemClassName="h-full min-w-0" step={90}>
            {cards.map(({ Icon, title, value, href, cta, external }, i) => (
              <div
                key={title}
                className={cn(
                  "flex h-full flex-col border-b border-ink/20 py-8 sm:px-6 lg:border-b-0 lg:px-8",
                  i % 2 === 1 && "sm:border-l",
                  i > 0 && "lg:border-l",
                  i % 2 === 0 && "sm:pl-0",
                  i === 0 && "lg:pl-0",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="caps text-ink/50">{pad(i + 1)}</span>
                  <Icon className="h-4 w-4 text-gold" strokeWidth={1.5} aria-hidden />
                </div>
                <p className="caps mt-8">{title}</p>
                <p className="mt-3 flex-1 break-words font-display text-xl leading-snug text-ink">{value}</p>
                {href && (
                  <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className="roll-host caps tap mt-8 inline-flex w-fit items-center gap-2 border-b border-ink/30 pb-1 transition hover:border-ink">
                    <RollText>{cta}</RollText> <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </a>
                )}
              </div>
            ))}
          </Stagger>

          <Reveal delay={200} className="caps mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-ink/15 py-4 text-ink/70">
            <span>Front desk & concierge open 24/7</span>
            <span className="h-1 w-1 rotate-45 bg-ink/40" aria-hidden />
            <span>Check-in {p.policies.checkIn.toLowerCase()}</span>
            <span className="h-1 w-1 rotate-45 bg-ink/40" aria-hidden />
            <span>Check-out {p.policies.checkOut.toLowerCase()}</span>
          </Reveal>
        </div>
      </section>

      {/* Journey + map */}
      <section className="bg-sky py-24 sm:py-32">
        <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <SectionHeading label="The route" title="Your Journey Up">
              Distances by road to the resort.
            </SectionHeading>

            <Stagger as="ol" itemAs="li" className="mt-12 border-t border-ink/25" step={100}>
              {route.map((d, i) => (
                <div key={d.place} className="flex items-baseline gap-5 border-b border-ink/25 py-5">
                  <span className="caps w-6 shrink-0 text-ink/50">{pad(i + 1)}</span>
                  <span className="min-w-0 flex-1 font-display text-lg uppercase leading-tight sm:text-xl">{d.place}</span>
                  <span className="shrink-0 text-right">
                    <span className="caps block">{d.distance}</span>
                    {d.drive && <span className="mt-1 block text-xs text-ink/60">{d.drive}</span>}
                  </span>
                </div>
              ))}
              <div className="flex items-start gap-5 bg-ink px-4 py-5 text-bone sm:-mx-4">
                <span className="w-6 shrink-0 pt-1">
                  <MapPin className="h-4 w-4 text-sky" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg uppercase leading-tight sm:text-xl">Serene Heights</span>
                  <span className="caps mt-2 block text-bone/75">Kala Bagh Air Base Road, 7,906 ft</span>
                </span>
              </div>
            </Stagger>
          </div>

          <Reveal from="clip" className="relative min-h-[420px] overflow-hidden bg-sky-dark lg:col-span-7 lg:min-h-[560px]">
            <iframe
              title="Map of Serene Heights Nathia Gali"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(p.mapsQuery)}&z=13&output=embed`}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      </section>

      {/* Full-bleed pause */}
      <section data-theme="dark" className="relative isolate flex min-h-[60svh] items-end overflow-hidden text-bone">
        <Parallax speed={-0.12} className="absolute inset-x-0 -top-[10%] -z-10 h-[120%]">
          <Image src={asset("/images/resort/tower-sunset-forest.jpg")} alt="Serene Heights above the forest at sunset" fill sizes="100vw" className="object-cover" />
        </Parallax>
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <div className="container-page caps flex flex-wrap items-center justify-between gap-4 border-t border-bone/25 py-6 text-bone/85">
          <span>Nathia Gali · 7,906 ft</span>
          <span>Two hours from Islamabad</span>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-bone py-24 sm:py-32">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <SectionHeading label="FAQ" title="Good to Know">
              Quick answers before you travel. Anything else? Call or WhatsApp us any time.
            </SectionHeading>
            <Reveal delay={250}>
              <Link href="/rooms" className="roll-host btn-primary mt-10">
                <RollText>Check availability</RollText> <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>

          <Stagger className="border-t border-ink/20 lg:col-span-7 lg:col-start-6" step={60}>
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q} className="border-b border-ink/20">
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-controls={`faq-a-${i}`}
                    className="group flex w-full items-start gap-5 py-6 text-left"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="caps w-6 shrink-0 pt-1 text-ink/45">{pad(i + 1)}</span>
                    <span className="min-w-0 flex-1 text-base font-medium leading-snug text-ink sm:text-lg">{f.q}</span>
                    <Plus className={cn("mt-1 h-4 w-4 shrink-0 transition-transform duration-500", isOpen && "rotate-45")} aria-hidden />
                  </button>
                  <div
                    id={`faq-a-${i}`}
                    role="region"
                    aria-labelledby={`faq-q-${i}`}
                    className={cn("grid transition-[grid-template-rows] duration-500 ease-out motion-reduce:transition-none", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                  >
                    <p className="overflow-hidden pl-11 pr-9 text-[15px] leading-relaxed text-ink/70">
                      <span className="block pb-6">{f.a}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </Stagger>
        </div>
      </section>
    </div>
  );
}
