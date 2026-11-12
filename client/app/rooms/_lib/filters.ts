import type { AvailabilityResult } from "@/global/api/types";

// Result filters live in the URL next to the stay params.
export type SortKey = "recommended" | "price_asc" | "price_desc" | "size_desc";
export type OutdoorKey = "any" | "balcony" | "terrace";

export interface ResultFilters {
  sort: SortKey;
  outdoor: OutdoorKey;
  availableOnly: boolean;
}

type ParamsLike = { get(name: string): string | null };

const SORTS: SortKey[] = ["recommended", "price_asc", "price_desc", "size_desc"];
const OUTDOORS: OutdoorKey[] = ["any", "balcony", "terrace"];

export function parseFilters(p: ParamsLike): ResultFilters {
  const sort = p.get("sort") as SortKey;
  const outdoor = p.get("outdoor") as OutdoorKey;
  return {
    sort: SORTS.includes(sort) ? sort : "recommended",
    outdoor: OUTDOORS.includes(outdoor) ? outdoor : "any",
    availableOnly: p.get("available") === "1",
  };
}

export function filtersToParams(f: ResultFilters) {
  return {
    sort: f.sort === "recommended" ? undefined : f.sort,
    outdoor: f.outdoor === "any" ? undefined : f.outdoor,
    available: f.availableOnly ? "1" : undefined,
  };
}

export function applyFilters(results: AvailabilityResult[], f: ResultFilters) {
  let out = results.filter((r) => {
    if (f.availableOnly && (r.soldOut || !r.fitsParty)) return false;
    if (f.outdoor === "terrace" && !r.roomType.outdoorSpace.toLowerCase().includes("terrace")) return false;
    if (f.outdoor === "balcony" && !r.roomType.outdoorSpace.toLowerCase().includes("balcony")) return false;
    return true;
  });
  const price = (r: AvailabilityResult) => r.lowestQuote?.grandTotal ?? Number.MAX_SAFE_INTEGER;
  if (f.sort === "price_asc") out = [...out].sort((a, b) => price(a) - price(b));
  if (f.sort === "price_desc") out = [...out].sort((a, b) => price(b) - price(a));
  if (f.sort === "size_desc") out = [...out].sort((a, b) => (b.roomType.maxAreaSqft ?? 0) - (a.roomType.maxAreaSqft ?? 0));
  // Recommended: bookable first, then the admin's sort order.
  if (f.sort === "recommended") {
    out = [...out].sort((a, b) => Number(a.soldOut || !a.fitsParty) - Number(b.soldOut || !b.fitsParty) || a.roomType.sortOrder - b.roomType.sortOrder);
  }
  return out;
}
