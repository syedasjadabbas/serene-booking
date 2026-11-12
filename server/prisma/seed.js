// Seeds room types, apartments, rate plans and seasonal rates. Idempotent (upserts), one transaction.
// Dry run by default: prints what would be created/updated. Production also needs --yes.
//   npm run db:seed                 dry run
//   npm run db:seed -- --apply      write
//
// PLACEHOLDERS: nightly rates, breakfast price, seasons, occupancy limits and the sofa bed are not
// published on the official site (it lists sale prices per sq ft). Confirm with Serene Heights management.
// Room photos: real apartment interiors (client photo shoot, images/interiors) first, then an official
// 3D exterior render and the type's floor plan. The Terrace type leads with its rooftop render.

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { PrismaClient } = require("@prisma/client");
const { apartments } = require("./inventory");

const prisma = new PrismaClient();

const commonFeatures = [
  "Fully furnished one-bedroom apartment",
  "Separate sitting room with kitchenette",
  "En-suite bathroom with shower",
  "Central heating & heated floors",
  "High-speed Wi-Fi",
  "Daily housekeeping",
  "24/7 room service",
];

const roomTypes = [
  {
    slug: "classic-one-bedroom",
    name: "Classic One-Bedroom Apartment",
    tagline: "A cosy mountain base with its own balcony",
    description:
      "A compact, fully furnished one-bedroom apartment with a bedroom, sitting room with kitchenette, en-suite bathroom and a private balcony. Ideal for couples and short getaways.",
    bedType: "1 double bed",
    outdoorSpace: "Private balcony",
    maxAdults: 2,
    maxChildren: 1,
    maxOccupancy: 3,
    baseRate: 18000,
    images: ["/images/interiors/living-room-sofa.jpg", "/images/interiors/bedroom-arch-window.jpg", "/images/interiors/kitchenette.jpg", "/images/interiors/dining-daylight.jpg", "/images/resort/tower-front.jpg", "/images/floor-plans/floor-1.png"],
    extra: ["Private balcony"],
    sortOrder: 1,
  },
  {
    slug: "premier-one-bedroom",
    name: "Premier One-Bedroom Apartment",
    tagline: "More room to unwind after a day in the pines",
    description:
      "A roomier one-bedroom apartment with a larger sitting room, kitchenette, en-suite bathroom and private balcony. A sofa bed in the sitting room makes space for the family.",
    bedType: "1 double bed + sofa bed",
    outdoorSpace: "Private balcony",
    maxAdults: 3,
    maxChildren: 2,
    maxOccupancy: 4,
    baseRate: 22000,
    images: ["/images/interiors/lounge-art.jpg", "/images/interiors/bedroom.jpg", "/images/interiors/dining-window.jpg", "/images/interiors/kitchenette-evening.jpg", "/images/resort/tower-day.jpg", "/images/floor-plans/floor-2.png"],
    extra: ["Private balcony", "Sofa bed in sitting room"],
    sortOrder: 2,
  },
  {
    slug: "grand-one-bedroom",
    name: "Grand One-Bedroom Apartment",
    tagline: "Our most spacious standard layout",
    description:
      "A generous one-bedroom apartment with a large bedroom, spacious sitting room with kitchenette, en-suite bathroom and a wide private balcony facing the Galiyat.",
    bedType: "1 double bed + sofa bed",
    outdoorSpace: "Private balcony",
    maxAdults: 3,
    maxChildren: 2,
    maxOccupancy: 4,
    baseRate: 26000,
    images: ["/images/interiors/living-room-wide.jpg", "/images/interiors/bedroom-morning.jpg", "/images/interiors/dining-nook-arch.jpg", "/images/interiors/living-kitchen-evening.jpg", "/images/resort/tower-top.jpg", "/images/floor-plans/floor-6.png"],
    extra: ["Wide private balcony", "Sofa bed in sitting room"],
    sortOrder: 3,
  },
  {
    slug: "signature-corner-suite",
    name: "Signature Corner Suite",
    tagline: "Corner living with views on two sides",
    description:
      "Our largest apartments, set on the corners of the building with windows on two sides, an oversized sitting room, kitchenette, en-suite bathroom and private balcony.",
    bedType: "1 double bed + sofa bed",
    outdoorSpace: "Private balcony",
    maxAdults: 3,
    maxChildren: 2,
    maxOccupancy: 4,
    baseRate: 34000,
    images: ["/images/interiors/window-view.jpg", "/images/interiors/guests-lounge.jpg", "/images/interiors/bedside-evening.jpg", "/images/interiors/sofa-detail.jpg", "/images/resort/aerial-rooftop-pool.jpg", "/images/floor-plans/floor-3.png"],
    extra: ["Corner position, dual aspect", "Sofa bed in sitting room"],
    sortOrder: 4,
  },
  {
    slug: "terrace-apartment",
    name: "Terrace Apartment",
    tagline: "Top-floor living with your own terrace",
    description:
      "One-bedroom apartments on the 8th floor, each opening onto a private terrace in place of a balcony. Closest to the sky for stargazing at 7,906 ft.",
    bedType: "1 double bed + sofa bed",
    outdoorSpace: "Private terrace",
    maxAdults: 3,
    maxChildren: 2,
    maxOccupancy: 4,
    baseRate: 30000,
    images: ["/images/resort/rooftop-crown.jpg", "/images/interiors/sunrise-balcony.jpg", "/images/interiors/bedroom-arch-window.jpg", "/images/interiors/decor-dining-detail.jpg", "/images/resort/rooftop-sunset.jpg", "/images/floor-plans/floor-8.png"],
    extra: ["Private terrace", "Top floor", "Sofa bed in sitting room"],
    sortOrder: 5,
  },
];

const ratePlans = [
  {
    code: "FLEX",
    name: "Flexible rate",
    description: "Room only. Free cancellation until 48 hours before check-in. Pay at the property.",
    refundable: true,
    freeCancelHours: 48,
    breakfastIncluded: false,
    breakfastPerGuest: 0,
    discountPercent: 0,
    sortOrder: 1,
  },
  {
    code: "FLEX_BB",
    name: "Flexible with breakfast",
    description: "Breakfast at the rooftop restaurant for every guest. Free cancellation until 48 hours before check-in.",
    refundable: true,
    freeCancelHours: 48,
    breakfastIncluded: true,
    breakfastPerGuest: 1500,
    discountPercent: 0,
    sortOrder: 2,
  },
  {
    code: "SAVER",
    name: "Non-refundable saver",
    description: "Save 10%. Room only. This rate can't be refunded if you cancel or change your stay.",
    refundable: false,
    freeCancelHours: null,
    breakfastIncluded: false,
    breakfastPerGuest: 0,
    discountPercent: 10,
    sortOrder: 3,
  },
];

const seasons = [
  { name: "Snow season 2026-27", startDate: "2026-12-20", endDate: "2027-02-15", multiplierPct: 115 },
  { name: "Summer peak 2027", startDate: "2027-06-01", endDate: "2027-08-31", multiplierPct: 125 },
];

const APPLY = process.argv.includes("--apply");

async function main() {
  if (APPLY && process.env.NODE_ENV === "production" && !process.argv.includes("--yes")) {
    console.error("Refusing to seed a production database without --yes");
    process.exit(1);
  }

  // ── Plan: what would be created vs updated ──────────────────────────────
  const [types, rooms, plans, seasonRows] = await Promise.all([
    prisma.roomType.findMany({ select: { slug: true } }),
    prisma.room.findMany({ select: { number: true } }),
    prisma.ratePlan.findMany({ select: { code: true } }),
    prisma.seasonalRate.findMany({ where: { name: { in: seasons.map((s) => s.name) } }, select: { name: true } }),
  ]);
  const has = (rows, key) => new Set(rows.map((r) => r[key]));
  const split = (items, existing, key) => ({ create: items.filter((i) => !existing.has(i[key])).length, update: items.filter((i) => existing.has(i[key])).length });
  const plan = {
    roomTypes: split(roomTypes, has(types, "slug"), "slug"),
    apartments: split(apartments, has(rooms, "number"), "number"),
    ratePlans: split(ratePlans, has(plans, "code"), "code"),
    seasons: { replace: seasonRows.length, create: seasons.length },
  };
  console.log(`Seed plan (${APPLY ? "applying" : "dry run"}):`);
  for (const [k, v] of Object.entries(plan)) console.log(`  ${k.padEnd(11)} ${JSON.stringify(v)}`);

  if (!APPLY) {
    console.log("\nDry run: nothing written. Re-run with --apply (npm run db:seed -- --apply).");
    return;
  }

  // ── Apply in one transaction (all or nothing) ──────────────────────────
  const typeIds = {};
  await prisma.$transaction(
    async (tx) => {
      for (const { extra, ...t } of roomTypes) {
        const data = { ...t, bedrooms: 1, bathrooms: 1, features: [...extra, ...commonFeatures] };
        const row = await tx.roomType.upsert({ where: { slug: t.slug }, create: data, update: data, select: { id: true } });
        typeIds[t.slug] = row.id;
      }
      for (const a of apartments) {
        const { roomTypeSlug, ...rest } = a;
        const data = { ...rest, roomTypeId: typeIds[roomTypeSlug] };
        await tx.room.upsert({ where: { number: a.number }, create: data, update: data });
      }
      for (const p of ratePlans) {
        await tx.ratePlan.upsert({ where: { code: p.code }, create: p, update: p });
      }
      await tx.seasonalRate.deleteMany({ where: { name: { in: seasons.map((s) => s.name) } } });
      await tx.seasonalRate.createMany({
        data: seasons.map((s) => ({ ...s, startDate: new Date(`${s.startDate}T00:00:00Z`), endDate: new Date(`${s.endDate}T00:00:00Z`) })),
      });
    },
    { timeout: 60_000 }
  );

  const counts = await prisma.room.groupBy({ by: ["roomTypeId"], _count: { _all: true } });
  console.log(`\nSeeded ${roomTypes.length} room types, ${apartments.length} apartments, ${ratePlans.length} rate plans, ${seasons.length} seasons.`);
  for (const [slug, id] of Object.entries(typeIds)) {
    console.log(`  ${slug.padEnd(24)} ${counts.find((c) => c.roomTypeId === id)?._count._all ?? 0} apartments`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
