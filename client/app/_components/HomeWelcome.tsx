"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { Parallax, Reveal, RevealWords } from "@/global/components/motion";
import { asset } from "@/global/lib/asset";

// Welcome: a centred statement between two arch-framed photos that drift at different speeds as you scroll,
// over faint editorial guide lines.
export default function HomeWelcome() {
  const { data: p } = usePropertyQuery();
  const rating = p?.stats.averageRating;
  const reviews = p?.stats.reviewCount ?? 0;

  return (
    <section className="guides overflow-hidden py-24 sm:py-32">
      <div className="container-page grid items-center gap-12 lg:grid-cols-[1fr_1.35fr_1fr] lg:gap-10">
        <Parallax speed={0.08} className="mx-auto hidden w-full max-w-[300px] lg:block">
          <Reveal from="clip" className="arch relative aspect-[3/4.2] bg-sand shadow-pop" >
            <Image src={asset("/images/interiors/living-room-sofa.jpg")} alt="Apartment living room with a sofa by the window" fill sizes="300px" className="object-cover" />
          </Reveal>
        </Parallax>

        <div className="text-center">
          <Reveal>
            <p className="eyebrow">Welcome to Serene Heights</p>
            <span className="ornament mt-4" aria-hidden>
              <span className="h-1.5 w-1.5 rotate-45 bg-current" />
            </span>
          </Reveal>
          <h2 className="mt-6 text-[2.1rem] leading-[1.15] sm:text-5xl lg:text-[3.4rem]">
            <RevealWords text="Quiet Luxury in the Pines, Two Hours from Islamabad" />
          </h2>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-md text-[15px] font-light leading-relaxed text-zinc-600">
              Fully furnished one-bedroom hotel apartments at 7,906 ft, each with its own balcony or terrace, serviced daily and
              warmed by heated floors.
            </p>
            {rating ? (
              <div className="mt-8">
                <p className="font-display text-2xl text-ink">{rating.toFixed(1)} out of 5</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-gold" aria-hidden>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={s <= Math.round(rating) ? "h-4 w-4 fill-current" : "h-4 w-4"} />
                  ))}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">Based on {reviews} guest reviews</p>
              </div>
            ) : (
              <Link href="/rooms" className="btn-secondary mt-8">
                Discover the apartments
              </Link>
            )}
          </Reveal>
        </div>

        <Parallax speed={-0.06} className="mx-auto hidden w-full max-w-[300px] lg:block">
          <Reveal from="clip" delay={150} className="arch relative aspect-[3/4.2] bg-sand shadow-pop">
            <Image src={asset("/images/dining/rooftop-restaurant.jpg")} alt="The rooftop restaurant with glass walls" fill sizes="300px" className="object-cover" />
          </Reveal>
        </Parallax>

        {/* Phones and tablets: the two arches side by side under the text */}
        <div className="grid grid-cols-2 gap-4 lg:hidden">
          <Reveal from="clip" className="arch relative aspect-[3/4] bg-sand">
            <Image src={asset("/images/interiors/living-room-sofa.jpg")} alt="" fill sizes="50vw" className="object-cover" />
          </Reveal>
          <Reveal from="clip" delay={150} className="arch relative mt-10 aspect-[3/4] bg-sand">
            <Image src={asset("/images/dining/rooftop-restaurant.jpg")} alt="" fill sizes="50vw" className="object-cover" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
