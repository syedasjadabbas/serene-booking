import Image from "next/image";
import SearchBar from "@/global/components/SearchBar";
import HomeApartments from "./_components/HomeApartments";
import HomeUnique from "./_components/HomeUnique";
import HomeFeature from "./_components/HomeFeature";
import HomeReviews from "./_components/HomeReviews";
import HomeLocation from "./_components/HomeLocation";

export default function HomePage() {
  return (
    <>
      {/* Hero: inset rounded card with the header floating inside it */}
      <section className="panel relative isolate mt-2 sm:mt-3">
        <Image src="/images/resort/hero-tower-mist.jpg" alt="Serene Heights tower rising above the pines and mist" fill priority sizes="100vw" className="-z-10 object-cover object-[50%_35%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/65 via-ink/30 to-ink/60" />
        <div className="flex min-h-[640px] flex-col items-center justify-center px-4 pb-14 pt-32 text-center sm:min-h-[700px]">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 py-1.5 pl-1.5 pr-4 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur">
            <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold text-ink">7,906 ft</span>
            Pakistan&apos;s first winter resort<span className="hidden sm:inline"> · Nathia Gali</span>
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.1] text-white sm:text-6xl">
            Unwind in the Pines,
            <br />
            Stay Above the Clouds.
          </h1>
          <p className="mt-4 max-w-xl text-sm text-white/85 sm:text-base">Fully furnished hotel apartments with a heated infinity pool and rooftop dining. Book in minutes, pay at the property.</p>
          <div className="mt-10 w-full max-w-4xl text-left">
            <SearchBar variant="hero" submitLabel="Search" />
          </div>
        </div>
      </section>

      <HomeApartments />
      <HomeUnique />
      <HomeFeature />
      <HomeReviews />
      <HomeLocation />
    </>
  );
}
