import "server-only";
import { and, asc, eq, inArray, isNull, lte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  characters,
  packGrants,
  packTypePool,
  packTypes,
  studentCards,
  students,
  universes,
} from "@/lib/db/schema";
import { rollPackContents } from "@/lib/reward-engine/packs";
import type { CharacterConfig, Rarity } from "@/lib/reward-engine/types";
import { DUPLICATE_SHARD_REWARD } from "@/lib/reward-engine/shards";
import { getCurrentCurriculum } from "@/lib/games/curriculum";
import { ServiceError } from "./errors";

export async function getPackShop(coinsBalance: number) {
  const types = await db.select().from(packTypes).where(eq(packTypes.active, true));
  return types.map((t) => ({
    id: t.id,
    key: t.key,
    name: t.name,
    coinCost: t.coinCost,
    cardsPerPack: t.cardsPerPack,
    iconUrl: t.iconUrl,
    affordable: coinsBalance >= t.coinCost,
  }));
}

export async function getPackInventory(studentId: string) {
  return db
    .select({
      id: packGrants.id,
      grantedAt: packGrants.grantedAt,
      source: packGrants.source,
      packType: packTypes,
    })
    .from(packGrants)
    .innerJoin(packTypes, eq(packGrants.packTypeId, packTypes.id))
    .where(and(eq(packGrants.studentId, studentId), isNull(packGrants.openedAt)))
    .orderBy(asc(packGrants.grantedAt));
}

export async function purchasePack(studentId: string, packTypeId: string) {
  return db.transaction(async (tx) => {
    const [packType] = await tx
      .select()
      .from(packTypes)
      .where(and(eq(packTypes.id, packTypeId), eq(packTypes.active, true)))
      .limit(1);
    if (!packType) throw new ServiceError("Pack type not found", 404);

    const [student] = await tx
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .for("update");
    if (student.coinsBalance < packType.coinCost) {
      throw new ServiceError("Not enough coins", 402);
    }

    await tx
      .update(students)
      .set({ coinsBalance: student.coinsBalance - packType.coinCost, updatedAt: new Date() })
      .where(eq(students.id, studentId));

    const [grant] = await tx
      .insert(packGrants)
      .values({ studentId, packTypeId, source: "purchase" })
      .returning();

    return grant;
  });
}

export interface RevealedCard {
  characterId: string;
  characterKey: string;
  name: string;
  rarity: string;
  imageUrl: string | null;
  universeId: string;
  isNew: boolean;
  shardsAwarded: number;
}

export async function openPack(
  studentId: string,
  grantId: string
): Promise<RevealedCard[]> {
  return db.transaction(async (tx) => {
    // Lock the student row first so opening two different packs at the same
    // time (two taps, two tabs) serializes here — both packs may draw the
    // same character, and student_cards has a unique (student, character)
    // index that a second, unserialized transaction would crash into.
    const [lockedStudent] = await tx
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .for("update");

    const [grant] = await tx
      .select()
      .from(packGrants)
      .where(eq(packGrants.id, grantId))
      .for("update");
    if (!grant || grant.studentId !== studentId) {
      throw new ServiceError("Pack not found", 404);
    }
    if (grant.openedAt) {
      throw new ServiceError("Pack already opened", 409);
    }

    const [packType] = await tx
      .select()
      .from(packTypes)
      .where(eq(packTypes.id, grant.packTypeId))
      .limit(1);
    if (!packType) throw new ServiceError("Pack type not found", 500);

    // Cards can only come from the current month's curriculum topic or an
    // already-passed one this year — a future month's universe (e.g.
    // Christmas in July) is excluded from the roll entirely, not just hidden
    // in the UI, so a pack can never grant a card the student "shouldn't"
    // have yet.
    const { month: currentMonth } = getCurrentCurriculum();
    const unlockedUniverseIds = new Set(
      (await tx.select().from(universes).where(lte(universes.sortOrder, currentMonth))).map((u) => u.id)
    );

    const pool = (
      await tx.select().from(packTypePool).where(eq(packTypePool.packTypeId, grant.packTypeId))
    ).filter((p) => unlockedUniverseIds.has(p.universeId));
    if (pool.length === 0) {
      throw new ServiceError("Pack type has no configured universe pool", 500);
    }

    const universeIds = pool.map((p) => p.universeId);
    const universeCharacters = await tx
      .select()
      .from(characters)
      .where(inArray(characters.universeId, universeIds));

    const byUniverse = new Map<string, CharacterConfig[]>();
    for (const c of universeCharacters) {
      const list = byUniverse.get(c.universeId) ?? [];
      list.push({ id: c.id, universeId: c.universeId, rarity: c.rarity });
      byUniverse.set(c.universeId, list);
    }

    const rolled = rollPackContents(
      packType.cardsPerPack,
      pool.map((p) => ({ universeId: p.universeId, weight: p.weight })),
      byUniverse
    );

    const revealed: RevealedCard[] = [];
    let shardsAwarded = 0;
    for (const card of rolled) {
      const detail = universeCharacters.find((c) => c.id === card.id)!;
      const [existing] = await tx
        .select()
        .from(studentCards)
        .where(
          and(eq(studentCards.studentId, studentId), eq(studentCards.characterId, card.id))
        )
        .limit(1);

      let cardShardsAwarded = 0;
      if (existing) {
        cardShardsAwarded = DUPLICATE_SHARD_REWARD[detail.rarity as Rarity];
        shardsAwarded += cardShardsAwarded;
        await tx
          .update(studentCards)
          .set({ quantity: existing.quantity + 1 })
          .where(eq(studentCards.id, existing.id));
      } else {
        await tx.insert(studentCards).values({ studentId, characterId: card.id });
      }

      revealed.push({
        characterId: detail.id,
        characterKey: detail.key,
        name: detail.name,
        rarity: detail.rarity,
        imageUrl: detail.imageUrl,
        universeId: detail.universeId,
        isNew: !existing,
        shardsAwarded: cardShardsAwarded,
      });
    }

    if (shardsAwarded > 0) {
      await tx
        .update(students)
        .set({ cardShards: lockedStudent.cardShards + shardsAwarded, updatedAt: new Date() })
        .where(eq(students.id, studentId));
    }

    await tx
      .update(packGrants)
      .set({ openedAt: new Date(), openedResult: revealed })
      .where(eq(packGrants.id, grantId));

    return revealed;
  });
}
