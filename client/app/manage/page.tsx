import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Mail, Printer, Ticket } from "lucide-react";
import PageHero from "@/global/components/PageHero";
import SectionHeading from "@/global/components/SectionHeading";
import { Reveal, Stagger } from "@/global/components/motion";
import LookupForm from "./_components/LookupForm";

export const metadata: Metadata = { title: "Find your booking" };

const STEPS = [
  { Icon: Ticket, title: "Your reference", text: "It looks like SH-XXXXXX and is shown on your confirmation." },
  { Icon: Mail, title: "The email you booked with", text: "We use it to make sure only you can open the booking." },
  { Icon: CalendarCheck, title: "Manage your stay", text: "See dates, price and policy, or cancel a flexible rate." },
  { Icon: Printer, title: "Print your confirmation", text: "Handy to show at the front desk on arrival." },
];

export default function ManagePage() {
  return (
    <div>
      <PageHero
        size="sm"
        image="/images/interiors/living-room-wide.jpg"
        imageAlt="Apartment living room with sofa and dining area"
        eyebrow="Manage booking"
        title={"Find Your\nBooking"}
        subtitle="No account needed. Use your booking reference and email."
        crumbs={[{ label: "Find booking" }]}
      />
      <section className="bg-bone py-24 sm:py-32">
        <div className="container-page grid gap-16 lg:grid-cols-12 lg:items-start lg:gap-10">
          <div className="lg:col-span-6">
            <SectionHeading label="Manage booking" title="How It Works" />
            <Stagger as="ol" itemAs="li" className="mt-12 border-t border-ink/20" step={90}>
              {STEPS.map(({ Icon, title, text }, i) => (
                <div key={title} className="grid grid-cols-[2.5rem_1fr_auto] items-start gap-4 border-b border-ink/20 py-7 sm:gap-6">
                  <span className="caps pt-1.5 text-ink/50">0{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-display text-xl uppercase leading-tight sm:text-2xl">{title}</p>
                    <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink/70">{text}</p>
                  </div>
                  <Icon className="mt-1 h-5 w-5 text-gold" strokeWidth={1.4} aria-hidden />
                </div>
              ))}
            </Stagger>
            <Reveal delay={200}>
              <p className="mt-10 text-[15px] text-ink/70">
                Booked with an account?{" "}
                <Link href="/login?next=/account" className="caps tap text-ink underline decoration-ink/30 underline-offset-[6px] transition hover:decoration-ink">
                  Sign in
                </Link>{" "}
                to see every booking.
              </p>
            </Reveal>
          </div>
          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:col-start-8">
            <Reveal from="up" className="bg-sky-light p-6 sm:p-10">
              <p className="caps flex items-center gap-4">
                Look up a booking
                <span className="block h-px w-14 bg-ink/30" aria-hidden />
              </p>
              <h2 className="mt-5 text-3xl leading-[1.05] sm:text-4xl">Reference &amp; Email</h2>
              <div className="mt-8">
                <LookupForm bare />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
