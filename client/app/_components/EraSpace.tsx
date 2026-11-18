import Image from "next/image";
import { Parallax, Reveal, RevealWords } from "@/global/components/motion";
import { asset } from "@/global/lib/asset";

const FEATURES = ["Heated floors throughout", "A private balcony or terrace", "Fitted kitchenette", "Daily housekeeping & laundry", "High-speed Wi-Fi", "24/7 power backup"];

// "The space to live in": a deep pine block holding a photo, the headline with a script accent, a ruled list
// of what every apartment has, then a wide interior photo that drifts as you scroll.
export default function EraSpace() {
  return (
    <section className="relative overflow-hidden bg-bone pb-28 pt-28 sm:pb-40 sm:pt-36">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:items-center">
        <div className="relative lg:col-span-6">
          <div className="absolute -left-[50vw] -top-12 bottom-24 right-[18%] bg-pine" aria-hidden />
          <Parallax speed={0.06} className="relative pt-0 lg:pr-[12%]">
            <Reveal from="clip" className="relative aspect-[4/3.3] overflow-hidden">
              <Image src={asset("/images/interiors/bedroom-arch-window.jpg")} alt="Apartment bedroom with an arched window over the pines" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </Reveal>
          </Parallax>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <h2 className="text-[2.6rem] leading-[0.95] sm:text-6xl lg:text-[5rem]">
            <RevealWords text="The space to" />
          </h2>
          <Reveal delay={200}>
            <p className="mt-1 font-display text-[2.6rem] leading-[0.95] text-gold sm:text-6xl lg:text-[5rem]">live in</p>
          </Reveal>
          <Reveal delay={250}>
            <ul className="mt-10 divide-y divide-ink/15 border-y border-ink/15">
              {FEATURES.map((f) => (
                <li key={f} className="caps flex items-center gap-3 py-3.5">
                  <span className="h-1 w-1 rounded-full bg-ink" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      <div className="container-page mt-24 sm:mt-36">
        <div className="ml-auto lg:w-[78%]">
          <Reveal from="clip" className="relative aspect-[16/8] overflow-hidden">
            <Parallax speed={-0.08} className="absolute inset-x-0 -top-[12%] h-[124%]">
              <Image src={asset("/images/interiors/living-kitchen-evening.jpg")} alt="Open living room and kitchen in the evening" fill sizes="(min-width: 1024px) 70vw, 100vw" className="object-cover" />
            </Parallax>
          </Reveal>
          <p className="caps mt-4 text-ink/60">Living room and kitchenette, one-bedroom apartment</p>
        </div>
      </div>
    </section>
  );
}
