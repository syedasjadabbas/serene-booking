"use client";

import type { AvailabilityResult } from "@/global/api/types";
import { BUDGET_LABELS, countWith, DEFAULT_FILTERS, activeFilterCount, type BudgetKey, type ResultFilters } from "../_lib/filters";
import { cn } from "@/global/lib/cn";

type Option = { label: string; patch: Partial<ResultFilters>; active: boolean; off: Partial<ResultFilters> };

export default function FilterSidebar({ results, filters, onChange }: { results: AvailabilityResult[]; filters: ResultFilters; onChange: (f: ResultFilters) => void }) {
  const f = filters;
  const opt = (label: string, patch: Partial<ResultFilters>, off: Partial<ResultFilters>): Option => ({
    label,
    patch,
    off,
    active: Object.entries(patch).every(([k, v]) => f[k as keyof ResultFilters] === v),
  });

  const groups: { title: string; options: Option[] }[] = [
    {
      title: "Popular filters",
      options: [
        opt("Free cancellation", { cancel: "free" }, { cancel: "any" }),
        opt("Breakfast included", { meal: "breakfast" }, { meal: "any" }),
        opt("Private terrace", { outdoor: "terrace" }, { outdoor: "any" }),
        opt("Available for my dates", { availableOnly: true }, { availableOnly: false }),
      ],
    },
    {
      title: "Your budget (per night)",
      options: (Object.keys(BUDGET_LABELS) as Exclude<BudgetKey, "any">[]).map((k) => opt(BUDGET_LABELS[k], { budget: k }, { budget: "any" })),
    },
    {
      title: "Outdoor space",
      options: [opt("Private balcony", { outdoor: "balcony" }, { outdoor: "any" }), opt("Private terrace", { outdoor: "terrace" }, { outdoor: "any" })],
    },
    {
      title: "Apartment size",
      options: [
        opt("600 sq ft +", { minSize: 600 }, { minSize: 0 }),
        opt("700 sq ft +", { minSize: 700 }, { minSize: 0 }),
        opt("800 sq ft +", { minSize: 800 }, { minSize: 0 }),
      ],
    },
    {
      title: "Sleeps",
      options: [opt("3 guests +", { sleeps: 3 }, { sleeps: 0 }), opt("4 guests +", { sleeps: 4 }, { sleeps: 0 })],
    },
  ];

  return (
    <div className="divide-y divide-ink/10 border border-ink/10 bg-white">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="caps text-ink">Filter by</h2>
        {activeFilterCount(f) > 0 && (
          <button className="caps tap text-ink/60 underline decoration-ink/30 underline-offset-4 transition hover:text-ink hover:decoration-ink" onClick={() => onChange({ ...DEFAULT_FILTERS, sort: f.sort })}>
            Clear all
          </button>
        )}
      </div>
      {groups.map((g) => (
        <fieldset key={g.title} className="px-5 py-5">
          <legend className="sr-only">{g.title}</legend>
          <p className="mb-3 font-display text-lg leading-tight text-ink">{g.title}</p>
          <ul className="space-y-2.5">
            {g.options.map((o) => {
              const count = countWith(results, f, o.patch);
              const disabled = !o.active && count === 0;
              return (
                <li key={o.label}>
                  <label className={cn("flex cursor-pointer items-center gap-3 text-sm text-ink/80 transition hover:text-ink", disabled && "cursor-default text-ink/30 hover:text-ink/30")}>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded-none accent-ink"
                      checked={o.active}
                      disabled={disabled}
                      onChange={() => onChange({ ...f, ...(o.active ? o.off : o.patch) })}
                    />
                    <span className="flex-1">{o.label}</span>
                    <span className="font-display text-sm tabular-nums text-ink/40">{count}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}
    </div>
  );
}
