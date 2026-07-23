import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { avatarItems, roomSets, students, studentAvatarItems } from "@/lib/db/schema";
import { ServiceError } from "./errors";

export async function getRoomSetShop(studentId: string) {
  const sets = await db.select().from(roomSets).where(eq(roomSets.active, true));
  if (sets.length === 0) return [];

  const itemIds = [...new Set(sets.flatMap((s) => [s.wallpaperItemId, s.floorItemId, s.furnitureItemId]))];
  const itemRows = await db.select().from(avatarItems).where(inArray(avatarItems.id, itemIds));
  const itemById = new Map(itemRows.map((i) => [i.id, i]));

  const owned = await db
    .select({ avatarItemId: studentAvatarItems.avatarItemId })
    .from(studentAvatarItems)
    .where(eq(studentAvatarItems.studentId, studentId));
  const ownedIds = new Set(owned.map((o) => o.avatarItemId));

  const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);

  return sets.map((set) => {
    const pieceIds = [set.wallpaperItemId, set.floorItemId, set.furnitureItemId];
    return {
      id: set.id,
      key: set.key,
      name: set.name,
      coinPrice: set.coinPrice,
      wallpaperKey: itemById.get(set.wallpaperItemId)?.key ?? null,
      floorKey: itemById.get(set.floorItemId)?.key ?? null,
      furnitureKey: itemById.get(set.furnitureItemId)?.key ?? null,
      owned: pieceIds.every((id) => ownedIds.has(id)),
      affordable: student.coinsBalance >= set.coinPrice,
    };
  });
}

/** Buys every piece in the set (skipping any already owned individually) for
 * one bundle price, then equips all three at once — a single tap gives a
 * finished, coordinated room instead of three separate slot-by-slot buys. */
export async function purchaseRoomSet(studentId: string, roomSetId: string) {
  return db.transaction(async (tx) => {
    const [set] = await tx
      .select()
      .from(roomSets)
      .where(eq(roomSets.id, roomSetId))
      .limit(1);
    if (!set || !set.active) throw new ServiceError("Room set not found", 404);

    const [student] = await tx.select().from(students).where(eq(students.id, studentId)).for("update");

    const pieceIds = [set.wallpaperItemId, set.floorItemId, set.furnitureItemId];
    const owned = await tx
      .select()
      .from(studentAvatarItems)
      .where(eq(studentAvatarItems.studentId, studentId));
    const ownedIds = new Set(owned.map((o) => o.avatarItemId));
    if (pieceIds.every((id) => ownedIds.has(id))) {
      throw new ServiceError("Already owned", 409);
    }
    if (student.coinsBalance < set.coinPrice) {
      throw new ServiceError("Not enough coins", 402);
    }

    const missingIds = pieceIds.filter((id) => !ownedIds.has(id));
    if (missingIds.length > 0) {
      await tx
        .insert(studentAvatarItems)
        .values(missingIds.map((avatarItemId) => ({ studentId, avatarItemId, acquiredVia: "coin_purchase" as const })));
    }

    await tx
      .update(students)
      .set({
        coinsBalance: student.coinsBalance - set.coinPrice,
        equippedWallpaperId: set.wallpaperItemId,
        equippedFloorId: set.floorItemId,
        equippedFurnitureId: set.furnitureItemId,
        updatedAt: new Date(),
      })
      .where(eq(students.id, studentId));

    return { roomSetId, coinsRemaining: student.coinsBalance - set.coinPrice };
  });
}
