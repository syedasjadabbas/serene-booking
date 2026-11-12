import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Mail, Printer, Ticket } from "lucide-react";
import PageHero from "@/global/components/PageHero";
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
        title="Find Your Booking"
        subtitle="No account needed. Use your booking reference and email."
        crumbs={[{ label: "Find booking" }]}
      />
      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_440px] lg:items-start">
        <div>
          <Reveal>
            <h2 className="section-title">How it works</h2>
          </Reveal>
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2" step={90} itemClassName="h-full">
            {STEPS.map(({ Icon, title, text }, i) => (
              <div key={title} className="h-full rounded-3xl bg-mist p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-ink shadow-card"><Icon className="h-5 w-5" /></span>
                  <span className="text-xs font-bold text-zinc-400">0{i + 1}</span>
                </div>
                <p className="mt-4 font-bold text-ink">{title}</p>
                <p className="mt-1 text-sm text-zinc-600">{text}</p>
              </div>
            ))}
          </Stagger>
          <Reveal delay={200}>
            <p className="mt-8 text-sm text-zinc-500">
              Booked with an account? <Link href="/login?next=/account" className="font-semibold text-brand-700 underline">Sign in</Link> to see every booking.
            </p>
          </Reveal>
        </div>
        <Reveal from="right" className="lg:sticky lg:top-24">
          <LookupForm />
        </Reveal>
      </section>
    </div>
  );
}
