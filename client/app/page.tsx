import Image from "next/image";
import SearchBar from "@/global/components/SearchBar";
import HomeHighlights from "./_components/HomeHighlights";
import HomeApartments from "./_components/HomeApartments";
import HomeExperiences from "./_components/HomeExperiences";
import HomeReviews from "./_components/HomeReviews";
import HomeLocation from "./_components/HomeLocation";

export default function HomePage() {
  return (
    <>
      <section className="relative isolate">
        <Image src="/images/hero/hero-exterior.png" alt="Serene Heights Nathia Gali among the pines" fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-900/70 via-brand-900/40 to-brand-900/80" />
        <div className="container-page pb-16 pt-24 sm:pb-24 sm:pt-32">
          <p className="eyebrow text-gold-light">Nathia Gali · 7,906 ft</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-light leading-tight text-white sm:text-6xl">A haven in the highlands</h1>
          <p className="mt-4 max-w-xl text-base text-cream/90 sm:text-lg">
            Fully furnished hotel apartments at Pakistan&apos;s first winter resort. Book in minutes and pay at the property.
          </p>
          <div className="mt-10 max-w-4xl">
            <SearchBar variant="hero" submitLabel="Check availability" />
          </div>
        </div>
      </section>
      <HomeHighlights />
      <HomeApartments />
      <HomeExperiences />
      <HomeReviews />
      <HomeLocation />
    </>
  );
}
