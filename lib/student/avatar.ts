import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { avatarItems, students, studentAvatarItems } from "@/lib/db/schema";
import { getLevelInfo } from "./levelInfo";
import { ServiceError } from "./errors";
import { discountedPrice, featuredKeysFor } from "@/lib/shop/weeklyRotation";
import type { AuthedStudent } from "@/lib/auth/requireStudent";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";

type AvatarItemRow = typeof avatarItems.$inferSelect;

const SLOT_TO_EQUIPPED_COLUMN: Record<
  AvatarItemRow["slot"],
  keyof typeof students.$inferInsert
> = {
  species: "equippedSpeciesId",
  hair: "equippedHairId",
  eyes: "equippedEyesId",
  clothes: "equippedClothesId",
  hat: "equippedHatId",
  accessory: "equippedAccessoryId",
  background: "equippedBackgroundId",
  wallpaper: "equippedWallpaperId",
  floor: "equippedFloorId",
  furniture: "equippedFurnitureId",
};

/** level_unlock items are implicitly owned once the student's level meets the
 * requirement — no grant row needed. Starter, achievement, and coin-purchase
 * items are only owned once a student_avatar_items row exists. The admin
 * login (students.isAdmin) owns every species outright - this is the one
 * place that's decided, so both the list view (getAvatarItems) and the
 * actual equip action (equipAvatarItem) agree with each other. */
function isOwned(item: AvatarItemRow, ownedIds: Set<string>, level: number, isAdmin: boolean): boolean {
  if (isAdmin && item.slot === "species") return true;
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
      student.equippedSpeciesId,
      student.equippedHairId,
      student.equippedEyesId,
      student.equippedClothesId,
      student.equippedHatId,
      student.equippedAccessoryId,
      student.equippedBackgroundId,
      student.equippedWallpaperId,
      student.equippedFloorId,
      student.equippedFurnitureId,
    ].filter((id): id is string => Boolean(id))
  );

  // The weekly "Featured" rotation is derived from the ISO week alone (see
  // lib/shop/weeklyRotation.ts) — no table, no cron — so every student sees
  // the same featured set for the whole week, stable across reloads.
  const coinPurchaseKeys = items
    .filter((item) => item.acquisitionMethod === "coin_purchase")
    .map((item) => item.key);
  const featuredKeys = new Set(featuredKeysFor(coinPurchaseKeys, new Date()));

  return items.map((item) => {
    const owns = isOwned(item, ownedIds, level, student.isAdmin);
    const featured = item.acquisitionMethod === "coin_purchase" && featuredKeys.has(item.key);
    const effectivePrice =
      item.coinPrice === null ? null : featured ? discountedPrice(item.coinPrice) : item.coinPrice;
    let state: "owned" | "purchasable" | "locked" = "owned";
    let reason: string | null = null;
    let affordable = true;

    if (!owns) {
      if (item.acquisitionMethod === "coin_purchase") {
        state = "purchasable";
        affordable = effectivePrice !== null && student.coinsBalance >= effectivePrice;
      } else if (item.acquisitionMethod === "level_unlock") {
        state = "locked";
        reason = `Reach level ${item.unlockLevel}`;
      } else if (item.acquisitionMethod === "case_unlock") {
        state = "locked";
        reason = "Open a case to find this!";
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
      featured,
      effectivePrice,
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

    // The client only ever sends an item id, never a price — the discount is
    // authoritative here, recomputed from the same deterministic weekly
    // rotation getAvatarItems uses, so a tampered request can't buy below
    // the real (possibly discounted) price.
    const coinPurchaseItems = await tx
      .select({ key: avatarItems.key })
      .from(avatarItems)
      .where(and(eq(avatarItems.active, true), eq(avatarItems.acquisitionMethod, "coin_purchase")));
    const featuredKeys = new Set(
      featuredKeysFor(coinPurchaseItems.map((i) => i.key), new Date())
    );
    const price = featuredKeys.has(item.key) ? discountedPrice(item.coinPrice) : item.coinPrice;

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

    if (student.coinsBalance < price) {
      throw new ServiceError("Not enough coins", 402);
    }

    await tx
      .update(students)
      .set({ coinsBalance: student.coinsBalance - price, updatedAt: new Date() })
      .where(eq(students.id, studentId));
    await tx
      .insert(studentAvatarItems)
      .values({ studentId, avatarItemId, acquiredVia: "coin_purchase" });

    return { avatarItemId, coinsRemaining: student.coinsBalance - price };
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
    .where(eq(studentAvatarItems.studentId, student.id));
  const ownedIds = new Set(owned.map((o) => o.avatarItemId));
  const { level } = await getLevelInfo(student.xpTotal);
  if (!isOwned(item, ownedIds, level, student.isAdmin)) {
    throw new ServiceError("Item is not unlocked yet", 403);
  }

  const updates: Record<string, string | Date> = { updatedAt: new Date() };
  updates[SLOT_TO_EQUIPPED_COLUMN[item.slot]] = item.id;

  // A character bundled with an outfit (avatarItems.bundledItemKeys) auto-
  // equips that outfit alongside it, so picking e.g. "Ninja Fox" doesn't
  // leave you wearing whatever hat you had on before.
  if (item.bundledItemKeys && item.bundledItemKeys.length > 0) {
    const bundled = await db
      .select()
      .from(avatarItems)
      .where(inArray(avatarItems.key, item.bundledItemKeys));
    for (const b of bundled) {
      if (b.active && ownedIds.has(b.id)) {
        updates[SLOT_TO_EQUIPPED_COLUMN[b.slot]] = b.id;
      }
    }
  }

  await db
    .update(students)
    .set(updates as Partial<typeof students.$inferInsert>)
    .where(eq(students.id, student.id));

  return { slot: item.slot, avatarItemId: item.id };
}

type EquippedIdRow = Pick<
  typeof students.$inferSelect,
  | "id"
  | "equippedSpeciesId"
  | "equippedHairId"
  | "equippedEyesId"
  | "equippedClothesId"
  | "equippedHatId"
  | "equippedAccessoryId"
  | "equippedBackgroundId"
  | "equippedWallpaperId"
  | "equippedFloorId"
  | "equippedFurnitureId"
>;

function resolveEquippedKeys(row: EquippedIdRow, keyById: Map<string, string>): AvatarEquippedKeys {
  return {
    species: row.equippedSpeciesId ? keyById.get(row.equippedSpeciesId) : undefined,
    hair: row.equippedHairId ? keyById.get(row.equippedHairId) : undefined,
    eyes: row.equippedEyesId ? keyById.get(row.equippedEyesId) : undefined,
    clothes: row.equippedClothesId ? keyById.get(row.equippedClothesId) : undefined,
    hat: row.equippedHatId ? keyById.get(row.equippedHatId) : undefined,
    accessory: row.equippedAccessoryId ? keyById.get(row.equippedAccessoryId) : undefined,
    background: row.equippedBackgroundId ? keyById.get(row.equippedBackgroundId) : undefined,
    wallpaper: row.equippedWallpaperId ? keyById.get(row.equippedWallpaperId) : undefined,
    floor: row.equippedFloorId ? keyById.get(row.equippedFloorId) : undefined,
    furniture: row.equippedFurnitureId ? keyById.get(row.equippedFurnitureId) : undefined,
  };
}

/** Batch-resolves equipped avatar item keys for several students in one query (login grid, etc). */
export async function getEquippedAvatarKeysForMany(
  rows: EquippedIdRow[]
): Promise<Map<string, AvatarEquippedKeys>> {
  const ids = [
    ...new Set(
      rows
        .flatMap((r) => [
          r.equippedSpeciesId,
          r.equippedHairId,
          r.equippedEyesId,
          r.equippedClothesId,
          r.equippedHatId,
          r.equippedAccessoryId,
          r.equippedBackgroundId,
          r.equippedWallpaperId,
          r.equippedFloorId,
          r.equippedFurnitureId,
        ])
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const itemRows = ids.length
    ? await db.select({ id: avatarItems.id, key: avatarItems.key }).from(avatarItems).where(inArray(avatarItems.id, ids))
    : [];
  const keyById = new Map(itemRows.map((i) => [i.id, i.key]));
  return new Map(rows.map((r) => [r.id, resolveEquippedKeys(r, keyById)]));
}

export async function getEquippedAvatarKeys(student: AuthedStudent): Promise<AvatarEquippedKeys> {
  const result = await getEquippedAvatarKeysForMany([student]);
  return result.get(student.id) ?? {};
}
