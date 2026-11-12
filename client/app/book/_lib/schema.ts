import { z } from "zod";

// Same shape and rules as the server's createBookingSchema (guest + extras).
export const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(160),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number"),
  country: z.string().trim().max(60).optional(),
  arrivalTime: z.string().max(20).optional(),
  specialRequests: z.string().trim().max(500, "Special requests are limited to 500 characters").optional(),
  paymentMethod: z.enum(["PAY_AT_PROPERTY", "CARD", "BANK_TRANSFER"]),
  acceptTerms: z.boolean().refine((v) => v, "Please accept the booking conditions"),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const ARRIVAL_TIMES = ["I don't know", "2:00 – 3:00 PM", "3:00 – 4:00 PM", "4:00 – 5:00 PM", "5:00 – 6:00 PM", "6:00 – 8:00 PM", "8:00 – 10:00 PM", "After 10:00 PM"];
