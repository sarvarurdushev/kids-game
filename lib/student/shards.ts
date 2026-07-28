import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { characters, studentCards, students, universes } from "@/lib/db/schema";
import { CARD_REDEEM_SHARD_COST } from "@/lib/reward-engine/shards";
import type { Rarity } from "@/lib/reward-engine/types";
import { getCurrentCurriculum } from "@/lib/games/curriculum";
import { ServiceError } from "./errors";

/** Spends shards to redeem a specific still-missing card directly, instead of
 * leaving it to chance in a pack. Follows the same row-lock-then-checks
 * pattern as purchaseAvatarItem/purchaseRoomSet. */
export async function redeemCardWithShards(studentId: string, characterId: string) {
  return db.transaction(async (tx) => {
    const [character] = await tx
      .select()
      .from(characters)
      .where(eq(characters.id, characterId))
      .limit(1);
    if (!character) throw new ServiceError("Card not found", 404);

    const [universe] = await tx
      .select()
      .from(universes)
      .where(eq(universes.id, character.universeId))
      .limit(1);

    // Lock the student row before checking ownership/balance, so two
    // concurrent redeem requests (double-tap, two tabs) serialize here
    // instead of both passing the checks and racing each other.
    const [student] = await tx
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .for("update");

    if (!student.isAdmin && universe.sortOrder > getCurrentCurriculum().month) {
      throw new ServiceError("This universe hasn't unlocked yet", 403);
    }

    const [existing] = await tx
      .select()
      .from(studentCards)
      .where(and(eq(studentCards.studentId, studentId), eq(studentCards.characterId, characterId)))
      .limit(1);
    if (existing) throw new ServiceError("Already owned", 409);

    const cost = CARD_REDEEM_SHARD_COST[character.rarity as Rarity];
    if (student.cardShards < cost) {
      throw new ServiceError("Not enough shards", 402);
    }

    await tx
      .update(students)
      .set({ cardShards: student.cardShards - cost, updatedAt: new Date() })
      .where(eq(students.id, studentId));
    await tx.insert(studentCards).values({ studentId, characterId });

    return { characterId, shardsRemaining: student.cardShards - cost };
  });
}
