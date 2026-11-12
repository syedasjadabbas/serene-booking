"use client";

import { CalendarX2, Headset, MailCheck, Wallet } from "lucide-react";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";

const PERKS = [
  { Icon: Wallet, title: "Pay at the property", text: "No card needed to reserve." },
  { Icon: CalendarX2, title: "Free cancellation", text: "On flexible rates, up to 48 hours before arrival." },
  { Icon: MailCheck, title: "Instant confirmation", text: "Your booking reference straight away." },
  { Icon: Headset, title: "24/7 front desk", text: "Concierge, room service and luggage storage." },
];

export default function HomeHighlights() {
  const { data: p } = usePropertyQuery();
  const stats = [
    { label: "Altitude", value: "7,906 ft" },
    { label: "Apartments", value: p ? String(p.stats.apartments) : "—" },
    { label: "Resort facilities", value: "50+" },
    { label: "From Islamabad", value: "2 hrs" },
  ];
  return (
    <section className="border-b border-zinc-200 bg-cream">
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_1.6fr] lg:items-center">
        <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-2">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-xs font-medium uppercase tracking-widest text-zinc-500">{s.label}</dt>
              <dd className="mt-1 font-display text-3xl font-light text-brand-700">{s.value}</dd>
            </div>
          ))}
        </dl>
        <ul className="grid gap-4 sm:grid-cols-2">
          {PERKS.map(({ Icon, title, text }) => (
            <li key={title} className="flex gap-3 rounded-2xl bg-white p-4 shadow-card">
              <Icon className="h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-zinc-900">{title}</p>
                <p className="text-sm text-zinc-500">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
