const prisma = require("../../config/prisma");
const env = require("../../config/env");
const { AppError } = require("../../lib/customError");
const { cached, invalidate } = require("../../lib/cache");
const { audit } = require("../../lib/audit");
const { todayInHotelTz, toDbDate } = require("../../lib/dates");
const { scoped } = require("../../lib/scope");

function list({ page, pageSize }) {
  return cached(
    `reviews:list:${page}:${pageSize}`,
    async () => {
      const where = { status: "PUBLISHED" };
      const [agg, distribution, rows] = await Promise.all([
        prisma.review.aggregate({ where, _avg: { rating: true }, _count: { _all: true } }),
        prisma.review.groupBy({ by: ["rating"], where, _count: { _all: true } }),
        prisma.review.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            rating: true,
            title: true,
            body: true,
            createdAt: true,
            customer: { select: { firstName: true, lastName: true, country: true } },
            booking: { select: { checkIn: true, nights: true, roomType: { select: { name: true } } } },
          },
        }),
      ]);
      return {
        summary: {
          total: agg._count._all,
          average: agg._avg.rating ? Number(agg._avg.rating.toFixed(1)) : null,
          distribution: [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: distribution.find((d) => d.rating === r)?._count._all ?? 0 })),
        },
        items: rows.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          body: r.body,
          createdAt: r.createdAt,
          // Privacy: first name + last initial only.
          author: `${r.customer.firstName} ${r.customer.lastName.charAt(0)}.`,
          country: r.customer.country,
          roomType: r.booking.roomType.name,
          stayedNights: r.booking.nights,
          stayedMonth: r.booking.checkIn.toISOString().slice(0, 7),
        })),
        page,
        pageSize,
        totalPages: Math.ceil(agg._count._all / pageSize),
      };
    },
    { ttlMs: 30_000, staleMs: 300_000 }
  );
}

async function create(customerId, input, meta) {
  if (!env.reviewsEnabled) throw new AppError(403, "Reviews are not open yet.", true, "REVIEWS_DISABLED");
  // Only the customer's own bookings are reviewable (shared data scope).
  const booking = await prisma.booking.findFirst({
    where: scoped({ customerId }, { reference: input.bookingReference }),
    select: { id: true, status: true, checkOut: true, review: { select: { id: true } } },
  });
  if (!booking) throw new AppError(404, "Booking not found.", true, "BOOKING_NOT_FOUND");
  if (booking.status === "CANCELLED" || booking.status === "NO_SHOW") throw new AppError(400, "Only completed stays can be reviewed.", true, "NOT_REVIEWABLE");
  if (booking.checkOut > toDbDate(todayInHotelTz())) throw new AppError(400, "You can review your stay after check-out.", true, "NOT_REVIEWABLE");
  if (booking.review) throw new AppError(409, "You've already reviewed this stay.", true, "ALREADY_REVIEWED");

  const review = await prisma.review.create({
    data: { bookingId: booking.id, customerId, rating: input.rating, title: input.title, body: input.body },
    select: { id: true, rating: true, title: true, createdAt: true },
  });
  audit({ actorType: "customer", actorId: customerId, action: "review.create", entity: "Review", entityId: review.id, ip: meta.ip });
  await Promise.all([invalidate("reviews:"), invalidate("property:")]);
  return review;
}

module.exports = { list, create };
