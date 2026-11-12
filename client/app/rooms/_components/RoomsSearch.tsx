"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarSearch, Flame, SlidersHorizontal } from "lucide-react";
import SearchBar from "@/global/components/SearchBar";
import RoomTypeCard from "@/global/components/RoomTypeCard";
import ReviewScore from "@/global/components/ReviewScore";
import Modal from "@/global/components/Modal";
import { Alert, EmptyState } from "@/global/components/ui";
import { useAvailabilityQuery, useRoomTypesQuery } from "@/global/api/endpoints/roomsApi";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { errorMessage } from "@/global/api/baseApi";
import { isPastStay, parseStay, stayToQuery } from "@/global/lib/stay";
import { fmtDate, guestsLabel, plural } from "@/global/lib/format";
import { cn } from "@/global/lib/cn";
import type { Stay } from "@/global/api/types";
import { activeFilterCount, applyFilters, DEFAULT_FILTERS, filtersToParams, parseFilters, type ResultFilters, type SortKey } from "../_lib/filters";
import ResultCard from "./ResultCard";
import FilterSidebar from "./FilterSidebar";
import { Stagger } from "@/global/components/motion";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Our top picks" },
  { key: "price_asc", label: "Lowest price first" },
  { key: "price_desc", label: "Highest price first" },
  { key: "size_desc", label: "Largest first" },
];

export default function RoomsSearch() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const paramsKey = params.toString();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stay = useMemo(() => parseStay(params), [paramsKey]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filters = useMemo(() => parseFilters(params), [paramsKey]);
  const pastStay = stay ? isPastStay(stay) : false;

  const setUrl = (s: Stay, f: ResultFilters, push = false) => {
    const url = `${pathname}?${stayToQuery(s, filtersToParams(f))}`;
    if (push) router.push(url, { scroll: false });
    else router.replace(url, { scroll: false });
  };

  return (
    <div className="bg-zinc-50/60">
      {/* Sticky search under the site header, like Booking.com */}
      <div className="sticky top-16 z-30 border-b border-zinc-200 bg-white sm:bg-white/90 sm:backdrop-blur">
        <div className="container-page py-3">
          <SearchBar initial={stay} onSearch={(s) => setUrl(s, filters, true)} submitLabel="Search" />
        </div>
      </div>
      <div className="container-page py-6">
        <nav aria-label="Breadcrumb" className="text-xs text-zinc-500">
          <Link href="/" className="text-brand-700 hover:underline">Home</Link> › Nathia Gali › Serene Heights › <span className="text-zinc-700">Apartments</span>
        </nav>
        {pastStay && <Alert tone="warning" title="Those dates have passed" className="mt-4">Pick new dates above to see availability.</Alert>}
        {stay && !pastStay ? <Results stay={stay} filters={filters} onFilters={(f) => setUrl(stay, f)} /> : !pastStay && <Browse />}
      </div>
    </div>
  );
}

function Results({ stay, filters, onFilters }: { stay: Stay; filters: ResultFilters; onFilters: (f: ResultFilters) => void }) {
  const { data, isFetching, error } = useAvailabilityQuery(stay);
  const { data: property } = usePropertyQuery();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const shown = useMemo(() => (data ? applyFilters(data.results, filters) : []), [data, filters]);
  const nActive = activeFilterCount(filters);

  return (
    <div className="mt-4 grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">
        {data && <FilterSidebar results={data.results} filters={filters} onChange={onFilters} />}
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">
              Serene Heights Nathia Gali: {data ? `${shown.length} apartment ${shown.length === 1 ? "type" : "types"} found` : "searching…"}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500" aria-live="polite">
              {fmtDate(stay.checkIn, "EEE d MMM")} – {fmtDate(stay.checkOut, "EEE d MMM")} · {plural(data?.nights ?? 0, "night")} · {guestsLabel(stay.adults, stay.children)} · {plural(stay.rooms, "apartment")}
            </p>
          </div>
          {/* Gate on this component's own query so SSR and hydration render the same tree. */}
          {data && property && <ReviewScore average={property.stats.averageRating} count={property.stats.reviewCount} align="right" />}
        </div>

        {data && data.summary.bookedLast24h > 0 && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
            <Flame className="h-4 w-4" /> {plural(data.summary.bookedLast24h, "apartment")} booked at Serene Heights in the last 24 hours
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="btn-secondary py-2 lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Filters{nActive ? ` (${nActive})` : ""}
          </button>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sort results">
            {SORTS.map((s) => (
              <button
                key={s.key}
                role="tab"
                aria-selected={filters.sort === s.key}
                onClick={() => onFilters({ ...filters, sort: s.key })}
                className={cn("chip", filters.sort === s.key && "chip-active")}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {error && <Alert tone="error" className="mt-6">{errorMessage(error)}</Alert>}

        <div className={cn("mt-5 space-y-4 transition-opacity", isFetching && data && "opacity-60")}>
          {!data && isFetching && Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-60 animate-pulse bg-white" />)}
          {data && shown.length === 0 && (
            <EmptyState
              icon={<CalendarSearch className="h-5 w-5" />}
              title="No apartments match your filters"
              action={nActive ? <button className="btn-secondary" onClick={() => onFilters({ ...DEFAULT_FILTERS, sort: filters.sort })}>Clear filters</button> : undefined}
            >
              Try different dates, fewer guests per apartment, or fewer filters.
            </EmptyState>
          )}
          {shown.length > 0 && (
            <Stagger className="space-y-4" step={80}>
              {shown.map((r) => (
                <ResultCard key={r.roomType.id} result={r} stay={stay} filters={filters} />
              ))}
            </Stagger>
          )}
        </div>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        {data && <FilterSidebar results={data.results} filters={filters} onChange={onFilters} />}
        <button className="btn-primary mt-4 w-full" onClick={() => setFiltersOpen(false)}>
          Show {plural(shown.length, "result")}
        </button>
      </Modal>
    </div>
  );
}

function Browse() {
  const { data, isLoading, error } = useRoomTypesQuery();
  return (
    <div className="mt-4">
      <h1 className="text-2xl font-semibold">Apartments at Serene Heights</h1>
      <Alert tone="info" title="Add your dates" className="mt-4">Prices change with dates and season. Choose check-in and check-out above to see live availability.</Alert>
      {error && <Alert tone="error" className="mt-6">{errorMessage(error)}</Alert>}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-96 animate-pulse bg-white" />)}
        {data?.map((t) => <RoomTypeCard key={t.id} type={t} href={`/rooms/${t.slug}`} />)}
      </div>
    </div>
  );
}
