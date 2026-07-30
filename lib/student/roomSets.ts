import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { avatarItems, roomSets, students, studentAvatarItems } from "@/lib/db/schema";
import { ServiceError } from "./errors";
import { placeBestEffort } from "./roomPlacements";

function pieceIdsOf(set: typeof roomSets.$inferSelect): string[] {
  return [set.wallpaperItemId, set.floorItemId, set.furnitureItemId, set.furnitureSmallItemId, set.furnitureWallItemId].filter(
    (id): id is string => Boolean(id)
  );
}

export async function getRoomSetShop(studentId: string) {
  const sets = await db.select().from(roomSets).where(eq(roomSets.active, true));
  if (sets.length === 0) return [];

  const itemIds = [...new Set(sets.flatMap((s) => pieceIdsOf(s)))];
  const itemRows = await db.select().from(avatarItems).where(inArray(avatarItems.id, itemIds));
  const itemById = new Map(itemRows.map((i) => [i.id, i]));

  const owned = await db
    .select({ avatarItemId: studentAvatarItems.avatarItemId })
    .from(studentAvatarItems)
    .where(eq(studentAvatarItems.studentId, studentId));
  const ownedIds = new Set(owned.map((o) => o.avatarItemId));

  const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);

  return sets.map((set) => {
    const pieceIds = pieceIdsOf(set);
    return {
      id: set.id,
      key: set.key,
      name: set.name,
      coinPrice: set.coinPrice,
      wallpaperKey: itemById.get(set.wallpaperItemId)?.key ?? null,
      floorKey: itemById.get(set.floorItemId)?.key ?? null,
      furnitureKey: set.furnitureItemId ? itemById.get(set.furnitureItemId)?.key ?? null : null,
      furnitureSmallKey: set.furnitureSmallItemId ? itemById.get(set.furnitureSmallItemId)?.key ?? null : null,
      furnitureWallKey: set.furnitureWallItemId ? itemById.get(set.furnitureWallItemId)?.key ?? null : null,
      owned: pieceIds.every((id) => ownedIds.has(id)),
      affordable: student.coinsBalance >= set.coinPrice,
    };
  });
}

/** Buys every piece in the set (skipping any already owned individually) for
 * one bundle price, then equips all of them at once — a single tap gives a
 * finished, coordinated room instead of buying and equipping each slot one
 * at a time. Only equips the furniture slots the set actually includes;
 * an omitted slot (e.g. no large furniture in a starter bundle) is left
 * exactly as it was before the purchase. */
export async function purchaseRoomSet(studentId: string, roomSetId: string) {
  return db.transaction(async (tx) => {
    const [set] = await tx
      .select()
      .from(roomSets)
      .where(eq(roomSets.id, roomSetId))
      .limit(1);
    if (!set || !set.active) throw new ServiceError("Room set not found", 404);

    const [student] = await tx.select().from(students).where(eq(students.id, studentId)).for("update");

    const pieceIds = pieceIdsOf(set);
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

    const equipUpdates: Partial<typeof students.$inferInsert> = {
      coinsBalance: student.coinsBalance - set.coinPrice,
      equippedWallpaperId: set.wallpaperItemId,
      equippedFloorId: set.floorItemId,
      updatedAt: new Date(),
    };
    if (set.furnitureWallItemId) equipUpdates.equippedFurnitureWallId = set.furnitureWallItemId;

    await tx.update(students).set(equipUpdates).where(eq(students.id, studentId));

    // furniture/furniture_small are multi-select (room_placements) now, not
    // a single equipped column — best-effort place each piece the set
    // includes: if that category's already at the 3-item cap, skip it
    // silently rather than failing the whole purchase (the student still
    // owns the piece and can place it manually after freeing a slot).
    const furniturePieceIds = [set.furnitureItemId, set.furnitureSmallItemId].filter(
      (id): id is string => Boolean(id)
    );
    if (furniturePieceIds.length > 0) {
      const pieceItems = await tx.select().from(avatarItems).where(inArray(avatarItems.id, furniturePieceIds));
      for (const pieceItem of pieceItems) {
        await placeBestEffort(tx, studentId, pieceItem);
      }
    }

    return { roomSetId, coinsRemaining: student.coinsBalance - set.coinPrice };
  });
}
