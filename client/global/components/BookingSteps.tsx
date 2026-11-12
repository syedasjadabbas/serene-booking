import { Check } from "lucide-react";
import { cn } from "@/global/lib/cn";

const STEPS = ["Your selection", "Your details", "Booking confirmed"];

// Booking.com-style progress indicator for the booking funnel. `current` is 1-based.
export default function BookingSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="Booking progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current || current === 3;
        const active = n === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2" aria-current={active ? "step" : undefined}>
            <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold", done ? "bg-lime text-ink" : active ? "bg-ink text-white" : "border border-zinc-300 text-zinc-500")}>
              {done ? <Check className="h-4 w-4" /> : n}
            </span>
            <span className={cn("hidden whitespace-nowrap font-semibold sm:inline", active || done ? "text-ink" : "text-zinc-400")}>{label}</span>
            {n < STEPS.length && <span className={cn("h-px flex-1", done ? "bg-lime-dark" : "bg-zinc-200")} />}
          </li>
        );
      })}
    </ol>
  );
}
