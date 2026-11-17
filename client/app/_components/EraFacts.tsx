"use client";

import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { Reveal, RevealWords } from "@/global/components/motion";

// Facts set as a stack of huge capitals, each with a small label and a diamond mark.
export default function EraFacts() {
  const { data: p } = usePropertyQuery();
  const facts = [
    { label: "Altitude", value: "7,906 ft" },
    { label: "Apartments", value: `${p?.stats.apartments ?? 130} residences` },
    { label: "On site", value: "50+ facilities" },
    { label: "From Islamabad", value: "Two hours" },
    { label: "Developer", value: p?.developer ?? "DM Consortium" },
  ];

  return (
    <section className="bg-bone py-28 sm:py-40">
      <div className="container-page flex flex-col items-center text-center">
        <Reveal>
          <p className="caps max-w-[15rem] leading-relaxed">Pakistan&apos;s first winter resort — open all year</p>
        </Reveal>
        <span className="rule-v mt-6" aria-hidden />
        <ul className="mt-16 space-y-6 sm:space-y-4">
          {facts.map((f, i) => (
            <li key={f.label}>
              <p className="caps text-ink/55">{f.label}</p>
              <p className="mt-1 font-display text-[2.8rem] uppercase leading-[0.95] text-ink sm:text-7xl lg:text-[6rem]">
                <RevealWords text={f.value} delay={i * 60} />
                <span className="ml-3 inline-block h-[0.12em] w-[0.12em] -translate-y-[0.9em] rotate-45 bg-ink align-baseline" aria-hidden />
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
