"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarSearch, SlidersHorizontal } from "lucide-react";
import SearchBar from "@/global/components/SearchBar";
import RoomTypeCard from "@/global/components/RoomTypeCard";
import { Alert, EmptyState } from "@/global/components/ui";
import { useAvailabilityQuery, useRoomTypesQuery } from "@/global/api/endpoints/roomsApi";
import { errorMessage } from "@/global/api/baseApi";
import { isPastStay, parseStay, stayToQuery } from "@/global/lib/stay";
import { fmtDate, guestsLabel, plural } from "@/global/lib/format";
import type { Stay } from "@/global/api/types";
import { applyFilters, filtersToParams, parseFilters, type ResultFilters } from "../_lib/filters";
import ResultCard from "./ResultCard";

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

  const setUrl = (s: Stay, f: ResultFilters) => router.replace(`${pathname}?${stayToQuery(s, filtersToParams(f))}`, { scroll: false });

  return (
    <div className="bg-zinc-50/60">
      <div className="border-b border-zinc-200 bg-white">
        <div className="container-page py-6">
          <h1 className="text-2xl font-medium sm:text-3xl">Apartments at Serene Heights</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {stay ? `${fmtDate(stay.checkIn, "EEE d MMM")} – ${fmtDate(stay.checkOut, "EEE d MMM yyyy")} · ${guestsLabel(stay.adults, stay.children)} · ${plural(stay.rooms, "apartment")}` : "Choose your dates to see live availability and prices."}
          </p>
          <div className="mt-5">
            <SearchBar initial={stay} onSearch={(s) => router.push(`${pathname}?${stayToQuery(s, filtersToParams(filters))}`)} submitLabel="Update" />
          </div>
        </div>
      </div>
      <div className="container-page py-8">
        {pastStay && <Alert tone="warning" title="Those dates have passed">Pick new dates above to see availability.</Alert>}
        {stay && !pastStay ? <Results stay={stay} filters={filters} onFilters={(f) => setUrl(stay, f)} /> : !pastStay && <Browse />}
      </div>
    </div>
  );
}

function Results({ stay, filters, onFilters }: { stay: Stay; filters: ResultFilters; onFilters: (f: ResultFilters) => void }) {
  const { data, isFetching, error } = useAvailabilityQuery(stay);
  const shown = useMemo(() => (data ? applyFilters(data.results, filters) : []), [data, filters]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600" aria-live="polite">
          {isFetching ? "Checking availability…" : data ? `${data.summary.bookable} of ${data.summary.roomTypes} apartment types available · ${plural(data.nights, "night")}` : ""}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-zinc-500" aria-hidden />
          <label className="sr-only" htmlFor="sort">Sort</label>
          <select id="sort" className="input w-auto py-2" value={filters.sort} onChange={(e) => onFilters({ ...filters, sort: e.target.value as ResultFilters["sort"] })}>
            <option value="recommended">Recommended</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="size_desc">Size: largest first</option>
          </select>
          <label className="sr-only" htmlFor="outdoor">Outdoor space</label>
          <select id="outdoor" className="input w-auto py-2" value={filters.outdoor} onChange={(e) => onFilters({ ...filters, outdoor: e.target.value as ResultFilters["outdoor"] })}>
            <option value="any">Balcony or terrace</option>
            <option value="balcony">Balcony</option>
            <option value="terrace">Private terrace</option>
          </select>
          <label className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm">
            <input type="checkbox" className="accent-brand-600" checked={filters.availableOnly} onChange={(e) => onFilters({ ...filters, availableOnly: e.target.checked })} />
            Available only
          </label>
        </div>
      </div>

      {error && <Alert tone="error" className="mt-6">{errorMessage(error)}</Alert>}

      <div className="mt-6 space-y-5">
        {!data && isFetching && Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-56 animate-pulse bg-white" />)}
        {data && shown.length === 0 && (
          <EmptyState icon={<CalendarSearch className="h-5 w-5" />} title="No apartments match">
            Try different dates, fewer guests per apartment, or clear the filters.
          </EmptyState>
        )}
        {shown.map((r) => (
          <ResultCard key={r.roomType.id} result={r} stay={stay} />
        ))}
      </div>
    </>
  );
}

function Browse() {
  const { data, isLoading, error } = useRoomTypesQuery();
  return (
    <>
      <Alert tone="info" title="Add your dates">Prices change with dates and season. Choose check-in and check-out above to see live availability.</Alert>
      {error && <Alert tone="error" className="mt-6">{errorMessage(error)}</Alert>}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-96 animate-pulse bg-white" />)}
        {data?.map((t) => <RoomTypeCard key={t.id} type={t} href={`/rooms/${t.slug}`} />)}
      </div>
    </>
  );
}
