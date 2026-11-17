"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useReviewsQuery } from "@/global/api/endpoints/reviewsApi";
import { cn } from "@/global/lib/cn";
import { asset } from "@/global/lib/asset";
import { Parallax, Reveal, RevealWords } from "@/global/components/motion";

// Deep pine panel with a slow-drifting night photo. Shows real guest reviews as a carousel; until the first
// review is published it invites guests to plan a stay instead (no invented testimonials).
export default function HomeReviews() {
  const { data } = useReviewsQuery({ page: 1, pageSize: 6 });
  const [i, setI] = useState(0);
  const items = data?.items ?? [];
  const r = items[i];

  return (
    <section className="panel relative isolate mt-6 bg-pine text-white sm:mt-10">
      <Parallax speed={-0.08} className="absolute inset-x-0 -top-[10%] -z-10 h-[120%]">
        <Image src={asset("/images/resort/tower-snow-night.jpg")} alt="" fill sizes="100vw" className="object-cover opacity-25" />
      </Parallax>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-pine/70 via-pine/80 to-pine" />

      <div className="container-page relative py-20 text-center sm:py-28">
        <Reveal>
          <Quote className="mx-auto h-10 w-10 text-lime" strokeWidth={1} aria-hidden />
        </Reveal>
        {r ? (
          <>
            <Reveal>
              <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.35em] text-lime">What our guests say</p>
            </Reveal>
            <blockquote key={r.id} className="fade-up mx-auto mt-8 max-w-4xl">
              <p className="font-display text-2xl leading-snug text-white sm:text-4xl">&ldquo;{r.body}&rdquo;</p>
              <footer className="mt-8">
                <span className="inline-flex gap-1 text-lime" aria-label={`${r.rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("h-4 w-4", s <= r.rating ? "fill-current" : "opacity-30")} />
                  ))}
                </span>
                <p className="mt-3 font-display text-lg text-white">{r.author}</p>
                <p className="text-[11px] uppercase tracking-[0.25em] text-white/55">{r.roomType}</p>
              </footer>
            </blockquote>
            {items.length > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <button onClick={() => setI((i - 1 + items.length) % items.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/25 transition hover:border-lime hover:text-lime" aria-label="Previous review">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="flex gap-2">
                  {items.map((x, k) => (
                    <button key={x.id} onClick={() => setI(k)} aria-label={`Review by ${x.author}`} aria-current={k === i} className={cn("tap h-px transition-all duration-500", k === i ? "w-10 bg-lime" : "w-5 bg-white/35")} />
                  ))}
                </span>
                <button onClick={() => setI((i + 1) % items.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/25 transition hover:border-lime hover:text-lime" aria-label="Next review">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="mx-auto mt-6 max-w-3xl text-[2.1rem] leading-[1.12] text-white sm:text-5xl">
              <RevealWords text="Your Mountain Home Is Waiting" />
            </h2>
            <Reveal delay={200}>
              <p className="mx-auto mt-6 max-w-2xl font-display text-xl leading-snug text-white/80 sm:text-2xl">
                Snow in winter, cool pine air in summer, and a heated infinity pool all year round. Be among our first guests at 7,906 ft.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link href="/rooms" className="btn-gold">Check availability</Link>
                <Link href="/amenities" className="btn-outline-light">Explore amenities</Link>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </section>
  );
}
