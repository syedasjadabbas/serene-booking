const prisma = require("../../config/prisma");
const env = require("../../config/env");
const { cached } = require("../../lib/cache");
const data = require("./property.data");

async function getProperty() {
  return cached(
    "property:v1",
    async () => {
      const [apartments, reviewAgg] = await Promise.all([
        prisma.room.count({ where: { isActive: true } }),
        prisma.review.aggregate({ where: { status: "PUBLISHED" }, _avg: { rating: true }, _count: { _all: true } }),
      ]);
      return {
        ...data,
        stats: {
          apartments,
          reviewCount: reviewAgg._count._all,
          averageRating: reviewAgg._avg.rating ? Number(reviewAgg._avg.rating.toFixed(1)) : null,
        },
      };
    },
    { ttlMs: 60_000, staleMs: 300_000 }
  );
}

const getPublicConfig = () => ({
  currency: env.currency,
  taxPercent: env.taxPercent,
  maxStayNights: env.maxStayNights,
  maxRoomsPerBooking: env.maxRoomsPerBooking,
  paymentsEnabled: env.paymentsEnabled,
  reviewsEnabled: env.reviewsEnabled,
  timezone: env.timezone,
});

module.exports = { getProperty, getPublicConfig };
