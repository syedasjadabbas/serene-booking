import { Check } from "lucide-react";
import { cn } from "@/global/lib/cn";

const STEPS = ["Your selection", "Your details", "Booking confirmed"];

// Progress for the booking funnel in the editorial style: numbered steps in the display serif, small-caps
// labels and hairlines. `current` is 1-based.
export default function BookingSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-3" aria-label="Booking progress">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current || current === 3;
        const active = n === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-3" aria-current={active ? "step" : undefined}>
            <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-sm", done ? "bg-ink text-bone" : active ? "border border-ink text-ink" : "border border-ink/20 text-ink/40")}>
              {done ? <Check className="h-4 w-4" /> : `0${n}`}
            </span>
            <span className={cn("caps hidden whitespace-nowrap sm:inline", active || done ? "text-ink" : "text-ink/40")}>{label}</span>
            {n < STEPS.length && <span className={cn("h-px flex-1", done ? "bg-ink" : "bg-ink/15")} />}
          </li>
        );
      })}
    </ol>
  );
}
