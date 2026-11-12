import { cn } from "@/global/lib/cn";

// Booking.com-style score badge. Ratings are stored 1–5; shown out of 10.
const label = (s: number) => (s >= 9 ? "Superb" : s >= 8.5 ? "Excellent" : s >= 8 ? "Very good" : s >= 7 ? "Good" : s >= 6 ? "Pleasant" : "Review score");

export default function ReviewScore({ average, count, className, align = "left" }: { average: number | null; count: number; className?: string; align?: "left" | "right" }) {
  if (!count || average == null) {
    return (
      <div className={cn("flex items-center gap-2", align === "right" && "flex-row-reverse text-right", className)}>
        <span className="grid h-8 min-w-8 place-items-center rounded-md rounded-bl-none bg-gold px-1.5 text-xs font-bold text-white">New</span>
        <span className="text-xs leading-tight text-zinc-500">No reviews yet</span>
      </div>
    );
  }
  const score = Math.round(average * 2 * 10) / 10;
  return (
    <div className={cn("flex items-center gap-2", align === "right" && "flex-row-reverse text-right", className)}>
      <span className="grid h-8 min-w-8 place-items-center rounded-md rounded-bl-none bg-brand-700 px-1.5 text-sm font-bold text-white">{score.toFixed(1)}</span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-zinc-900">{label(score)}</span>
        <span className="block text-xs text-zinc-500">{count} {count === 1 ? "review" : "reviews"}</span>
      </span>
    </div>
  );
}
