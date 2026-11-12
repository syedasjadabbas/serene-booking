const { z } = require("zod");

const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(160);
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100)
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");
const name = (label) => z.string().trim().min(1, `${label} is required`).max(60);
const phone = z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid phone number");

const registerSchema = z.object({
  firstName: name("First name"),
  lastName: name("Last name"),
  email,
  phone: phone.optional(),
  password,
});

const loginSchema = z.object({ email, password: z.string().min(1, "Password is required").max(100) });

const updateProfileSchema = z.object({
  firstName: name("First name").optional(),
  lastName: name("Last name").optional(),
  phone: phone.nullable().optional(),
  country: z.string().trim().max(60).nullable().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: password,
});

module.exports = { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema };
