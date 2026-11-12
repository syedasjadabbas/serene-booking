const crypto = require("crypto");
const prisma = require("../../config/prisma");
const env = require("../../config/env");
const { AppError } = require("../../lib/customError");
const { audit } = require("../../lib/audit");
const { quoteStay } = require("../../lib/pricing");
const { toDbDate, fromDbDate, todayInHotelTz } = require("../../lib/dates");
const { invalidate } = require("../../lib/cache");
const rooms = require("../rooms/rooms.service");
const property = require("../property/property.data");

const CHECK_IN_HOUR_PKT = 14; // matches the published check-in time
const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const newReference = () => {
  const bytes = crypto.randomBytes(6);
  return "SH-" + Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("");
};

const bookingSelect = {
  id: true,
  reference: true,
  customerId: true,
  checkIn: true,
  checkOut: true,
  nights: true,
  roomsCount: true,
  adults: true,
  children: true,
  status: true,
  guestFirstName: true,
  guestLastName: true,
  guestEmail: true,
  guestPhone: true,
  guestCountry: true,
  arrivalTime: true,
  specialRequests: true,
  currency: true,
  roomSubtotal: true,
  discountTotal: true,
  breakfastTotal: true,
  taxTotal: true,
  grandTotal: true,
  nightlyBreakdown: true,
  paymentMethod: true,
  paymentStatus: true,
  cancelledAt: true,
  createdAt: true,
  roomType: { select: { slug: true, name: true, images: true, bedType: true, outdoorSpace: true } },
  ratePlan: { select: { code: true, name: true, refundable: true, freeCancelHours: true, breakfastIncluded: true } },
  review: { select: { id: true } },
};

const checkInInstant = (isoDate) => new Date(`${isoDate}T${String(CHECK_IN_HOUR_PKT).padStart(2, "0")}:00:00+05:00`);

// Shape returned to the browser. Apartment numbers are assigned at check-in, so they are not exposed.
function toPublic(b) {
  const checkIn = fromDbDate(b.checkIn);
  const checkOut = fromDbDate(b.checkOut);
  const today = todayInHotelTz();
  const now = new Date();

  const freeCancellationUntil =
    b.ratePlan.refundable && b.ratePlan.freeCancelHours != null
      ? new Date(checkInInstant(checkIn).getTime() - b.ratePlan.freeCancelHours * 3600_000)
      : null;

  const isActive = b.status === "CONFIRMED";
  const stayOver = checkOut <= today;
  const displayStatus = isActive && stayOver ? "COMPLETED" : b.status;

  return {
    reference: b.reference,
    status: b.status,
    displayStatus,
    checkIn,
    checkOut,
    nights: b.nights,
    rooms: b.roomsCount,
    adults: b.adults,
    children: b.children,
    guest: { firstName: b.guestFirstName, lastName: b.guestLastName, email: b.guestEmail, phone: b.guestPhone, country: b.guestCountry },
    arrivalTime: b.arrivalTime,
    specialRequests: b.specialRequests,
    roomType: { slug: b.roomType.slug, name: b.roomType.name, image: b.roomType.images[0] || null, bedType: b.roomType.bedType, outdoorSpace: b.roomType.outdoorSpace },
    ratePlan: b.ratePlan,
    price: {
      currency: b.currency,
      roomSubtotal: b.roomSubtotal,
      discountTotal: b.discountTotal,
      breakfastTotal: b.breakfastTotal,
      taxTotal: b.taxTotal,
      grandTotal: b.grandTotal,
      nightly: b.nightlyBreakdown,
    },
    payment: { method: b.paymentMethod, status: b.paymentStatus },
    freeCancellationUntil,
    canCancel: isActive && checkIn > today,
    cancelIsFree: Boolean(freeCancellationUntil && now < freeCancellationUntil),
    canReview: env.reviewsEnabled && Boolean(b.customerId) && displayStatus === "COMPLETED" && !b.review,
    cancelledAt: b.cancelledAt,
    createdAt: b.createdAt,
    property: { name: property.name, address: property.address, phone: property.contact.phone, checkIn: property.policies.checkIn, checkOut: property.policies.checkOut },
  };
}

const isOverlapViolation = (err) => /booking_room_no_overlap|23P01/.test(String(err?.message) + String(err?.meta?.code || ""));

async function createBooking(input, auth, meta) {
  const [types, plans] = await Promise.all([rooms.listRoomTypes(), rooms.listRatePlans()]);
  const type = types.find((t) => t.slug === input.roomTypeSlug);
  if (!type) throw new AppError(404, "That apartment type is no longer available.", true, "ROOM_TYPE_NOT_FOUND");
  const plan = plans.find((p) => p.code === input.ratePlanCode);
  if (!plan) throw new AppError(400, "That rate is no longer available. Please choose another.", true, "RATE_PLAN_NOT_FOUND");
  if (!rooms.fitsParty(type, input)) {
    throw new AppError(400, `${type.name} sleeps up to ${type.maxOccupancy} guests per apartment. Add another apartment or choose a larger type.`, true, "OVER_CAPACITY");
  }
  if (input.paymentMethod !== "PAY_AT_PROPERTY" && !env.paymentsEnabled) {
    throw new AppError(400, "Online payment isn't available yet. Please choose pay at the property.", true, "PAYMENTS_DISABLED");
  }

  const seasonal = await rooms.seasonalRatesFor(input.checkIn, input.checkOut);
  const quote = quoteStay({ roomType: type, ratePlan: plan, seasonalRates: seasonal, ...input });

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const created = await prisma.$transaction(async (tx) => {
        // Lock free apartments of this type. SKIP LOCKED lets parallel bookings take different apartments.
        const free = await tx.$queryRaw`
          SELECT r.id FROM "Room" r
          WHERE r."roomTypeId" = ${type.id} AND r."isActive" = true
            AND NOT EXISTS (
              SELECT 1 FROM "BookingRoom" br
              WHERE br."roomId" = r.id AND br.active = true
                AND br."checkIn" < ${input.checkOut}::date AND br."checkOut" > ${input.checkIn}::date)
          ORDER BY r.floor, r.number
          LIMIT ${input.rooms}
          FOR UPDATE SKIP LOCKED`;
        if (free.length < input.rooms) {
          throw new AppError(409, `Sorry, ${type.name} just sold out for these dates. Please try other dates or another apartment type.`, true, "SOLD_OUT");
        }

        const booking = await tx.booking.create({
          data: {
            reference: newReference(),
            customerId: auth?.customerId ?? null,
            roomTypeId: type.id,
            ratePlanId: plan.id,
            checkIn: toDbDate(input.checkIn),
            checkOut: toDbDate(input.checkOut),
            nights: quote.nights,
            roomsCount: input.rooms,
            adults: input.adults,
            children: input.children,
            guestFirstName: input.guest.firstName,
            guestLastName: input.guest.lastName,
            guestEmail: input.guest.email,
            guestPhone: input.guest.phone,
            guestCountry: input.guest.country,
            arrivalTime: input.arrivalTime,
            specialRequests: input.specialRequests,
            currency: quote.currency,
            roomSubtotal: quote.roomSubtotal,
            discountTotal: quote.discountTotal,
            breakfastTotal: quote.breakfastTotal,
            taxTotal: quote.taxTotal,
            grandTotal: quote.grandTotal,
            nightlyBreakdown: quote.nightly,
            paymentMethod: input.paymentMethod,
            bookingRooms: {
              create: free.map((r) => ({ roomId: r.id, checkIn: toDbDate(input.checkIn), checkOut: toDbDate(input.checkOut) })),
            },
          },
          select: bookingSelect,
        });

        await tx.outbox.create({
          data: { topic: "booking.created", payload: { reference: booking.reference, roomIds: free.map((r) => r.id) } },
        });
        return booking;
      });

      audit({ actorType: auth ? "customer" : "guest", actorId: auth?.customerId, action: "booking.create", entity: "Booking", entityId: created.id, ip: meta.ip });
      await invalidate("property:");
      return toPublic(created);
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (err?.code === "P2002" && attempt < 2) continue; // reference collision: retry with a new one
      if (isOverlapViolation(err)) {
        throw new AppError(409, `Sorry, ${type.name} just sold out for these dates. Please try again.`, true, "SOLD_OUT");
      }
      throw err;
    }
  }
  throw new AppError(500, "We couldn't create your booking. Please try again.", true, "BOOKING_FAILED");
}

async function listMine(customerId, { status, page, pageSize }) {
  const today = toDbDate(todayInHotelTz());
  const where =
    status === "upcoming"
      ? { customerId, status: "CONFIRMED", checkOut: { gt: today } }
      : status === "past"
        ? { customerId, OR: [{ status: { in: ["COMPLETED", "NO_SHOW"] } }, { status: "CONFIRMED", checkOut: { lte: today } }] }
        : { customerId, status: "CANCELLED" };

  const [total, rows] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      orderBy: { checkIn: status === "upcoming" ? "asc" : "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: bookingSelect,
    }),
  ]);
  return { items: rows.map(toPublic), page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

async function getMine(customerId, reference) {
  const b = await prisma.booking.findUnique({ where: { reference }, select: bookingSelect });
  if (!b || b.customerId !== customerId) throw new AppError(404, "Booking not found.", true, "BOOKING_NOT_FOUND");
  return toPublic(b);
}

// Guests without an account prove ownership with reference + the email used to book.
async function lookup({ reference, email }, meta) {
  const b = await prisma.booking.findUnique({ where: { reference }, select: bookingSelect });
  if (!b || b.guestEmail !== email) {
    audit({ actorType: "guest", action: "booking.lookup_failed", ip: meta.ip, meta: { reference } });
    throw new AppError(404, "We couldn't find a booking with that reference and email.", true, "BOOKING_NOT_FOUND");
  }
  return toPublic(b);
}

async function cancel(reference, { auth, email, reason }, meta) {
  const b = await prisma.booking.findUnique({ where: { reference }, select: bookingSelect });
  const owns = b && ((auth && b.customerId === auth.customerId) || (email && b.guestEmail === email));
  if (!owns) throw new AppError(404, "Booking not found.", true, "BOOKING_NOT_FOUND");

  const view = toPublic(b);
  if (!view.canCancel) throw new AppError(400, "This booking can no longer be cancelled online. Please contact the front desk.", true, "CANNOT_CANCEL");

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.booking.update({
      where: { id: b.id },
      data: { status: "CANCELLED", cancelledAt: new Date(), cancelReason: reason },
      select: bookingSelect,
    });
    await tx.bookingRoom.updateMany({ where: { bookingId: b.id }, data: { active: false } });
    await tx.outbox.create({ data: { topic: "booking.cancelled", payload: { reference, free: view.cancelIsFree } } });
    return row;
  });

  audit({ actorType: auth ? "customer" : "guest", actorId: auth?.customerId, action: "booking.cancel", entity: "Booking", entityId: b.id, ip: meta.ip, meta: { free: view.cancelIsFree } });
  return toPublic(updated);
}

module.exports = { createBooking, listMine, getMine, lookup, cancel, toPublic };
