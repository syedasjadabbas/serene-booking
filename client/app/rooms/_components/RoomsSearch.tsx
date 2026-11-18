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
import { RevealWords, Stagger } from "@/global/components/motion";

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
    <div className="min-h-screen bg-bone">
      {/* Sticky search under the site header, like Booking.com */}
      <div className="sticky top-[84px] z-30 border-b border-ink/10 bg-bone sm:bg-bone/90 sm:backdrop-blur-md">
        <div className="container-page py-3">
          <SearchBar initial={stay} onSearch={(s) => setUrl(s, filters, true)} submitLabel="Search" />
        </div>
      </div>
      <div className="container-page pb-24 pt-10 sm:pt-14">
        <nav aria-label="Breadcrumb" className="caps flex flex-wrap items-center gap-x-2 gap-y-1 text-ink/45">
          <Link href="/" className="transition hover:text-ink">Home</Link>
          <span aria-hidden className="text-ink/25">/</span> Nathia Gali
          <span aria-hidden className="text-ink/25">/</span> Serene Heights
          <span aria-hidden className="text-ink/25">/</span> <span className="text-ink">Apartments</span>
        </nav>
        {pastStay && <Alert tone="warning" title="Those dates have passed" className="mt-6">Pick new dates above to see availability.</Alert>}
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
    <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr] xl:gap-12">
      <aside className="hidden lg:block">
        {data && <FilterSidebar results={data.results} filters={filters} onChange={onFilters} />}
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-ink/15 pb-6">
          <div className="min-w-0">
            <p className="caps flex items-center gap-4 text-ink/60">
              Serene Heights Nathia Gali
              <span className="block h-px w-14 bg-ink/30" aria-hidden />
            </p>
            <h1 className="mt-4 text-[2rem] leading-[1.05] sm:text-5xl">
              <span className="sr-only">Serene Heights Nathia Gali: </span>
              {data ? `${shown.length} apartment ${shown.length === 1 ? "type" : "types"} found` : "Searching…"}
            </h1>
            <p className="mt-3 text-sm text-ink/60" aria-live="polite">
              {fmtDate(stay.checkIn, "EEE d MMM")} – {fmtDate(stay.checkOut, "EEE d MMM")} · {plural(data?.nights ?? 0, "night")} · {guestsLabel(stay.adults, stay.children)} · {plural(stay.rooms, "apartment")}
            </p>
          </div>
          {/* Gate on this component's own query so SSR and hydration render the same tree. */}
          {data && property && <ReviewScore average={property.stats.averageRating} count={property.stats.reviewCount} align="right" />}
        </div>

        {data && data.summary.bookedLast24h > 0 && (
          <p className="mt-5 flex items-center gap-2 border-l-2 border-red-700/50 bg-red-50/70 px-4 py-2.5 text-sm text-red-800">
            <Flame className="h-4 w-4" /> {plural(data.summary.bookedLast24h, "apartment")} booked at Serene Heights in the last 24 hours
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="caps mr-2 hidden text-ink/45 sm:inline">Sort</span>
          <button className="btn-secondary py-2.5 lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Filters{nActive ? ` (${nActive})` : ""}
          </button>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sort results">
            {SORTS.map((s) => (
              <button
                key={s.key}
                role="tab"
                aria-selected={filters.sort === s.key}
                onClick={() => onFilters({ ...filters, sort: s.key })}
                className={cn("chip rounded-none", filters.sort === s.key && "chip-active")}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {error && <Alert tone="error" className="mt-6">{errorMessage(error)}</Alert>}

        <div className={cn("mt-8 space-y-5 transition-opacity", isFetching && data && "opacity-60")}>
          {!data && isFetching && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 animate-pulse border border-ink/10 bg-white" />)}
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
            <Stagger className="space-y-5" step={80}>
              {shown.map((r) => (
                <ResultCard key={r.roomType.id} result={r} stay={stay} filters={filters} />
              ))}
            </Stagger>
          )}
        </div>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        {data && <FilterSidebar results={data.results} filters={filters} onChange={onFilters} />}
        <button className="btn-primary mt-5 w-full" onClick={() => setFiltersOpen(false)}>
          Show {plural(shown.length, "result")}
        </button>
      </Modal>
    </div>
  );
}

function Browse() {
  const { data, isLoading, error } = useRoomTypesQuery();
  return (
    <div className="mt-8">
      <div className="grid gap-8 border-b border-ink/15 pb-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="caps flex items-center gap-4 text-ink/60">
            The apartments
            <span className="block h-px w-14 bg-ink/30" aria-hidden />
          </p>
          <h1 className="mt-5 text-[2.3rem] leading-[1.02] sm:text-6xl lg:text-[4.5rem]">
            <RevealWords text="Apartments at Serene Heights" />
          </h1>
        </div>
        <Alert tone="info" title="Add your dates" className="lg:col-span-4">Prices change with dates and season. Choose check-in and check-out above to see live availability.</Alert>
      </div>
      {error && <Alert tone="error" className="mt-6">{errorMessage(error)}</Alert>}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-96 animate-pulse border border-ink/10 bg-white" />)}
        {data?.map((t) => <RoomTypeCard key={t.id} type={t} href={`/rooms/${t.slug}`} />)}
      </div>
    </div>
  );
}
