"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight, Building, Car, Check, Clock, Coffee, CreditCard, Dumbbell, IdCard, MapPin, PawPrint, Baby, Cigarette,
  Mountain, Utensils, Waves, Wifi, Zap,
} from "lucide-react";
import { useRoomTypeQuery } from "@/global/api/endpoints/roomsApi";
import { usePropertyQuery } from "@/global/api/endpoints/propertyApi";
import { useReviewsQuery } from "@/global/api/endpoints/reviewsApi";
import { errorMessage } from "@/global/api/baseApi";
import { Alert, PageLoader, Stars } from "@/global/components/ui";
import SearchBar from "@/global/components/SearchBar";
import ReviewScore from "@/global/components/ReviewScore";
import SectionHeading from "@/global/components/SectionHeading";
import RollText from "@/global/components/RollText";
import { Reveal, Stagger } from "@/global/components/motion";
import { areaRange, fmtDate, money } from "@/global/lib/format";
import { isPastStay, parseStay, stayToQuery } from "@/global/lib/stay";
import { asset } from "@/global/lib/asset";
import PhotoGrid from "./PhotoGrid";
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

// Residence page for one apartment type: the name set large in capitals, an editorial photo grid, the key
// figures in a ruled list beside the story, then the rates, facilities, plans, rules, location and reviews.
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
      <div className="container-page py-20">
        <Alert tone="error" title="Apartment type not found">{errorMessage(error)}</Alert>
        <Link href="/rooms" className="btn-secondary mt-6">Back to apartments</Link>
      </div>
    );
  }

  const floorPlans = property?.floors.filter((f) => t.floors.some((tf) => tf.label === f.label)) ?? [];
  const apartments = showAll ? t.apartments : t.apartments.slice(0, 10);
  const backHref = stay ? `/rooms?${stayToQuery(stay)}` : "/rooms";
  const onSearch = (s: Parameters<typeof stayToQuery>[0]) => router.replace(`${pathname}?${stayToQuery(s)}#availability`, { scroll: false });

  const figures = [
    { k: "Size", v: areaRange(t.minAreaSqft, t.maxAreaSqft) ?? "—" },
    { k: "Sleeps", v: `Up to ${t.maxOccupancy}` },
    { k: "Beds", v: t.bedType },
    { k: "Outdoor", v: t.outdoorSpace },
    { k: "From", v: `${money(t.baseRate)} / night` },
  ];

  return (
    <div className="bg-bone">
      {/* Sticky in-page navigation, like Booking.com's property tabs */}
      <nav aria-label="Page sections" className="sticky top-[84px] z-30 border-b border-ink/10 bg-bone sm:bg-bone/90 sm:backdrop-blur-md">
        <div className="container-page flex gap-1 overflow-x-auto sm:gap-3">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="caps shrink-0 border-b border-transparent px-2 py-4 text-ink/55 transition hover:border-ink hover:text-ink">
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Overview */}
      <section id="overview" className="scroll-mt-32">
        <div className="container-page pt-10 sm:pt-14">
          <nav aria-label="Breadcrumb" className="caps flex flex-wrap items-center gap-x-2 gap-y-1 text-ink/45">
            <Link href="/" className="transition hover:text-ink">Home</Link>
            <span aria-hidden className="text-ink/25">/</span>
            <Link href={backHref} className="transition hover:text-ink">Apartments</Link>
            <span aria-hidden className="text-ink/25">/</span>
            <span className="text-ink">{t.name}</span>
          </nav>

          <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="caps fade-up flex items-center gap-4 text-ink/60">
                Hotel apartment
                <span className="block h-px w-14 bg-ink/30" aria-hidden />
              </p>
              <h1 className="fade-up mt-5 break-words text-[2.6rem] leading-[0.98] sm:text-7xl lg:text-[6.2rem]" style={{ animationDelay: "120ms" }}>
                {t.name}
              </h1>
              <p className="fade-up mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink/65" style={{ animationDelay: "240ms" }}>
                <MapPin className="h-4 w-4 text-ink/45" strokeWidth={1.5} /> {property?.address ?? "Kala Bagh Air Base Road, Nathia Gali"} –{" "}
                <a href="#location" className="tap caps text-ink underline decoration-ink/30 underline-offset-4 transition hover:decoration-ink">Show on map</a>
              </p>
            </div>
            <div className="fade-up flex shrink-0 flex-wrap items-center gap-5" style={{ animationDelay: "320ms" }}>
              {property && reviews && <ReviewScore average={property.stats.averageRating} count={property.stats.reviewCount} align="right" />}
              <a href="#availability" className="btn-primary roll-host"><RollText>Reserve</RollText></a>
            </div>
          </div>

          <div className="mt-10">
            <PhotoGrid photos={photos} />
          </div>
        </div>

        <div className="container-page mt-16 grid gap-14 pb-24 sm:mt-24 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-7">
            <Reveal className="flex items-center gap-4">
              <span className="caps">The apartment</span>
              <span className="block h-px w-14 bg-ink/30" aria-hidden />
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-6 font-display text-2xl leading-[1.35] text-ink sm:text-[1.75rem]">{t.description}</p>
            </Reveal>
            {property?.description && (
              <Reveal delay={150}>
                <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink/70">{property.description}</p>
              </Reveal>
            )}

            <Reveal delay={150} className="mt-12">
              <p className="caps text-ink/60">Most popular facilities</p>
              <ul className="mt-4 grid border-t border-ink/15 sm:grid-cols-2">
                {POPULAR.map(({ Icon, label }) => (
                  <li key={label} className="flex items-center gap-3 border-b border-ink/15 py-3.5 text-sm text-ink/80 sm:odd:pr-6 sm:even:border-l sm:even:pl-6">
                    <Icon className="h-4 w-4 shrink-0 text-ink/50" strokeWidth={1.5} /> {label}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <aside className="h-fit lg:sticky lg:top-36 lg:col-span-4 lg:col-start-9">
            <Reveal>
              <dl className="divide-y divide-ink/20 border-y border-ink/20">
                {figures.map((f) => (
                  <div key={f.k} className="flex items-baseline justify-between gap-6 py-4">
                    <dt className="caps shrink-0">{f.k}</dt>
                    <dd className="text-right font-display text-xl leading-tight text-ink sm:text-2xl">{f.v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 bg-sky-light p-6">
                <h2 className="caps text-ink">Property highlights</h2>
                <ul className="mt-4 space-y-3.5 text-sm text-ink/75">
                  <li className="flex gap-3"><Mountain className="mt-0.5 h-4 w-4 shrink-0 text-ink/60" strokeWidth={1.5} /><span><strong className="font-semibold text-ink">Top location:</strong> 7,906 ft, 50 m from PAF Airbase Nathia Gali</span></li>
                  <li className="flex gap-3"><Coffee className="mt-0.5 h-4 w-4 shrink-0 text-ink/60" strokeWidth={1.5} /><span><strong className="font-semibold text-ink">Breakfast info:</strong> breakfast at the rooftop restaurant on breakfast rates</span></li>
                  <li className="flex gap-3"><Car className="mt-0.5 h-4 w-4 shrink-0 text-ink/60" strokeWidth={1.5} /><span>Climate-controlled parking floor on site</span></li>
                  <li className="flex gap-3"><Waves className="mt-0.5 h-4 w-4 shrink-0 text-ink/60" strokeWidth={1.5} /><span>Heated infinity pool, open year-round</span></li>
                </ul>
                <a href="#availability" className="btn-primary roll-host mt-6 w-full"><RollText>Reserve</RollText></a>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* Availability */}
      <section id="availability" className="scroll-mt-32 bg-sky-light py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading label="Info & prices" title="Availability">
            Prices are for the whole stay and include taxes. Pick dates to see live prices; the calendar shows the nightly price for this apartment type.
          </SectionHeading>
          <div className="mt-10">
            <SearchBar initial={stay} onSearch={onSearch} roomType={t.slug} submitLabel={stay ? "Change search" : "Check availability"} />
          </div>
          <div className="mt-6">
            {stay && isPastStay(stay) && <Alert tone="warning">Those dates have passed. Pick new dates above.</Alert>}
            {stay && !isPastStay(stay) && <AvailabilityTable type={t} stay={stay} />}
            {!stay && <Alert tone="info" title="Select dates to see this apartment's availability and prices" />}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section id="facilities" className="scroll-mt-32 py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading label="Facilities" title="Facilities of Serene Heights" />
          <Stagger className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" step={70}>
            <div>
              <h3 className="border-b border-ink/20 pb-3 text-2xl">In your apartment</h3>
              <ul className="mt-1 divide-y divide-ink/10 text-sm text-ink/75">
                {t.features.map((f) => <li key={f} className="flex gap-3 py-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-ink/50" strokeWidth={1.5} />{f}</li>)}
              </ul>
            </div>
            {property &&
              [...new Set(property.amenities.map((a) => a.group))].map((g) => (
                <div key={g}>
                  <h3 className="border-b border-ink/20 pb-3 text-2xl">{g}</h3>
                  <ul className="mt-1 divide-y divide-ink/10 text-sm text-ink/75">
                    {property.amenities.filter((a) => a.group === g).map((a) => <li key={a.key} className="flex gap-3 py-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-ink/50" strokeWidth={1.5} />{a.name}</li>)}
                  </ul>
                </div>
              ))}
          </Stagger>
        </div>
      </section>

      {/* Apartments & floor plans */}
      <section id="apartments" className="scroll-mt-32 border-t border-ink/10 py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading label="Floor plans" title="Apartments & floor plans">
            {t.totalApartments} apartments of this type across {t.floors.map((f) => f.label).join(", ")}. Your apartment number is assigned at check-in.
          </SectionHeading>
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <Reveal>
              <table className="w-full text-left text-sm">
                <thead className="border-b border-ink/30">
                  <tr>
                    <th className="caps py-3 pr-4">Apartment</th>
                    <th className="caps px-4 py-3">Floor</th>
                    <th className="caps py-3 pl-4 text-right">Area</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {apartments.map((a) => (
                    <tr key={a.number}>
                      <td className="py-3 pr-4 font-display text-lg text-ink">{a.number}</td>
                      <td className="px-4 py-3 text-ink/65">{a.floorLabel}</td>
                      <td className="py-3 pl-4 text-right text-ink/65">{a.areaSqft ? `${a.areaSqft} sq ft` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {t.apartments.length > 10 && (
                <button onClick={() => setShowAll((s) => !s)} className="caps w-full border-y border-ink/20 py-3.5 text-ink transition hover:bg-ink hover:text-bone">
                  {showAll ? "Show fewer" : `Show all ${t.apartments.length}`}
                </button>
              )}
            </Reveal>
            <Stagger className="grid content-start gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" step={90}>
              {floorPlans.slice(0, 4).map((f) => (
                <Link key={f.key} href={`/floor-plans#floor-${f.key}`} className="group block border border-ink/10 bg-white transition duration-500 hover:border-ink/30">
                  <div className="relative aspect-[3/2] bg-white">
                    <Image src={asset(f.plans[0])} alt={`${f.label} plan`} fill sizes="(min-width: 1280px) 20vw, (min-width: 640px) 50vw, 100vw" className="object-contain p-3" />
                  </div>
                  <p className="caps flex items-center justify-between gap-3 border-t border-ink/10 px-4 py-3.5 text-ink">
                    {f.label} plan
                    <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:rotate-45" />
                  </p>
                </Link>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* House rules */}
      {property && (
        <section id="rules" className="scroll-mt-32 border-t border-ink/10 py-20 sm:py-28">
          <div className="container-page">
            <SectionHeading label="Before you arrive" title="House rules">
              Serene Heights takes special requests – add them in the next step.
            </SectionHeading>
            <Reveal delay={100}>
              <dl className="mt-12 divide-y divide-ink/15 border-y border-ink/20">
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
                  <div key={label} className="grid gap-2 py-5 text-sm sm:grid-cols-[280px_1fr] sm:gap-8">
                    <dt className="caps flex items-center gap-3 text-ink"><Icon className="h-4 w-4 text-ink/45" strokeWidth={1.5} />{label}</dt>
                    <dd className="leading-relaxed text-ink/70">{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>
      )}

      {/* Location */}
      {property && (
        <section id="location" className="scroll-mt-32 border-t border-ink/10 py-20 sm:py-28">
          <div className="container-page">
            <SectionHeading label="Nathia Gali · 7,906 ft" title="Location" />
            <div className="mt-12 grid gap-10 lg:grid-cols-12">
              <Reveal className="min-h-[340px] overflow-hidden bg-sky-light lg:col-span-7">
                <iframe title="Map of Serene Heights Nathia Gali" src={`https://maps.google.com/maps?q=${encodeURIComponent(property.mapsQuery)}&z=13&output=embed`} className="h-full min-h-[340px] w-full lg:min-h-[420px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </Reveal>
              <Reveal delay={150} className="lg:col-span-5">
                <p className="caps text-ink/60">Distances</p>
                <ul className="mt-4 divide-y divide-ink/15 border-y border-ink/20 text-sm">
                  {property.distances.map((d) => (
                    <li key={d.place} className="flex justify-between gap-4 py-3.5">
                      <span className="text-ink/80">{d.place}</span>
                      <span className="text-right text-ink/60">{d.distance}{d.drive ? ` · ${d.drive}` : ""}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section id="reviews" className="scroll-mt-32 bg-sky py-20 sm:py-28">
        <div className="container-page">
          <SectionHeading
            label="Reviews"
            title="Guest reviews"
            action={reviews && reviews.summary.total > 0 ? <ReviewScore average={reviews.summary.average} count={reviews.summary.total} /> : undefined}
          />
          {reviews && reviews.summary.total > 0 ? (
            <Stagger className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2" step={90}>
              {reviews.items.map((r) => (
                <figure key={r.id} className="flex h-full flex-col border-t border-ink/30 pt-6">
                  <Stars rating={r.rating} />
                  <blockquote className="mt-4 flex-1">
                    <p className="font-display text-2xl leading-tight text-ink">{r.title}</p>
                    <p className="mt-3 text-[15px] leading-relaxed text-ink/75">{r.body}</p>
                  </blockquote>
                  <figcaption className="mt-6">
                    <span className="caps block text-ink">{r.author}{r.country ? ` · ${r.country}` : ""}</span>
                    <span className="mt-1 block text-xs text-ink/55">{r.roomType} · stayed {fmtDate(`${r.stayedMonth}-01`, "MMMM yyyy")}</span>
                  </figcaption>
                </figure>
              ))}
            </Stagger>
          ) : (
            <p className="mt-10 border border-dashed border-ink/30 p-6 text-sm text-ink/65">
              No reviews yet. Guests who stay with us can review their stay from their account after check-out.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
