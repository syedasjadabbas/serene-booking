"use client";

import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import SearchBar from "@/global/components/SearchBar";
import { Reveal, RevealWords } from "@/global/components/motion";

// Closing call to action on the pale sky: a statement, the search bar and the phone line.
export default function EraCta() {
  const { data: p } = usePropertyQuery();
  const phone = p?.contact.phone ?? "042-111-111-744";
  return (
    <section className="bg-sky py-28 sm:py-36">
      <div className="container-page">
        <Reveal>
          <p className="caps">Book your stay</p>
        </Reveal>
        <h2 className="mt-8 max-w-6xl text-[2.1rem] leading-[1.05] sm:text-5xl lg:text-[4.2rem]">
          <RevealWords text="Pick your dates and see what is free — or call us, and we will help you choose the right apartment" />
        </h2>
        <Reveal delay={200} className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end [&>*]:min-w-0">
          <div className="lg:col-span-8">
            <SearchBar variant="bar" submitLabel="Search" />
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <p className="caps text-ink/60">Reservations</p>
            <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="link-serif mt-2 inline-block text-2xl sm:text-3xl lg:text-4xl">
              {phone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
