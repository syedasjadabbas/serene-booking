"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { format, parseISO } from "date-fns";
import PriceCalendar from "./PriceCalendar";
import { ArrowRight, CalendarDays, Minus, Plus, Search, Users } from "lucide-react";
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
  /** Show calendar prices for one apartment type instead of the whole property. */
  roomType?: string;
};

export default function SearchBar({ initial, variant = "bar", onSearch, submitLabel = "Search", roomType }: Props) {
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
        "relative grid text-ink",
        !hero && "gap-1.5 bg-white",
        hero && "bg-bone/95 shadow-pop backdrop-blur-md md:grid-cols-[1.35fr_1fr_auto] lg:grid-cols-[0.95fr_1.35fr_1fr_auto]",
        variant === "bar" && "rounded-none border border-ink/15 p-1.5 md:grid-cols-[1.4fr_1fr_auto] md:items-center",
        panel && "grid-cols-1 gap-2"
      )}
      aria-label="Search availability"
    >
      {/* Where: single property, shown for orientation like the reference design */}
      {hero && (
        <div className="hidden items-center px-6 py-4 lg:flex">
          <span className="min-w-0">
            <span className="block caps whitespace-nowrap text-ink/50">Where</span>
            <span className="mt-1.5 block truncate font-display text-xl leading-tight text-ink">Nathia Gali, Pakistan</span>
          </span>
        </div>
      )}

      {/* Dates */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenPanel((p) => (p === "dates" ? null : "dates"))}
          className={cn(
            "flex w-full items-center gap-3 text-left hover:bg-ink/[0.04]",
            hero ? "h-full px-6 py-4 lg:border-l lg:border-ink/10" : "rounded-2xl px-3 py-2",
            panel && "border border-zinc-200"
          )}
          aria-expanded={openPanel === "dates"}
        >
          {!hero && <FieldIcon><CalendarDays className="h-4 w-4" /></FieldIcon>}
          <span className="min-w-0">
            <span className="block caps whitespace-nowrap text-ink/50">Check-in — Check-out</span>
            <span className={cn("block truncate font-display leading-tight text-ink", hero ? "mt-1.5 text-xl" : "text-lg")}>
              {format(parseISO(stay.checkIn), "EEE d MMM")} — {format(parseISO(stay.checkOut), "EEE d MMM")}
              <span className="ml-2 font-sans text-sm font-light text-zinc-500">{plural(nights, "night")}</span>
            </span>
          </span>
        </button>
        <Popover open={openPanel === "dates"} onClose={close} className="w-max max-w-[calc(100vw-2rem)]" align={panel ? "right" : "left"} side={hero ? "top" : "bottom"}>
          <PriceCalendar
            range={range}
            onSelect={onSelectRange}
            numberOfMonths={panel ? 1 : months}
            defaultMonth={parseISO(stay.checkIn)}
            roomType={roomType}
            rooms={stay.rooms}
            maxNights={MAX_NIGHTS}
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
          className={cn(
            "flex w-full items-center gap-3 text-left hover:bg-ink/[0.04]",
            hero ? "h-full border-t border-ink/10 px-6 py-4 md:border-l md:border-t-0" : "rounded-2xl px-3 py-2",
            panel ? "border border-zinc-200" : !hero && "md:rounded-none md:border-l md:border-zinc-100 md:pl-4"
          )}
          aria-expanded={openPanel === "guests"}
        >
          {!hero && <FieldIcon><Users className="h-4 w-4" /></FieldIcon>}
          <span className="min-w-0">
            <span className="block caps whitespace-nowrap text-ink/50">{hero ? "Guests" : "Guests & apartments"}</span>
            <span className={cn("block truncate font-display leading-tight text-ink", hero ? "mt-1.5 text-xl" : "text-lg")}>
              {guestsLabel(stay.adults, stay.children)} · {plural(stay.rooms, "apt", "apts")}
            </span>
          </span>
        </button>
        <Popover open={openPanel === "guests"} onClose={close} className="w-72" align="right" side={hero ? "top" : "bottom"}>
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

      {hero ? (
        <button type="submit" className="btn-primary group h-full gap-3 whitespace-nowrap px-8 py-5">
          {submitLabel}
          <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
        </button>
      ) : (
        <button type="submit" className="btn-primary px-6 py-3">
          <Search className="h-4 w-4" /> {submitLabel}
        </button>
      )}
    </form>
  );
}

function FieldIcon({ children }: { children: React.ReactNode }) {
  return <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/20 text-ink">{children}</span>;
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
