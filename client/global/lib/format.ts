import { format, parseISO, differenceInCalendarDays } from "date-fns";

export const money = (amount: number, currency = "PKR") =>
  `${currency === "PKR" ? "Rs" : currency} ${Math.round(amount).toLocaleString("en-PK")}`; // nbsp: never wrap "Rs" away from the amount

export const fmtDate = (iso: string, pattern = "EEE, d MMM yyyy") => format(parseISO(iso), pattern);
export const fmtShort = (iso: string) => format(parseISO(iso), "d MMM");
export const fmtDateTime = (iso: string) => format(new Date(iso), "d MMM yyyy, h:mm a");

export const nightsBetween = (checkIn: string, checkOut: string) => differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn));

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const guestsLabel = (adults: number, children: number) =>
  [plural(adults, "adult"), children ? plural(children, "child", "children") : null].filter(Boolean).join(" · ");

export const areaRange = (min: number | null, max: number | null) =>
  min == null ? null : min === max || max == null ? `${min} sq ft` : `${min}–${max} sq ft`;
