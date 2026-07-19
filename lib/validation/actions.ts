import { z } from "zod";

export const equipAvatarItemSchema = z.object({
  avatarItemId: z.string().uuid(),
});

export const completeGameSessionSchema = z
  .object({
    score: z.number().int().min(0).max(100000),
    correctCount: z.number().int().min(0).max(30),
    totalCount: z.number().int().min(1).max(30),
  })
  .refine((data) => data.correctCount <= data.totalCount, {
    message: "correctCount cannot exceed totalCount",
    path: ["correctCount"],
  });

export const purchaseAvatarItemSchema = z.object({
  avatarItemId: z.string().uuid(),
});

export const purchasePackSchema = z.object({
  packTypeId: z.string().uuid(),
});

export const purchaseCaseSchema = z.object({
  caseTypeId: z.string().uuid(),
});
