import { z } from "zod";

// ─── Shared primitives ────────────────────────────────────────────────────────

const emailField = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .max(254, "Email address is too long.")
  .email("Please enter a valid email address.")
  .transform((v) => v.toLowerCase());

const newPasswordField = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(72, "Password must be 72 characters or fewer.");

// ─── Auth schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required.").max(200),
});

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or fewer."),
  email: emailField,
  password: newPasswordField,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: newPasswordField,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password.",
    path: ["newPassword"],
  });

export const verifyEmailSchema = z.object({
  email: emailField,
  code: z
    .string()
    .trim()
    .length(6, "Verification code must be exactly 6 digits.")
    .regex(/^\d{6}$/, "Verification code must contain only digits."),
});

export const resendVerificationSchema = z.object({
  email: emailField,
});

// ─── Booking schemas ──────────────────────────────────────────────────────────

export const createBookingSchema = z
  .object({
    propertyId: z.number().int("Invalid property ID.").positive("Invalid property ID."),
    checkIn: z.string().min(1, "Check-in date is required."),
    checkOut: z.string().min(1, "Check-out date is required."),
    guests: z
      .number()
      .int("Guests must be a whole number.")
      .min(1, "At least 1 guest is required.")
      .max(20, "Maximum 20 guests allowed."),
  })
  .refine(
    (data) => {
      const ci = new Date(data.checkIn);
      const co = new Date(data.checkOut);
      return !isNaN(ci.getTime()) && !isNaN(co.getTime()) && co > ci;
    },
    { message: "Check-out date must be after check-in date.", path: ["checkOut"] }
  );

// ─── Account schemas ──────────────────────────────────────────────────────────

export const updateAccountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name must be 100 characters or fewer."),
});

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Returns the first validation error message from a ZodError. */
export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid request data.";
}
