import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { avatarItems, students, studentAvatarItems } from "@/lib/db/schema";
import { getLevelInfo } from "./levelInfo";
import { ServiceError } from "./errors";
import type { AuthedStudent } from "@/lib/auth/requireStudent";

type AvatarItemRow = typeof avatarItems.$inferSelect;

const SLOT_TO_EQUIPPED_COLUMN: Record<
  AvatarItemRow["slot"],
  keyof typeof students.$inferInsert
> = {
  hair: "equippedHairId",
  eyes: "equippedEyesId",
  clothes: "equippedClothesId",
  hat: "equippedHatId",
  accessory: "equippedAccessoryId",
  background: "equippedBackgroundId",
};

/** level_unlock items are implicitly owned once the student's level meets the
 * requirement — no grant row needed. Starter, achievement, and coin-purchase
 * items are only owned once a student_avatar_items row exists. */
function isOwned(item: AvatarItemRow, ownedIds: Set<string>, level: number): boolean {
  if (ownedIds.has(item.id)) return true;
  return item.acquisitionMethod === "level_unlock" && item.unlockLevel !== null && level >= item.unlockLevel;
}

export async function getAvatarItems(student: AuthedStudent) {
  const items = await db.select().from(avatarItems).where(eq(avatarItems.active, true));
  const owned = await db
    .select()
    .from(studentAvatarItems)
    .where(eq(studentAvatarItems.studentId, student.id));
  const ownedIds = new Set(owned.map((o) => o.avatarItemId));
  const { level } = await getLevelInfo(student.xpTotal);

  const equippedIds = new Set(
    [
      student.equippedHairId,
      student.equippedEyesId,
      student.equippedClothesId,
      student.equippedHatId,
      student.equippedAccessoryId,
      student.equippedBackgroundId,
    ].filter((id): id is string => Boolean(id))
  );

  return items.map((item) => {
    const owns = isOwned(item, ownedIds, level);
    let state: "owned" | "purchasable" | "locked" = "owned";
    let reason: string | null = null;
    let affordable = true;

    if (!owns) {
      if (item.acquisitionMethod === "coin_purchase") {
        state = "purchasable";
        affordable = item.coinPrice !== null && student.coinsBalance >= item.coinPrice;
      } else if (item.acquisitionMethod === "level_unlock") {
        state = "locked";
        reason = `Reach level ${item.unlockLevel}`;
      } else {
        state = "locked";
        reason = "Unlock the linked achievement first";
      }
    }

    return {
      id: item.id,
      slot: item.slot,
      key: item.key,
      name: item.name,
      imageUrl: item.imageUrl,
      rarity: item.rarity,
      coinPrice: item.coinPrice,
      state,
      reason,
      affordable,
      equipped: equippedIds.has(item.id),
    };
  });
}

export async function purchaseAvatarItem(studentId: string, avatarItemId: string) {
  return db.transaction(async (tx) => {
    const [item] = await tx
      .select()
      .from(avatarItems)
      .where(
        and(
          eq(avatarItems.id, avatarItemId),
          eq(avatarItems.active, true),
          eq(avatarItems.acquisitionMethod, "coin_purchase")
        )
      )
      .limit(1);
    if (!item || item.coinPrice === null) {
      throw new ServiceError("Item is not purchasable", 400);
    }

    // Lock the student row before checking ownership, so two concurrent
    // purchase requests (double-tap, two tabs) serialize here instead of
    // both passing the "not yet owned" check and racing to insert the same
    // (student, item) row.
    const [student] = await tx
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .for("update");

    const [existing] = await tx
      .select()
      .from(studentAvatarItems)
      .where(
        and(
          eq(studentAvatarItems.studentId, studentId),
          eq(studentAvatarItems.avatarItemId, avatarItemId)
        )
      )
      .limit(1);
    if (existing) throw new ServiceError("Already owned", 409);

    if (student.coinsBalance < item.coinPrice) {
      throw new ServiceError("Not enough coins", 402);
    }

    await tx
      .update(students)
      .set({ coinsBalance: student.coinsBalance - item.coinPrice, updatedAt: new Date() })
      .where(eq(students.id, studentId));
    await tx
      .insert(studentAvatarItems)
      .values({ studentId, avatarItemId, acquiredVia: "coin_purchase" });

    return { avatarItemId, coinsRemaining: student.coinsBalance - item.coinPrice };
  });
}

export async function equipAvatarItem(student: AuthedStudent, avatarItemId: string) {
  const [item] = await db
    .select()
    .from(avatarItems)
    .where(and(eq(avatarItems.id, avatarItemId), eq(avatarItems.active, true)))
    .limit(1);
  if (!item) throw new ServiceError("Avatar item not found", 404);

  const owned = await db
    .select()
    .from(studentAvatarItems)
    .where(
      and(
        eq(studentAvatarItems.studentId, student.id),
        eq(studentAvatarItems.avatarItemId, avatarItemId)
      )
    )
    .limit(1);
  const { level } = await getLevelInfo(student.xpTotal);
  if (!isOwned(item, new Set(owned.map((o) => o.avatarItemId)), level)) {
    throw new ServiceError("Item is not unlocked yet", 403);
  }

  const column = SLOT_TO_EQUIPPED_COLUMN[item.slot];
  await db
    .update(students)
    .set({ [column]: item.id, updatedAt: new Date() } as Partial<typeof students.$inferInsert>)
    .where(eq(students.id, student.id));

  return { slot: item.slot, avatarItemId: item.id };
}
