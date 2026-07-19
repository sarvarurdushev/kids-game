import "server-only";
import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  avatarCaseGrants,
  avatarCaseRarityOdds,
  avatarCaseTypes,
  avatarItems,
  students,
  studentAvatarItems,
} from "@/lib/db/schema";
import { rollCaseItem } from "@/lib/reward-engine/avatarCases";
import type { CaseItemConfig } from "@/lib/reward-engine/avatarCases";
import type { RarityWeights } from "@/lib/reward-engine/types";
import { ServiceError } from "./errors";

export async function getCaseShop(coinsBalance: number) {
  const types = await db.select().from(avatarCaseTypes).where(eq(avatarCaseTypes.active, true));
  return types.map((t) => ({
    id: t.id,
    key: t.key,
    name: t.name,
    slot: t.slot,
    coinCost: t.coinCost,
    iconUrl: t.iconUrl,
    affordable: coinsBalance >= t.coinCost,
  }));
}

export async function getCaseInventory(studentId: string) {
  return db
    .select({
      id: avatarCaseGrants.id,
      grantedAt: avatarCaseGrants.grantedAt,
      source: avatarCaseGrants.source,
      caseType: avatarCaseTypes,
    })
    .from(avatarCaseGrants)
    .innerJoin(avatarCaseTypes, eq(avatarCaseGrants.caseTypeId, avatarCaseTypes.id))
    .where(and(eq(avatarCaseGrants.studentId, studentId), isNull(avatarCaseGrants.openedAt)))
    .orderBy(asc(avatarCaseGrants.grantedAt));
}

export async function purchaseCase(studentId: string, caseTypeId: string) {
  return db.transaction(async (tx) => {
    const [caseType] = await tx
      .select()
      .from(avatarCaseTypes)
      .where(and(eq(avatarCaseTypes.id, caseTypeId), eq(avatarCaseTypes.active, true)))
      .limit(1);
    if (!caseType) throw new ServiceError("Case type not found", 404);

    const [student] = await tx
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .for("update");
    if (student.coinsBalance < caseType.coinCost) {
      throw new ServiceError("Not enough coins", 402);
    }

    await tx
      .update(students)
      .set({ coinsBalance: student.coinsBalance - caseType.coinCost, updatedAt: new Date() })
      .where(eq(students.id, studentId));

    const [grant] = await tx
      .insert(avatarCaseGrants)
      .values({ studentId, caseTypeId, source: "purchase" })
      .returning();

    return grant;
  });
}

export interface RevealedCaseItem {
  avatarItemId: string;
  key: string;
  name: string;
  slot: string;
  rarity: string;
  isNew: boolean;
  bundledItems: { key: string; slot: string; name: string }[];
}

export async function openCase(studentId: string, grantId: string): Promise<RevealedCaseItem> {
  return db.transaction(async (tx) => {
    // Lock the student row first so opening two cases at once (two taps, two
    // tabs) serializes here rather than both transactions racing to insert
    // the same (student, item) row past student_avatar_items's unique index.
    await tx.select().from(students).where(eq(students.id, studentId)).for("update");

    const [grant] = await tx
      .select()
      .from(avatarCaseGrants)
      .where(eq(avatarCaseGrants.id, grantId))
      .for("update");
    if (!grant || grant.studentId !== studentId) {
      throw new ServiceError("Case not found", 404);
    }
    if (grant.openedAt) {
      throw new ServiceError("Case already opened", 409);
    }

    const [caseType] = await tx
      .select()
      .from(avatarCaseTypes)
      .where(eq(avatarCaseTypes.id, grant.caseTypeId))
      .limit(1);
    if (!caseType) throw new ServiceError("Case type not found", 500);

    const oddsRows = await tx
      .select()
      .from(avatarCaseRarityOdds)
      .where(eq(avatarCaseRarityOdds.caseTypeId, grant.caseTypeId));
    if (oddsRows.length === 0) {
      throw new ServiceError("Case type has no configured rarity odds", 500);
    }
    const rarityWeights: RarityWeights = { common: 0, rare: 0, epic: 0, legendary: 0 };
    for (const row of oddsRows) rarityWeights[row.rarity] = row.weight;

    const pool = await tx
      .select()
      .from(avatarItems)
      .where(
        and(
          eq(avatarItems.slot, caseType.slot),
          eq(avatarItems.acquisitionMethod, "case_unlock"),
          eq(avatarItems.active, true)
        )
      );
    if (pool.length === 0) {
      throw new ServiceError("Case type has no configured item pool", 500);
    }

    const owned = await tx
      .select()
      .from(studentAvatarItems)
      .where(eq(studentAvatarItems.studentId, studentId));
    const ownedIds = new Set(owned.map((o) => o.avatarItemId));

    const poolConfig: CaseItemConfig[] = pool.map((p) => ({ id: p.id, rarity: p.rarity }));
    const rolled = rollCaseItem(poolConfig, ownedIds, rarityWeights);
    if (!rolled) throw new ServiceError("Case type has no configured item pool", 500);
    const item = pool.find((p) => p.id === rolled.id)!;

    const isNew = !ownedIds.has(item.id);
    if (isNew) {
      await tx.insert(studentAvatarItems).values({ studentId, avatarItemId: item.id, acquiredVia: "case_unlock" });
    }

    // A character that comes bundled with an outfit grants those items too,
    // in the same case-opening — equipAvatarItem auto-equips them alongside
    // the species itself (lib/student/avatar.ts).
    let bundled: { key: string; slot: string; name: string }[] = [];
    if (item.bundledItemKeys && item.bundledItemKeys.length > 0) {
      const bundledRows = await tx
        .select()
        .from(avatarItems)
        .where(inArray(avatarItems.key, item.bundledItemKeys));
      for (const b of bundledRows) {
        if (!ownedIds.has(b.id)) {
          await tx
            .insert(studentAvatarItems)
            .values({ studentId, avatarItemId: b.id, acquiredVia: "case_unlock" })
            .onConflictDoNothing();
        }
      }
      bundled = bundledRows.map((b) => ({ key: b.key, slot: b.slot, name: b.name }));
    }

    const revealed: RevealedCaseItem = {
      avatarItemId: item.id,
      key: item.key,
      name: item.name,
      slot: item.slot,
      rarity: item.rarity,
      isNew,
      bundledItems: bundled,
    };

    await tx
      .update(avatarCaseGrants)
      .set({ openedAt: new Date(), openedResult: revealed })
      .where(eq(avatarCaseGrants.id, grantId));

    return revealed;
  });
}
