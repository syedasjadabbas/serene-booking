"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BedDouble, Building, Car, Check, Clock, Coffee, CreditCard, Dumbbell, IdCard, MapPin, Maximize2, PawPrint, Baby, Cigarette,
  Mountain, Trees, Users, Utensils, Waves, Wifi, Zap,
} from "lucide-react";
import { useRoomTypeQuery } from "@/global/api/endpoints/roomsApi";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { useReviewsQuery } from "@/global/api/endpoints/reviewsApi";
import { errorMessage } from "@/global/api/baseApi";
import { Alert, PageLoader, Stars } from "@/global/components/ui";
import SearchBar from "@/global/components/SearchBar";
import ReviewScore from "@/global/components/ReviewScore";
import { areaRange, fmtDate } from "@/global/lib/format";
import { isPastStay, parseStay, stayToQuery } from "@/global/lib/stay";
import PhotoGrid from "./PhotoGrid";
import { Reveal } from "@/global/components/motion";
import AvailabilityTable from "./AvailabilityTable";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "availability", label: "Info & prices" },
  { id: "facilities", label: "Facilities" },
  { id: "apartments", label: "Apartments & floor plans" },
  { id: "rules", label: "House rules" },
  { id: "location", label: "Location" },
  { id: "reviews", label: "Reviews" },
];

const POPULAR = [
  { Icon: Waves, label: "Heated infinity pool" },
  { Icon: Utensils, label: "Rooftop restaurant" },
  { Icon: Dumbbell, label: "Fitness gym & spa" },
  { Icon: Car, label: "Parking floor" },
  { Icon: Wifi, label: "High-speed Wi-Fi" },
  { Icon: Building, label: "24/7 front desk" },
  { Icon: Coffee, label: "Room service" },
  { Icon: Zap, label: "24/7 power backup" },
];

export default function RoomDetail() {
  const { slug } = useParams<{ slug: string }>();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const paramsKey = params.toString();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stay = useMemo(() => parseStay(params), [paramsKey]);
  const { data: t, isLoading, error } = useRoomTypeQuery(slug);
  const { data: property } = usePropertyQuery();
  const { data: reviews } = useReviewsQuery({ page: 1, pageSize: 4 });
  const [showAll, setShowAll] = useState(false);

  const photos = useMemo(() => {
    if (!t) return [];
    const own = t.images.map((src, i) => ({ src, alt: src.includes("floor-plans") ? `${t.name} floor plan` : `${t.name}, photo ${i + 1}` }));
    const seen = new Set(own.map((p) => p.src));
    return [...own, ...(property?.gallery ?? []).filter((g) => !seen.has(g.src))];
  }, [t, property]);

  if (isLoading) return <PageLoader />;
  if (error || !t) {
    return (
      <div className="container-page py-16">
        <Alert tone="error" title="Apartment type not found">{errorMessage(error)}</Alert>
        <Link href="/rooms" className="btn-secondary mt-6">Back to apartments</Link>
      </div>
    );
  }

  const floorPlans = property?.floors.filter((f) => t.floors.some((tf) => tf.label === f.label)) ?? [];
  const apartments = showAll ? t.apartments : t.apartments.slice(0, 10);
  const backHref = stay ? `/rooms?${stayToQuery(stay)}` : "/rooms";
  const onSearch = (s: Parameters<typeof stayToQuery>[0]) => router.replace(`${pathname}?${stayToQuery(s)}#availability`, { scroll: false });

  return (
    <div>
      {/* Sticky in-page navigation, like Booking.com's property tabs */}
      <nav aria-label="Page sections" className="sticky top-16 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="container-page flex gap-1 overflow-x-auto">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="shrink-0 border-b-2 border-transparent px-3 py-3 text-sm font-medium text-zinc-600 hover:border-brand-600 hover:text-brand-700">
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="container-page py-6">
        <nav aria-label="Breadcrumb" className="text-xs text-zinc-500">
          <Link href="/" className="text-brand-700 hover:underline">Home</Link> › <Link href={backHref} className="text-brand-700 hover:underline">Apartments</Link> › <span className="text-zinc-700">{t.name}</span>
        </nav>

        {/* Overview */}
        <Reveal as="section"id="overview" className="scroll-mt-32">
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="pill bg-gold-light text-[11px] text-zinc-800">Hotel apartment</span>
              <h1 className="mt-1.5 text-3xl font-semibold">{t.name}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-1 text-sm text-zinc-600">
                <MapPin className="h-4 w-4 text-brand-600" /> {property?.address ?? "Kala Bagh Air Base Road, Nathia Gali"} –{" "}
                <a href="#location" className="font-medium text-brand-700 underline">Show on map</a>
              </p>
            </div>
            <div className="flex items-center gap-4">
              {property && reviews && <ReviewScore average={property.stats.averageRating} count={property.stats.reviewCount} align="right" />}
              <a href="#availability" className="btn-primary">Reserve</a>
            </div>
          </div>

          <div className="mt-4">
            <PhotoGrid photos={photos} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              <ul className="flex flex-wrap gap-2">
                {POPULAR.map(({ Icon, label }) => (
                  <li key={label} className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700">
                    <Icon className="h-4 w-4 text-emerald-700" /> {label}
                  </li>
                ))}
              </ul>
              <p className="mt-5 leading-relaxed text-zinc-700">{t.description}</p>
              <p className="mt-3 leading-relaxed text-zinc-700">{property?.description}</p>
              <ul className="mt-5 grid grid-cols-2 gap-4 rounded-2xl border border-zinc-200 p-4 text-sm sm:grid-cols-4">
                <Fact Icon={Maximize2} label="Size" value={areaRange(t.minAreaSqft, t.maxAreaSqft) ?? "—"} />
                <Fact Icon={Users} label="Sleeps" value={`Up to ${t.maxOccupancy}`} />
                <Fact Icon={BedDouble} label="Beds" value={t.bedType} />
                <Fact Icon={Trees} label="Outdoor" value={t.outdoorSpace} />
              </ul>
            </div>
            <aside className="h-fit rounded-2xl bg-brand-50 p-5">
              <h2 className="font-semibold">Property highlights</h2>
              <ul className="mt-3 space-y-3 text-sm">
                <li className="flex gap-2"><Mountain className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" /><span><strong>Top location:</strong> 7,906 ft, 50 m from PAF Airbase Nathia Gali</span></li>
                <li className="flex gap-2"><Coffee className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" /><span><strong>Breakfast info:</strong> breakfast at the rooftop restaurant on breakfast rates</span></li>
                <li className="flex gap-2"><Car className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" /><span>Climate-controlled parking floor on site</span></li>
                <li className="flex gap-2"><Waves className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" /><span>Heated infinity pool, open year-round</span></li>
              </ul>
              <a href="#availability" className="btn-primary mt-5 w-full">Reserve</a>
            </aside>
          </div>
        </Reveal>

        {/* Availability */}
        <Reveal as="section"id="availability" className="mt-12 scroll-mt-32">
          <h2 className="text-2xl font-semibold">Availability</h2>
          <p className="mt-1 text-sm text-zinc-500">Prices are for the whole stay and include taxes. Pick dates to see live prices; the calendar shows the nightly price for this apartment type.</p>
          <div className="mt-4">
            <SearchBar initial={stay} onSearch={onSearch} roomType={t.slug} submitLabel={stay ? "Change search" : "Check availability"} />
          </div>
          <div className="mt-5">
            {stay && isPastStay(stay) && <Alert tone="warning">Those dates have passed. Pick new dates above.</Alert>}
            {stay && !isPastStay(stay) && <AvailabilityTable type={t} stay={stay} />}
            {!stay && <Alert tone="info" title="Select dates to see this apartment's availability and prices" />}
          </div>
        </Reveal>

        {/* Facilities */}
        <Reveal as="section"id="facilities" className="mt-12 scroll-mt-32">
          <h2 className="text-2xl font-semibold">Facilities of Serene Heights</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="font-semibold">In your apartment</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-zinc-700">
                {t.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{f}</li>)}
              </ul>
            </div>
            {property &&
              [...new Set(property.amenities.map((a) => a.group))].map((g) => (
                <div key={g}>
                  <h3 className="font-semibold">{g}</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-zinc-700">
                    {property.amenities.filter((a) => a.group === g).map((a) => <li key={a.key} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{a.name}</li>)}
                  </ul>
                </div>
              ))}
          </div>
        </Reveal>

        {/* Apartments & floor plans */}
        <Reveal as="section"id="apartments" className="mt-12 scroll-mt-32">
          <h2 className="text-2xl font-semibold">Apartments & floor plans</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {t.totalApartments} apartments of this type across {t.floors.map((f) => f.label).join(", ")}. Your apartment number is assigned at check-in.
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-zinc-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Apartment</th>
                    <th className="px-4 py-2.5 font-medium">Floor</th>
                    <th className="px-4 py-2.5 font-medium">Area</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {apartments.map((a) => (
                    <tr key={a.number}>
                      <td className="px-4 py-2 font-medium text-zinc-900">{a.number}</td>
                      <td className="px-4 py-2 text-zinc-600">{a.floorLabel}</td>
                      <td className="px-4 py-2 text-zinc-600">{a.areaSqft ? `${a.areaSqft} sq ft` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {t.apartments.length > 10 && (
                <button onClick={() => setShowAll((s) => !s)} className="w-full border-t border-zinc-100 py-2.5 text-sm font-medium text-brand-700 hover:bg-zinc-50">
                  {showAll ? "Show fewer" : `Show all ${t.apartments.length}`}
                </button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {floorPlans.slice(0, 4).map((f) => (
                <Link key={f.key} href={`/floor-plans#floor-${f.key}`} className="card overflow-hidden hover:shadow-pop">
                  <div className="relative aspect-[3/2] bg-white">
                    <Image src={f.plans[0]} alt={`${f.label} plan`} fill sizes="(min-width: 1280px) 20vw, 50vw" className="object-contain p-2" />
                  </div>
                  <p className="border-t border-zinc-100 px-4 py-2 text-sm font-medium">{f.label} plan →</p>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>

        {/* House rules */}
        {property && (
          <Reveal as="section"id="rules" className="mt-12 scroll-mt-32">
            <h2 className="text-2xl font-semibold">House rules</h2>
            <p className="mt-1 text-sm text-zinc-500">Serene Heights takes special requests – add them in the next step.</p>
            <dl className="mt-4 divide-y divide-zinc-200 rounded-2xl border border-zinc-200">
              {[
                { Icon: Clock, label: "Check-in", value: property.policies.checkIn },
                { Icon: Clock, label: "Check-out", value: property.policies.checkOut },
                { Icon: Check, label: "Cancellation / prepayment", value: "Free cancellation up to 48 hours before check-in on flexible rates. Non-refundable saver rates can't be refunded. No prepayment: pay at the property." },
                { Icon: Baby, label: "Children & beds", value: property.policies.children },
                { Icon: IdCard, label: "ID required", value: property.policies.id },
                { Icon: Cigarette, label: "Smoking", value: property.policies.smoking },
                { Icon: PawPrint, label: "Pets", value: property.policies.pets },
                { Icon: CreditCard, label: "Payment", value: property.policies.payment },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="grid gap-1 px-5 py-4 text-sm sm:grid-cols-[240px_1fr]">
                  <dt className="flex items-center gap-2 font-semibold text-zinc-900"><Icon className="h-4 w-4 text-zinc-500" />{label}</dt>
                  <dd className="text-zinc-700">{value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}

        {/* Location */}
        {property && (
          <Reveal as="section"id="location" className="mt-12 scroll-mt-32">
            <h2 className="text-2xl font-semibold">Location</h2>
            <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="min-h-[340px] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
                <iframe title="Map of Serene Heights Nathia Gali" src={`https://maps.google.com/maps?q=${encodeURIComponent(property.mapsQuery)}&z=13&output=embed`} className="h-full min-h-[340px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
              <ul className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 text-sm">
                {property.distances.map((d) => (
                  <li key={d.place} className="flex justify-between gap-4 px-4 py-3">
                    <span className="text-zinc-700">{d.place}</span>
                    <span className="text-right text-zinc-500">{d.distance}{d.drive ? ` · ${d.drive}` : ""}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}

        {/* Reviews */}
        <Reveal as="section"id="reviews" className="mt-12 scroll-mt-32">
          <h2 className="text-2xl font-semibold">Guest reviews</h2>
          {reviews && reviews.summary.total > 0 ? (
            <>
              <ReviewScore average={reviews.summary.average} count={reviews.summary.total} className="mt-3" />
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {reviews.items.map((r) => (
                  <figure key={r.id} className="card p-5">
                    <figcaption className="text-sm font-semibold">{r.author}{r.country ? ` · ${r.country}` : ""}</figcaption>
                    <p className="text-xs text-zinc-500">{r.roomType} · stayed {fmtDate(`${r.stayedMonth}-01`, "MMMM yyyy")}</p>
                    <Stars rating={r.rating} className="mt-2" />
                    <blockquote className="mt-2">
                      <p className="font-medium">{r.title}</p>
                      <p className="mt-1 text-sm text-zinc-600">{r.body}</p>
                    </blockquote>
                  </figure>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">
              No reviews yet. Guests who stay with us can review their stay from their account after check-out.
            </p>
          )}
        </Reveal>
      </div>
    </div>
  );
}

function Fact({ Icon, label, value }: { Icon: typeof Users; label: string; value: string }) {
  return (
    <li>
      <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-500"><Icon className="h-3.5 w-3.5" />{label}</span>
      <span className="mt-1 block font-medium text-zinc-900">{value}</span>
    </li>
  );
}
