import { cn } from "@/global/lib/cn";

// Review score in the editorial style: a square ink badge with the score in the display serif, a small-caps
// verdict and the review count. Ratings are stored 1–5; shown out of 10.
const label = (s: number) => (s >= 9 ? "Superb" : s >= 8.5 ? "Excellent" : s >= 8 ? "Very good" : s >= 7 ? "Good" : s >= 6 ? "Pleasant" : "Review score");

export default function ReviewScore({ average, count, className, align = "left" }: { average: number | null; count: number; className?: string; align?: "left" | "right" }) {
  if (!count || average == null) {
    return (
      <div className={cn("flex items-center gap-3", align === "right" && "flex-row-reverse text-right", className)}>
        <span className="caps grid h-11 min-w-11 place-items-center border border-ink/25 px-2 text-[10px] text-ink">New</span>
        <span className="text-xs leading-tight text-ink/55">No reviews yet</span>
      </div>
    );
  }
  const score = Math.round(average * 2 * 10) / 10;
  return (
    <div className={cn("flex items-center gap-3", align === "right" && "flex-row-reverse text-right", className)}>
      <span className="grid h-11 min-w-11 place-items-center bg-ink px-2 font-display text-lg leading-none text-bone">{score.toFixed(1)}</span>
      <span className="leading-tight">
        <span className="caps block text-ink">{label(score)}</span>
        <span className="mt-1 block text-xs text-ink/55">{count} {count === 1 ? "review" : "reviews"}</span>
      </span>
    </div>
  );
}
