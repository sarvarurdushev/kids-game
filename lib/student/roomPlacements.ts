import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { avatarItems, students, studentAvatarItems, roomPlacements } from "@/lib/db/schema";
import { getLevelInfo } from "./levelInfo";
import { ServiceError } from "./errors";
import { isOwned } from "./avatar";

// Display spots per category — each gets its own independent 0..N position
// range, matching the length of RoomScene3D's FURNITURE_LARGE_POSITIONS/
// FURNITURE_SMALL_POSITIONS arrays. Big furniture got a 4th slot after the
// room itself was widened to fit it without crowding; small stayed at 3.
export const ROOM_PLACEMENT_CAP: Record<PlaceableSlot, number> = {
  furniture: 4,
  furniture_small: 3,
};

type AvatarItemRow = typeof avatarItems.$inferSelect;
type PlaceableSlot = "furniture" | "furniture_small";

function isPlaceableSlot(slot: string): slot is PlaceableSlot {
  return slot === "furniture" || slot === "furniture_small";
}

/** The executor type db.transaction()'s callback receives. Exported so a
 * caller that's already inside its own transaction (purchaseRoomSet in
 * lib/student/roomSets.ts) can pass its `tx` straight into placeIfRoom
 * instead of opening a second, independent db.transaction() — a nested
 * transaction on a fresh connection wouldn't see the outer transaction's
 * not-yet-committed ownership grant under Postgres's default READ COMMITTED
 * isolation. */
export type RoomPlacementTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Currently-placed item *keys* (not ids) per room-placement slot, ordered by
 * position — this is what RoomScene3D/AvatarEquippedKeys render from. */
export async function getRoomPlacements(
  studentId: string
): Promise<{ furniture: string[]; furniture_small: string[] }> {
  const rows = await db
    .select({ slot: roomPlacements.slot, key: avatarItems.key })
    .from(roomPlacements)
    .innerJoin(avatarItems, eq(roomPlacements.avatarItemId, avatarItems.id))
    .where(eq(roomPlacements.studentId, studentId))
    .orderBy(asc(roomPlacements.position));

  const result: { furniture: string[]; furniture_small: string[] } = { furniture: [], furniture_small: [] };
  for (const row of rows) {
    if (isPlaceableSlot(row.slot)) result[row.slot].push(row.key);
  }
  return result;
}

/** Places an already-owned item at the lowest free spot in its slot, against
 * any executor (plain `db` or an in-flight `tx`). No ownership check — every
 * caller has either just verified it (placeItem below) or just granted it
 * (purchaseRoomSet). Idempotent (a re-placement of an already-placed item is
 * a no-op success, not an error) and never throws on a full category —
 * returns "full" so callers can decide error-vs-best-effort-skip for
 * themselves. */
async function placeIfRoom(
  executor: RoomPlacementTx,
  studentId: string,
  item: AvatarItemRow
): Promise<{ status: "placed" | "already-placed"; slot: string; position: number } | { status: "full" }> {
  if (!isPlaceableSlot(item.slot)) {
    throw new Error(`placeIfRoom called with non-placeable slot "${item.slot}"`);
  }

  const existing = await executor
    .select()
    .from(roomPlacements)
    .where(and(eq(roomPlacements.studentId, studentId), eq(roomPlacements.slot, item.slot)));

  const already = existing.find((p) => p.avatarItemId === item.id);
  if (already) return { status: "already-placed", slot: item.slot, position: already.position };

  const takenPositions = new Set(existing.map((p) => p.position));
  let position = -1;
  for (let i = 0; i < ROOM_PLACEMENT_CAP[item.slot]; i++) {
    if (!takenPositions.has(i)) {
      position = i;
      break;
    }
  }
  if (position === -1) return { status: "full" };

  await executor.insert(roomPlacements).values({ studentId, avatarItemId: item.id, slot: item.slot, position });
  return { status: "placed", slot: item.slot, position };
}

/** purchaseRoomSet's best-effort hook: place a just-granted piece if there's
 * room, silently leave it un-placed (still owned, placeable manually later)
 * if the category's already full. Returns nothing — callers that want to
 * know what happened should read room_placements themselves afterward. */
export async function placeBestEffort(executor: RoomPlacementTx, studentId: string, item: AvatarItemRow): Promise<void> {
  await placeIfRoom(executor, studentId, item);
}

/** Transactional, row-locks the student (same pattern as purchaseAvatarItem/
 * equipAvatarItem in lib/student/avatar.ts) so two concurrent placement
 * requests can't both land in the same spot or blow past the 3-item cap. */
export async function placeItem(studentId: string, avatarItemId: string): Promise<{ slot: string; position: number }> {
  return db.transaction(async (tx) => {
    const [item] = await tx
      .select()
      .from(avatarItems)
      .where(and(eq(avatarItems.id, avatarItemId), eq(avatarItems.active, true)))
      .limit(1);
    if (!item) throw new ServiceError("Avatar item not found", 404);
    if (!isPlaceableSlot(item.slot)) {
      throw new ServiceError("Not a room-placement item", 400);
    }

    const [student] = await tx.select().from(students).where(eq(students.id, studentId)).for("update");
    if (!student) throw new ServiceError("Student not found", 404);

    const owned = await tx
      .select()
      .from(studentAvatarItems)
      .where(eq(studentAvatarItems.studentId, studentId));
    const ownedIds = new Set(owned.map((o) => o.avatarItemId));
    const { level } = await getLevelInfo(student.xpTotal);
    if (!isOwned(item, ownedIds, level, student.isAdmin)) {
      throw new ServiceError("Item is not unlocked yet", 403);
    }

    const result = await placeIfRoom(tx, studentId, item);
    if (result.status === "full") {
      throw new ServiceError("Room is full for this — remove something first", 409);
    }
    if (result.status === "already-placed") {
      throw new ServiceError("Already placed", 409);
    }
    return { slot: result.slot, position: result.position };
  });
}

/** Removing something that isn't placed is a no-op, not a failure. */
export async function removeItem(studentId: string, avatarItemId: string): Promise<void> {
  await db
    .delete(roomPlacements)
    .where(and(eq(roomPlacements.studentId, studentId), eq(roomPlacements.avatarItemId, avatarItemId)));
}
