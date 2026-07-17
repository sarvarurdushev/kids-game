import { z } from "zod";

export const enrollSchema = z.object({
  code: z.string().min(4).max(64),
});

export const loginSchema = z.object({
  studentId: z.string().uuid(),
  pin: z.string().regex(/^\d{4,8}$/, "PIN must be 4-8 digits"),
});

export const switchSchema = z.object({
  studentId: z.string().uuid(),
});
