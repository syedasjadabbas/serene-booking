const prisma = require("../../config/prisma");
const { AppError } = require("../../lib/customError");
const { cached } = require("../../lib/cache");
const { quoteStay } = require("../../lib/pricing");
const { toDbDate, fromDbDate } = require("../../lib/dates");

const roomTypeSelect = {
  id: true,
  slug: true,
  name: true,
  tagline: true,
  description: true,
  bedrooms: true,
  bathrooms: true,
  bedType: true,
  outdoorSpace: true,
  maxAdults: true,
  maxChildren: true,
  maxOccupancy: true,
  baseRate: true,
  features: true,
  images: true,
  sortOrder: true,
};

const ratePlanSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  refundable: true,
  freeCancelHours: true,
  breakfastIncluded: true,
  breakfastPerGuest: true,
  discountPercent: true,
};

// Room types with inventory stats, aggregated in SQL. Cached: changes only when admin edits inventory.
function listRoomTypes() {
  return cached(
    "rooms:types:v1",
    async () => {
      const [types, stats] = await Promise.all([
        prisma.roomType.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: roomTypeSelect }),
        prisma.room.groupBy({
          by: ["roomTypeId"],
          where: { isActive: true },
          _count: { _all: true },
          _min: { areaSqft: true },
          _max: { areaSqft: true },
        }),
      ]);
      const byType = new Map(stats.map((s) => [s.roomTypeId, s]));
      return types.map((t) => {
        const s = byType.get(t.id);
        return { ...t, totalApartments: s?._count._all ?? 0, minAreaSqft: s?._min.areaSqft ?? null, maxAreaSqft: s?._max.areaSqft ?? null };
      });
    },
    { ttlMs: 60_000, staleMs: 600_000 }
  );
}

function listRatePlans() {
  return cached(
    "rooms:rateplans:v1",
    () => prisma.ratePlan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: ratePlanSelect }),
    { ttlMs: 60_000, staleMs: 600_000 }
  );
}

async function seasonalRatesFor(checkIn, checkOut) {
  const rows = await prisma.seasonalRate.findMany({
    where: { startDate: { lte: toDbDate(checkOut) }, endDate: { gte: toDbDate(checkIn) } },
    select: { roomTypeId: true, startDate: true, endDate: true, multiplierPct: true },
  });
  return rows.map((r) => ({ ...r, startDate: fromDbDate(r.startDate), endDate: fromDbDate(r.endDate) }));
}

// Free apartments per room type for [checkIn, checkOut). One grouped query, no rows loaded into JS.
async function availableCounts(checkIn, checkOut, roomTypeId) {
  const rows = roomTypeId
    ? await prisma.$queryRaw`
        SELECT r."roomTypeId" AS "roomTypeId", COUNT(*)::int AS available
        FROM "Room" r
        WHERE r."isActive" = true AND r."roomTypeId" = ${roomTypeId}
          AND NOT EXISTS (
            SELECT 1 FROM "BookingRoom" br
            WHERE br."roomId" = r.id AND br.active = true
              AND br."checkIn" < ${checkOut}::date AND br."checkOut" > ${checkIn}::date)
        GROUP BY r."roomTypeId"`
    : await prisma.$queryRaw`
        SELECT r."roomTypeId" AS "roomTypeId", COUNT(*)::int AS available
        FROM "Room" r
        WHERE r."isActive" = true
          AND NOT EXISTS (
            SELECT 1 FROM "BookingRoom" br
            WHERE br."roomId" = r.id AND br.active = true
              AND br."checkIn" < ${checkOut}::date AND br."checkOut" > ${checkIn}::date)
        GROUP BY r."roomTypeId"`;
  return new Map(rows.map((r) => [r.roomTypeId, r.available]));
}

function fitsParty(type, { adults, children, rooms }) {
  return adults <= type.maxAdults * rooms && children <= type.maxChildren * rooms && adults + children <= type.maxOccupancy * rooms;
}

async function searchAvailability(stay) {
  const [types, plans, seasonal, counts] = await Promise.all([
    listRoomTypes(),
    listRatePlans(),
    seasonalRatesFor(stay.checkIn, stay.checkOut),
    availableCounts(stay.checkIn, stay.checkOut),
  ]);

  const results = types.map((type) => {
    const available = counts.get(type.id) ?? 0;
    const quotes = plans.map((plan) => ({ ratePlanCode: plan.code, ...quoteStay({ roomType: type, ratePlan: plan, seasonalRates: seasonal, ...stay }) }));
    const cheapest = quotes.reduce((min, q) => (q.grandTotal < min.grandTotal ? q : min), quotes[0]);
    return {
      roomType: type,
      available,
      soldOut: available < stay.rooms,
      fitsParty: fitsParty(type, stay),
      lowestQuote: cheapest || null,
    };
  });

  return {
    stay,
    nights: results[0]?.lowestQuote?.nights ?? 0,
    results,
    summary: {
      roomTypes: results.length,
      bookable: results.filter((r) => !r.soldOut && r.fitsParty).length,
    },
  };
}

async function getRoomType(slug) {
  const types = await listRoomTypes();
  const type = types.find((t) => t.slug === slug);
  if (!type) throw new AppError(404, "We couldn't find that apartment type.", true, "ROOM_TYPE_NOT_FOUND");

  const [apartments, plans] = await Promise.all([
    cached(
      `rooms:apartments:${type.id}`,
      () =>
        prisma.room.findMany({
          where: { roomTypeId: type.id, isActive: true },
          orderBy: [{ floor: "asc" }, { number: "asc" }],
          select: { number: true, floor: true, floorLabel: true, areaSqft: true, outdoorSpace: true },
        }),
      { ttlMs: 60_000, staleMs: 600_000 }
    ),
    listRatePlans(),
  ]);

  const floors = [...new Map(apartments.map((a) => [a.floor, a.floorLabel])).entries()].map(([floor, label]) => ({ floor, label }));
  return { ...type, apartments, floors, ratePlans: plans };
}

async function getRates(slug, stay) {
  const types = await listRoomTypes();
  const type = types.find((t) => t.slug === slug);
  if (!type) throw new AppError(404, "We couldn't find that apartment type.", true, "ROOM_TYPE_NOT_FOUND");

  const [plans, seasonal, counts] = await Promise.all([
    listRatePlans(),
    seasonalRatesFor(stay.checkIn, stay.checkOut),
    availableCounts(stay.checkIn, stay.checkOut, type.id),
  ]);
  const available = counts.get(type.id) ?? 0;

  return {
    stay,
    roomType: { id: type.id, slug: type.slug, name: type.name, maxAdults: type.maxAdults, maxChildren: type.maxChildren, maxOccupancy: type.maxOccupancy },
    available,
    soldOut: available < stay.rooms,
    fitsParty: fitsParty(type, stay),
    rates: plans.map((plan) => ({ ratePlan: plan, quote: quoteStay({ roomType: type, ratePlan: plan, seasonalRates: seasonal, ...stay }) })),
  };
}

module.exports = { listRoomTypes, listRatePlans, seasonalRatesFor, availableCounts, fitsParty, searchAvailability, getRoomType, getRates };
