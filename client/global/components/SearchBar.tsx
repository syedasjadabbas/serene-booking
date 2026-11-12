"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DayPicker, type DateRange } from "react-day-picker";
import { addDays, format, parseISO } from "date-fns";
import { CalendarDays, Minus, Plus, Search, Users } from "lucide-react";
import Popover from "./Popover";
import type { Stay } from "@/global/api/types";
import { defaultStay, stayToQuery } from "@/global/lib/stay";
import { guestsLabel, nightsBetween, plural } from "@/global/lib/format";
import { cn } from "@/global/lib/cn";

const MAX_NIGHTS = 30;
const MAX_ROOMS = 5;

type Props = {
  initial?: Stay | null;
  /** hero: big home search · bar: full-width row · panel: stacked, for narrow side panels */
  variant?: "hero" | "bar" | "panel";
  /** Override the default navigation to /rooms (e.g. stay on the room detail page). */
  onSearch?: (stay: Stay) => void;
  submitLabel?: string;
};

export default function SearchBar({ initial, variant = "bar", onSearch, submitLabel = "Search" }: Props) {
  const router = useRouter();
  const [stay, setStay] = useState<Stay>(initial ?? defaultStay());
  const [openPanel, setOpenPanel] = useState<"dates" | "guests" | null>(null);
  const [range, setRange] = useState<DateRange | undefined>({ from: parseISO(stay.checkIn), to: parseISO(stay.checkOut) });
  const [months, setMonths] = useState(2);

  useEffect(() => {
    if (initial) {
      setStay(initial);
      setRange({ from: parseISO(initial.checkIn), to: parseISO(initial.checkOut) });
    }
  }, [initial]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setMonths(mq.matches ? 2 : 1);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const close = useCallback(() => setOpenPanel(null), []);

  const onSelectRange = (r: DateRange | undefined) => {
    setRange(r);
    if (r?.from && r?.to && r.to > r.from) {
      setStay((s) => ({ ...s, checkIn: format(r.from!, "yyyy-MM-dd"), checkOut: format(r.to!, "yyyy-MM-dd") }));
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpenPanel(null);
    if (onSearch) onSearch(stay);
    else router.push(`/rooms?${stayToQuery(stay)}`);
  };

  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const hero = variant === "hero";
  const panel = variant === "panel";

  return (
    <form
      onSubmit={submit}
      className={cn(
        "relative grid gap-2 rounded-2xl bg-white text-zinc-800",
        hero && "p-2 shadow-pop md:grid-cols-[1.4fr_1fr_auto]",
        variant === "bar" && "border border-zinc-200 p-2 shadow-card md:grid-cols-[1.4fr_1fr_auto]",
        panel && "grid-cols-1"
      )}
      aria-label="Search availability"
    >
      {/* Dates */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenPanel((p) => (p === "dates" ? null : "dates"))}
          className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-zinc-50", panel && "border border-zinc-200")}
          aria-expanded={openPanel === "dates"}
        >
          <CalendarDays className="h-5 w-5 shrink-0 text-brand-600" />
          <span className="min-w-0">
            <span className="block text-xs font-medium text-zinc-500">Check-in — Check-out</span>
            <span className="block truncate text-sm font-semibold">
              {format(parseISO(stay.checkIn), "EEE d MMM")} — {format(parseISO(stay.checkOut), "EEE d MMM")}
              <span className="ml-2 font-normal text-zinc-500">{plural(nights, "night")}</span>
            </span>
          </span>
        </button>
        <Popover open={openPanel === "dates"} onClose={close} className="w-max max-w-[calc(100vw-2rem)]" align={panel ? "right" : "left"}>
          <DayPicker
            mode="range"
            numberOfMonths={panel ? 1 : months}
            selected={range}
            onSelect={onSelectRange}
            defaultMonth={parseISO(stay.checkIn)}
            disabled={[{ before: new Date() }, ...(range?.from && !range.to ? [{ after: addDays(range.from, MAX_NIGHTS) }] : [])]}
            excludeDisabled
            min={1}
          />
          <div className="mt-2 flex items-center justify-between gap-4 border-t border-zinc-100 pt-3 text-sm">
            <span className="text-zinc-500">{range?.from && range.to ? plural(nightsBetween(stay.checkIn, stay.checkOut), "night") : "Select your check-out date"}</span>
            <button type="button" className="btn-primary py-2" onClick={close} disabled={!range?.from || !range?.to}>
              Done
            </button>
          </div>
        </Popover>
      </div>

      {/* Guests */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenPanel((p) => (p === "guests" ? null : "guests"))}
          className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-zinc-50", panel ? "border border-zinc-200" : "md:border-l md:border-zinc-100")}
          aria-expanded={openPanel === "guests"}
        >
          <Users className="h-5 w-5 shrink-0 text-brand-600" />
          <span className="min-w-0">
            <span className="block text-xs font-medium text-zinc-500">Guests & apartments</span>
            <span className="block truncate text-sm font-semibold">
              {guestsLabel(stay.adults, stay.children)} · {plural(stay.rooms, "apt", "apts")}
            </span>
          </span>
        </button>
        <Popover open={openPanel === "guests"} onClose={close} className="w-72" align="right">
          <Stepper label="Adults" hint="Age 13+" value={stay.adults} min={stay.rooms} max={20} onChange={(adults) => setStay((s) => ({ ...s, adults }))} />
          <Stepper label="Children" hint="Age 0–12" value={stay.children} min={0} max={20} onChange={(children) => setStay((s) => ({ ...s, children }))} />
          <Stepper
            label="Apartments"
            value={stay.rooms}
            min={1}
            max={MAX_ROOMS}
            onChange={(rooms) => setStay((s) => ({ ...s, rooms, adults: Math.max(s.adults, rooms) }))}
          />
          <button type="button" className="btn-primary mt-3 w-full py-2" onClick={close}>
            Done
          </button>
        </Popover>
      </div>

      <button type="submit" className={cn("btn-primary", hero ? "px-8 py-3.5 text-base" : "px-6")}>
        <Search className="h-4 w-4" /> {submitLabel}
      </button>
    </form>
  );
}

function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint?: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-zinc-500">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className="grid h-8 w-8 place-items-center rounded-full border border-zinc-300 hover:border-brand-500 disabled:opacity-30" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${label.toLowerCase()}`}>
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-5 text-center text-sm font-semibold" aria-live="polite">{value}</span>
        <button type="button" className="grid h-8 w-8 place-items-center rounded-full border border-zinc-300 hover:border-brand-500 disabled:opacity-30" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${label.toLowerCase()}`}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
