const { z } = require("zod");
const env = require("../../config/env");
const { isValidIsoDate, todayInHotelTz, nightsBetween } = require("../../lib/dates");

const isoDate = (label) => z.string().refine(isValidIsoDate, `${label} must be a valid date (YYYY-MM-DD)`);

// Shared shape for any "stay" (search, rates, booking). Exported for the bookings module.
const stayFields = {
  checkIn: isoDate("Check-in"),
  checkOut: isoDate("Check-out"),
  adults: z.coerce.number().int().min(1, "At least 1 adult is required").max(20),
  children: z.coerce.number().int().min(0).max(20).default(0),
  rooms: z.coerce.number().int().min(1).max(env.maxRoomsPerBooking, `You can book up to ${env.maxRoomsPerBooking} apartments at once`).default(1),
};

const refineStay = (schema) =>
  schema
    .refine((s) => s.checkIn >= todayInHotelTz(), { message: "Check-in can't be in the past", path: ["checkIn"] })
    .refine((s) => s.checkOut > s.checkIn, { message: "Check-out must be after check-in", path: ["checkOut"] })
    .refine((s) => nightsBetween(s.checkIn, s.checkOut) <= env.maxStayNights, {
      message: `Stays are limited to ${env.maxStayNights} nights online. Please contact us for longer stays.`,
      path: ["checkOut"],
    })
    .refine((s) => s.adults >= s.rooms, { message: "Each apartment needs at least one adult", path: ["adults"] });

const staySchema = refineStay(z.object(stayFields));

const slugParams = z.object({ slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/, "Invalid room") });

module.exports = { stayFields, refineStay, staySchema, slugParams };
