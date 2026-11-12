import type { AvailabilityResult, PlanQuote } from "@/global/api/types";

// Result filters live in the URL next to the stay params (shareable, refresh-safe, back-button friendly).
export type SortKey = "recommended" | "price_asc" | "price_desc" | "size_desc";
export type BudgetKey = "any" | "lt20" | "20to25" | "25to30" | "gt30";

export interface ResultFilters {
  sort: SortKey;
  meal: "any" | "breakfast";
  cancel: "any" | "free";
  outdoor: "any" | "balcony" | "terrace";
  minSize: 0 | 600 | 700 | 800;
  sleeps: 0 | 3 | 4;
  budget: BudgetKey;
  availableOnly: boolean;
}

export const DEFAULT_FILTERS: ResultFilters = { sort: "recommended", meal: "any", cancel: "any", outdoor: "any", minSize: 0, sleeps: 0, budget: "any", availableOnly: false };

type ParamsLike = { get(name: string): string | null };
const pick = <T extends string | number>(v: string | null, allowed: readonly T[], fallback: T): T =>
  (allowed.find((a) => String(a) === v) as T | undefined) ?? fallback;

export function parseFilters(p: ParamsLike): ResultFilters {
  return {
    sort: pick(p.get("sort"), ["recommended", "price_asc", "price_desc", "size_desc"] as const, "recommended"),
    meal: pick(p.get("meal"), ["any", "breakfast"] as const, "any"),
    cancel: pick(p.get("cancel"), ["any", "free"] as const, "any"),
    outdoor: pick(p.get("outdoor"), ["any", "balcony", "terrace"] as const, "any"),
    minSize: pick(p.get("size"), [0, 600, 700, 800] as const, 0),
    sleeps: pick(p.get("sleeps"), [0, 3, 4] as const, 0),
    budget: pick(p.get("budget"), ["any", "lt20", "20to25", "25to30", "gt30"] as const, "any"),
    availableOnly: p.get("available") === "1",
  };
}

export function filtersToParams(f: ResultFilters) {
  return {
    sort: f.sort === "recommended" ? undefined : f.sort,
    meal: f.meal === "any" ? undefined : f.meal,
    cancel: f.cancel === "any" ? undefined : f.cancel,
    outdoor: f.outdoor === "any" ? undefined : f.outdoor,
    size: f.minSize || undefined,
    sleeps: f.sleeps || undefined,
    budget: f.budget === "any" ? undefined : f.budget,
    available: f.availableOnly ? "1" : undefined,
  };
}

export const activeFilterCount = (f: ResultFilters) =>
  [f.meal !== "any", f.cancel !== "any", f.outdoor !== "any", f.minSize > 0, f.sleeps > 0, f.budget !== "any", f.availableOnly].filter(Boolean).length;

/** The rate shown for a result: cheapest plan that satisfies the meal / cancellation filters. */
export function quoteFor(r: AvailabilityResult, f: Pick<ResultFilters, "meal" | "cancel">): PlanQuote | null {
  const ok = r.quotes.filter((q) => (f.meal !== "breakfast" || q.ratePlan.breakfastIncluded) && (f.cancel !== "free" || q.ratePlan.refundable));
  return ok.reduce<PlanQuote | null>((min, q) => (!min || q.grandTotal < min.grandTotal ? q : min), null);
}

const BUDGETS: Record<Exclude<BudgetKey, "any">, [number, number]> = {
  lt20: [0, 20000],
  "20to25": [20000, 25000],
  "25to30": [25000, 30000],
  gt30: [30000, Infinity],
};
export const BUDGET_LABELS: Record<Exclude<BudgetKey, "any">, string> = {
  lt20: "Under Rs 20,000",
  "20to25": "Rs 20,000 – 25,000",
  "25to30": "Rs 25,000 – 30,000",
  gt30: "Rs 30,000 +",
};

export function matches(r: AvailabilityResult, f: ResultFilters) {
  const t = r.roomType;
  const q = quoteFor(r, f);
  if (!q) return false;
  if (f.availableOnly && (r.soldOut || !r.fitsParty)) return false;
  if (f.outdoor === "terrace" && !/terrace/i.test(t.outdoorSpace)) return false;
  if (f.outdoor === "balcony" && !/balcony/i.test(t.outdoorSpace)) return false;
  if (f.minSize && (t.maxAreaSqft ?? 0) < f.minSize) return false;
  if (f.sleeps && t.maxOccupancy < f.sleeps) return false;
  if (f.budget !== "any") {
    const [lo, hi] = BUDGETS[f.budget];
    if (q.avgNightlyPerRoom < lo || q.avgNightlyPerRoom >= hi) return false;
  }
  return true;
}

/** How many results an option would leave, given every other active filter (for sidebar counts). */
export const countWith = (results: AvailabilityResult[], f: ResultFilters, patch: Partial<ResultFilters>) =>
  results.filter((r) => matches(r, { ...f, ...patch })).length;

export function applyFilters(results: AvailabilityResult[], f: ResultFilters) {
  const out = results.filter((r) => matches(r, f));
  const price = (r: AvailabilityResult) => quoteFor(r, f)?.grandTotal ?? Number.MAX_SAFE_INTEGER;
  const unbookable = (r: AvailabilityResult) => Number(r.soldOut || !r.fitsParty);
  return [...out].sort((a, b) => {
    // Bookable results always come before sold-out / too-small ones.
    const u = unbookable(a) - unbookable(b);
    if (u) return u;
    if (f.sort === "price_asc") return price(a) - price(b);
    if (f.sort === "price_desc") return price(b) - price(a);
    if (f.sort === "size_desc") return (b.roomType.maxAreaSqft ?? 0) - (a.roomType.maxAreaSqft ?? 0);
    return a.roomType.sortOrder - b.roomType.sortOrder;
  });
}
