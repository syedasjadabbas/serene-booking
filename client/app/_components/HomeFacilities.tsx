import Image from "next/image";
import Link from "next/link";
import { ConciergeBell, Flag, MountainSnow, Target, UtensilsCrossed, Waves, type LucideIcon } from "lucide-react";
import { Reveal, RevealWords, Stagger } from "@/global/components/motion";
import { asset } from "@/global/lib/asset";

const FACILITIES: { Icon: LucideIcon; title: string; text: string; image: string }[] = [
  { Icon: Waves, title: "Heated Infinity Pool", text: "Heated year-round under a glass roof, with lifeguard service and towels.", image: "/images/resort/glass-roof-pool.jpg" },
  { Icon: UtensilsCrossed, title: "Rooftop Restaurant", text: "Breakfast, lunch and dinner at 7,906 ft, plus room service to your door.", image: "/images/dining/rooftop-dining-glass.jpg" },
  { Icon: MountainSnow, title: "Snow Slope", text: "Pakistan's first winter resort, with snow play right beside the tower.", image: "/images/activities/ski-slope.jpg" },
  { Icon: Flag, title: "18-Hole Mini Golf", text: "A landscaped course among the pines for an easy afternoon together.", image: "/images/activities/mini-golf.jpg" },
  { Icon: Target, title: "Archery & Adventure", text: "Archery, zipline, rock climbing and an air gun range for the bold.", image: "/images/activities/archery.jpg" },
  { Icon: ConciergeBell, title: "24/7 Concierge", text: "Express check-in and check-out, luggage storage and daily housekeeping.", image: "/images/interiors/housekeeping.jpg" },
];

// Facilities as an editorial grid with hairline dividers. Hovering a cell (or focusing it) fades its
// photo in behind the text, so the grid comes alive under the pointer.
export default function HomeFacilities() {
  return (
    <section className="container-page py-24 sm:py-32">
      <div className="text-center">
        <Reveal>
          <p className="eyebrow">Facilities</p>
          <span className="ornament mt-4" aria-hidden>
            <span className="h-1.5 w-1.5 rotate-45 bg-current" />
          </span>
        </Reveal>
        <h2 className="mx-auto mt-6 max-w-3xl text-[2.1rem] leading-[1.12] sm:text-5xl">
          <RevealWords text="Everything You Need, a Short Walk Away" />
        </h2>
      </div>

      <Stagger className="mt-14 grid gap-px overflow-hidden rounded-[6px] border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3" step={80} itemClassName="h-full">
        {FACILITIES.map(({ Icon, title, text, image }) => (
          <Link key={title} href="/amenities" className="group relative isolate flex h-full min-h-[300px] flex-col justify-end overflow-hidden bg-ivory p-8 sm:p-10" data-cursor="Explore">
            <Image
              src={asset(image)}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="-z-10 scale-110 object-cover opacity-0 transition duration-[900ms] ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
            />
            <span className="absolute inset-0 -z-10 bg-ink/60 opacity-0 transition duration-700 group-hover:opacity-100 group-focus-visible:opacity-100" />
            <span className="mb-auto grid h-14 w-14 place-items-center rounded-full border border-gold/50 text-gold transition duration-500 group-hover:border-lime group-hover:text-lime">
              <Icon className="h-6 w-6" strokeWidth={1.3} />
            </span>
            <h3 className="mt-10 text-2xl transition duration-500 group-hover:text-white">{title}</h3>
            <p className="mt-3 max-w-xs text-sm font-light leading-relaxed text-zinc-600 transition duration-500 group-hover:text-white/85">{text}</p>
          </Link>
        ))}
      </Stagger>
    </section>
  );
}
