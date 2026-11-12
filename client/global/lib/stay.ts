import { addDays, format, isValid, parseISO } from "date-fns";
import type { Stay } from "@/global/api/types";

// The stay lives in the URL (?checkIn&checkOut&adults&children&rooms) so searches are
// shareable, refresh-safe and back-button friendly. The same object feeds the API.

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const toIso = (d: Date) => format(d, "yyyy-MM-dd");
const clampInt = (v: string | null, min: number, max: number, fallback: number) => {
  const n = Number.parseInt(v ?? "", 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
};

export const todayIso = () => toIso(new Date());

export const defaultStay = (): Stay => {
  const start = addDays(new Date(), 1);
  return { checkIn: toIso(start), checkOut: toIso(addDays(start, 2)), adults: 2, children: 0, rooms: 1 };
};

type ParamsLike = { get(name: string): string | null };

/** Returns a full stay if the URL has valid dates, otherwise null (the page then asks for dates). */
export function parseStay(params: ParamsLike): Stay | null {
  const checkIn = params.get("checkIn");
  const checkOut = params.get("checkOut");
  if (!checkIn || !checkOut || !ISO.test(checkIn) || !ISO.test(checkOut)) return null;
  if (!isValid(parseISO(checkIn)) || !isValid(parseISO(checkOut)) || checkOut <= checkIn) return null;
  const rooms = clampInt(params.get("rooms"), 1, 5, 1);
  return {
    checkIn,
    checkOut,
    rooms,
    adults: Math.max(clampInt(params.get("adults"), 1, 20, 2), rooms),
    children: clampInt(params.get("children"), 0, 20, 0),
  };
}

export function stayToQuery(stay: Stay, extra: Record<string, string | number | undefined | null> = {}) {
  const q = new URLSearchParams({
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    adults: String(stay.adults),
    children: String(stay.children),
    rooms: String(stay.rooms),
  });
  for (const [k, v] of Object.entries(extra)) if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  return q.toString();
}

export const isPastStay = (stay: Stay) => stay.checkIn < todayIso();
