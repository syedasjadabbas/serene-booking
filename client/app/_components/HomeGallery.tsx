import Image from "next/image";
import Link from "next/link";
import { Reveal, RevealWords, ScrollDrift } from "@/global/components/motion";
import { asset } from "@/global/lib/asset";
import { cn } from "@/global/lib/cn";

type Shot = { src: string; alt: string; wide?: boolean };

const ROW_A: Shot[] = [
  { src: "/images/interiors/living-room-wide.jpg", alt: "Living room with sofa and dining area", wide: true },
  { src: "/images/interiors/bedroom-morning.jpg", alt: "Bedroom in the morning light" },
  { src: "/images/resort/rooftop-sunset.jpg", alt: "Rooftop terraces at sunset", wide: true },
  { src: "/images/interiors/dining-nook-arch.jpg", alt: "Dining nook under an arched window" },
  { src: "/images/interiors/kitchenette-evening.jpg", alt: "Kitchenette in the evening", wide: true },
  { src: "/images/interiors/window-view.jpg", alt: "View of the pines from an apartment window" },
];
const ROW_B: Shot[] = [
  { src: "/images/interiors/sunrise-balcony.jpg", alt: "Sunrise through the balcony doors" },
  { src: "/images/resort/aerial-snow-resort.jpg", alt: "The resort under snow", wide: true },
  { src: "/images/interiors/decor-dining-detail.jpg", alt: "Table set for dinner" },
  { src: "/images/dining/sky-lounge.jpg", alt: "The sky lounge", wide: true },
  { src: "/images/interiors/bedside-evening.jpg", alt: "Bedside lamp in the evening" },
  { src: "/images/resort/tower-sunset-forest.jpg", alt: "The tower above the forest at sunset", wide: true },
];

function Row({ shots, speed }: { shots: Shot[]; speed: number }) {
  return (
    <ScrollDrift speed={speed} className="flex w-max gap-3 sm:gap-5">
      {/* Shown twice so the strip always overfills wide screens while it drifts. */}
      {[...shots, ...shots].map((s, i) => (
        <div key={i} aria-hidden={i >= shots.length} className={cn("group relative h-[190px] shrink-0 overflow-hidden rounded-[6px] bg-sand sm:h-[280px]", s.wide ? "w-[300px] sm:w-[440px]" : "w-[150px] sm:w-[220px]")}>
          <Image src={asset(s.src)} alt={i >= shots.length ? "" : s.alt} fill sizes="(min-width: 640px) 440px, 300px" className="object-cover transition duration-[1400ms] ease-out group-hover:scale-[1.08]" />
        </div>
      ))}
    </ScrollDrift>
  );
}

// "Life at Serene Heights": two strips of photos that slide in opposite directions as the page scrolls.
export default function HomeGallery() {
  return (
    <section className="overflow-hidden py-24 sm:py-32">
      <div className="container-page flex flex-wrap items-end justify-between gap-6">
        <div>
          <Reveal>
            <p className="eyebrow">Gallery</p>
          </Reveal>
          <h2 className="mt-5 text-[2.1rem] leading-[1.12] sm:text-5xl">
            <RevealWords text="Life at Serene Heights" />
          </h2>
        </div>
        <Reveal delay={150}>
          <Link href="/amenities" className="btn-secondary">
            See the resort
          </Link>
        </Reveal>
      </div>
      <div className="mt-14 space-y-3 sm:space-y-5">
        <div className="-ml-40">
          <Row shots={ROW_A} speed={0.25} />
        </div>
        <div className="-ml-[28rem]">
          <Row shots={ROW_B} speed={-0.25} />
        </div>
      </div>
    </section>
  );
}
