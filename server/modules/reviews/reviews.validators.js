const { z } = require("zod");

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(30).default(6),
});

const createReviewSchema = z.object({
  bookingReference: z.string().trim().toUpperCase().regex(/^SH-[A-Z0-9]{6}$/, "Invalid booking reference"),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(3, "Add a short title").max(80),
  body: z.string().trim().min(20, "Tell us a little more (at least 20 characters)").max(1500),
});

module.exports = { listQuery, createReviewSchema };
