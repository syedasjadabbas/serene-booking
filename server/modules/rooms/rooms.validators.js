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

// Date-picker window: at most ~2 months, today or later.
const calendarQuery = z
  .object({
    from: isoDate("From"),
    to: isoDate("To"),
    roomType: z.string().trim().regex(/^[a-z0-9-]+$/).max(80).optional(),
  })
  .refine((q) => q.to >= q.from, { message: "'to' must be on or after 'from'", path: ["to"] })
  .refine((q) => nightsBetween(q.from, q.to) <= 70, { message: "Calendar window is limited to 70 days", path: ["to"] })
  .transform((q) => ({ ...q, from: q.from < todayInHotelTz() ? todayInHotelTz() : q.from }))
  .refine((q) => q.to >= q.from, { message: "Calendar window is in the past", path: ["to"] });

const slugParams =z.object({ slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/, "Invalid room") });

module.exports = { stayFields, refineStay, staySchema, slugParams, calendarQuery };
