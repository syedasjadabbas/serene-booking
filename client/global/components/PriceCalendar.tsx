"use client";

import { useMemo, useState } from "react";
import { DayPicker, type DateRange, type DayButtonProps } from "react-day-picker";
import { addDays, addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import { useCalendarQuery } from "@/global/api/endpoints/roomsApi";
import type { CalendarDay } from "@/global/api/types";
import { cn } from "@/global/lib/cn";

const iso = (d: Date) => format(d, "yyyy-MM-dd");
const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : String(n));

// Range date picker that shows the lowest nightly price under each day (Booking.com style),
// greys out sold-out nights and highlights the cheaper nights in green.
export default function PriceCalendar({
  range,
  onSelect,
  numberOfMonths,
  defaultMonth,
  roomType,
  rooms = 1,
  maxNights = 30,
}: {
  range: DateRange | undefined;
  onSelect: (r: DateRange | undefined) => void;
  numberOfMonths: number;
  defaultMonth: Date;
  roomType?: string;
  rooms?: number;
  maxNights?: number;
}) {
  const [month, setMonth] = useState(startOfMonth(defaultMonth));
  const today = new Date();
  const from = iso(month < today ? today : month);
  const to = iso(endOfMonth(addMonths(month, numberOfMonths - 1)));
  const { data, isFetching } = useCalendarQuery({ from, to, roomType });

  const byDate = useMemo(() => new Map<string, CalendarDay>((data?.days ?? []).map((d) => [d.date, d])), [data]);

  // Cheapest quarter of the visible prices counts as a "deal" night.
  const dealThreshold = useMemo(() => {
    const prices = (data?.days ?? []).map((d) => d.minRate).filter((p): p is number => p != null).sort((a, b) => a - b);
    return prices.length ? prices[Math.floor(prices.length * 0.25)] : 0;
  }, [data]);

  const soldOut = (date: Date) => {
    const d = byDate.get(iso(date));
    return Boolean(d && d.available < rooms);
  };
  const choosingCheckIn = !range?.from || Boolean(range?.to);

  const DayButton = useMemo(
    () =>
      function PriceDayButton({ day, modifiers, children, className, ...rest }: DayButtonProps) {
        const info = byDate.get(iso(day.date));
        const showPrice = info && info.minRate != null && !modifiers.disabled && !modifiers.outside && !modifiers.soldOut;
        return (
          <button {...rest} className={cn(className, "price-day")}>
            <span>{children}</span>
            {showPrice ? (
              <span className={cn("price-day__price", info!.minRate! <= dealThreshold && "price-day__price--deal")}>{compact(info!.minRate!)}</span>
            ) : modifiers.soldOut && !modifiers.outside ? (
              <span className="price-day__price">—</span>
            ) : null}
          </button>
        );
      },
    [byDate, dealThreshold]
  );

  return (
    <div className={cn("transition-opacity", isFetching && !data && "opacity-60")}>
      <DayPicker
        className="price-cal"
        mode="range"
        numberOfMonths={numberOfMonths}
        month={month}
        onMonthChange={setMonth}
        selected={range}
        onSelect={onSelect}
        startMonth={startOfMonth(today)}
        endMonth={addMonths(today, 18)}
        modifiers={{ soldOut }}
        modifiersClassNames={{ soldOut: "price-day--soldout" }}
        disabled={[
          { before: today },
          ...(range?.from && !range.to ? [{ after: addDays(range.from, maxNights) }] : []),
          // A sold-out night can't be a check-in; it can still be a check-out day.
          ...(choosingCheckIn ? [soldOut] : []),
        ]}
        excludeDisabled
        min={1}
        components={{ DayButton }}
      />
      <p className="mt-1 max-w-[42rem] text-xs text-zinc-500">
        Lowest price per night for one apartment, room only, before tax, in thousands of rupees. <span className="font-medium text-emerald-700">Green</span> = lower-priced nights.
      </p>
    </div>
  );
}
