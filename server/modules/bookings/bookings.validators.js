const { z } = require("zod");
const { stayFields, refineStay } = require("../rooms/rooms.validators");

const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(160);
const reference = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^SH-[A-Z0-9]{6}$/, "Booking reference looks like SH-XXXXXX");

const createBookingSchema = refineStay(
  z.object({
    ...stayFields,
    roomTypeSlug: z.string().trim().min(1).max(80),
    ratePlanCode: z.string().trim().min(1).max(40),
    guest: z.object({
      firstName: z.string().trim().min(1, "First name is required").max(60),
      lastName: z.string().trim().min(1, "Last name is required").max(60),
      email,
      phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number"),
      country: z.string().trim().max(60).optional(),
    }),
    arrivalTime: z.string().trim().max(20).optional(),
    specialRequests: z.string().trim().max(500, "Special requests are limited to 500 characters").optional(),
    paymentMethod: z.enum(["PAY_AT_PROPERTY", "CARD", "BANK_TRANSFER"]),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: "Please accept the booking conditions" }) }),
  })
);

const referenceParams = z.object({ reference });

const lookupSchema = z.object({ reference, email });

const cancelSchema = z.object({
  email: email.optional(), // required for guest (not signed in) cancellations
  reason: z.string().trim().max(300).optional(),
});

const mineQuery = z.object({
  status: z.enum(["upcoming", "past", "cancelled"]).default("upcoming"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

module.exports = { createBookingSchema, referenceParams, lookupSchema, cancelSchema, mineQuery };
