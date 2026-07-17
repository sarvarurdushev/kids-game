import { z } from "zod";

export const enrollSchema = z.object({
  // Normalize case/whitespace so a code copy-pasted or retyped with
  // different casing (very plausible from a parent's phone) still matches.
  code: z
    .string()
    .trim()
    .min(4)
    .max(64)
    .transform((value) => value.toUpperCase()),
});

export const loginSchema = z.object({
  studentId: z.string().uuid(),
  pin: z.string().regex(/^\d{4,8}$/, "PIN must be 4-8 digits"),
});
