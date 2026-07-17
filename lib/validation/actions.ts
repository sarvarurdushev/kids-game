import { z } from "zod";

export const equipAvatarItemSchema = z.object({
  avatarItemId: z.string().uuid(),
});

export const purchaseAvatarItemSchema = z.object({
  avatarItemId: z.string().uuid(),
});

export const purchasePackSchema = z.object({
  packTypeId: z.string().uuid(),
});
