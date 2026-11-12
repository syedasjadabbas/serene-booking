"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useReviewsQuery } from "@/global/api/endpoints/reviewsApi";
import { cn } from "@/global/lib/cn";

// Lime band from the reference design. Shows real guest reviews as a carousel; until the first review
// is published it invites guests to plan a stay instead (no invented testimonials).
export default function HomeReviews() {
  const { data } = useReviewsQuery({ page: 1, pageSize: 6 });
  const [i, setI] = useState(0);
  const items = data?.items ?? [];
  const r = items[i];

  return (
    <section className="panel relative mt-6 bg-lime sm:mt-8">
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-30" viewBox="0 0 800 400" preserveAspectRatio="none">
        <path d="M0 300 C 200 200, 300 380, 520 260 S 760 120, 800 160" fill="none" stroke="#16211f" strokeWidth="1" />
        <path d="M0 120 C 180 60, 340 200, 560 90 S 740 40, 800 70" fill="none" stroke="#16211f" strokeWidth="1" />
      </svg>
      <div className="container-page relative py-16 text-center sm:py-20">
        {r ? (
          <>
            <h2 className="section-title">What Our Guests Say</h2>
            <p className="section-sub text-ink/70">Verified reviews from guests who stayed with us.</p>
            <blockquote className="mx-auto mt-8 max-w-3xl">
              <p className="text-xl font-semibold leading-snug text-ink sm:text-2xl">&ldquo;{r.body}&rdquo;</p>
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-3">
              <button onClick={() => setI((i - 1 + items.length) % items.length)} className="grid h-9 w-9 place-items-center rounded-full border border-ink/30 hover:bg-ink/10" aria-label="Previous review">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {items.map((x, k) => (
                <button key={x.id} onClick={() => setI(k)} aria-label={`Review by ${x.author}`} className={cn("grid place-items-center rounded-full bg-ink font-bold text-lime transition", k === i ? "h-12 w-12 text-base ring-4 ring-white" : "h-9 w-9 text-xs opacity-70")}>
                  {x.author.charAt(0)}
                </button>
              ))}
              <button onClick={() => setI((i + 1) % items.length)} className="grid h-9 w-9 place-items-center rounded-full border border-ink/30 hover:bg-ink/10" aria-label="Next review">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 font-bold text-ink">{r.author}</p>
            <p className="text-xs text-ink/70">{r.roomType}</p>
            <span className="mt-1 inline-flex gap-0.5" aria-label={`${r.rating} out of 5`}>
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={cn("h-4 w-4", s <= r.rating ? "fill-ink text-ink" : "text-ink/30")} />)}
            </span>
          </>
        ) : (
          <>
            <h2 className="section-title">Your Mountain Home Is Waiting</h2>
            <p className="mx-auto mt-6 max-w-2xl text-xl font-semibold leading-snug text-ink sm:text-2xl">
              Snow in winter, cool pine air in summer, and a heated infinity pool all year round. Be among our first guests at 7,906 ft.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/rooms" className="btn-dark px-7 py-3">Check availability</Link>
              <Link href="/amenities" className="btn border border-ink/30 px-7 py-3 text-ink hover:bg-ink/10">Explore amenities</Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
