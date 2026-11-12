"use client";

import { useReviewsQuery } from "@/global/api/endpoints/reviewsApi";
import { Stars } from "@/global/components/ui";
import { fmtDate } from "@/global/lib/format";

// Only real guest reviews are shown; the section stays hidden until the first one is published.
export default function HomeReviews() {
  const { data } = useReviewsQuery({ page: 1, pageSize: 3 });
  if (!data || data.summary.total === 0) return null;
  return (
    <section className="container-page py-16 sm:py-20">
      <p className="eyebrow">Guest reviews</p>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        <h2 className="section-title">{data.summary.average?.toFixed(1)} out of 5</h2>
        <Stars rating={data.summary.average ?? 0} />
        <span className="text-sm text-zinc-500">from {data.summary.total} verified stays</span>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {data.items.map((r) => (
          <figure key={r.id} className="card p-6">
            <Stars rating={r.rating} />
            <blockquote className="mt-3">
              <p className="font-medium text-zinc-900">{r.title}</p>
              <p className="mt-2 line-clamp-5 text-sm text-zinc-600">{r.body}</p>
            </blockquote>
            <figcaption className="mt-4 text-xs text-zinc-500">
              {r.author}
              {r.country ? `, ${r.country}` : ""} · {r.roomType} · {fmtDate(`${r.stayedMonth}-01`, "MMM yyyy")}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
