import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { students, studentGameUnlocks } from "@/lib/db/schema";
import { ServiceError } from "@/lib/student/errors";
import { GAME_CATALOG } from "@/lib/games/catalog";
import type { GameKey } from "./gameSession";

function gameMeta(gameKey: GameKey) {
  const meta = GAME_CATALOG.find((g) => g.key === gameKey);
  if (!meta) throw new ServiceError("Unknown game", 404);
  return meta;
}

export async function isGameUnlocked(studentId: string, gameKey: GameKey): Promise<boolean> {
  const meta = gameMeta(gameKey);
  if (!meta.coinCost) return true; // free games need no row at all
  const [row] = await db
    .select({ id: studentGameUnlocks.id })
    .from(studentGameUnlocks)
    .where(and(eq(studentGameUnlocks.studentId, studentId), eq(studentGameUnlocks.gameKey, gameKey)))
    .limit(1);
  return !!row;
}

export async function getUnlockedGameKeys(studentId: string): Promise<Set<GameKey>> {
  const rows = await db
    .select({ gameKey: studentGameUnlocks.gameKey })
    .from(studentGameUnlocks)
    .where(eq(studentGameUnlocks.studentId, studentId));
  const unlocked = new Set(rows.map((r) => r.gameKey as GameKey));
  for (const game of GAME_CATALOG) {
    if (!game.coinCost) unlocked.add(game.key);
  }
  return unlocked;
}

export async function unlockGame(studentId: string, gameKey: GameKey) {
  const meta = gameMeta(gameKey);
  const coinCost = meta.coinCost;
  if (!coinCost) throw new ServiceError("This game is already free to play", 400);

  return db.transaction(async (tx) => {
    // Lock the student row first, same reason as purchaseAvatarItem: two
    // concurrent unlock taps must serialize here rather than both passing
    // the balance check and racing to insert the same (student, game) row.
    const [student] = await tx.select().from(students).where(eq(students.id, studentId)).for("update");

    const [existing] = await tx
      .select({ id: studentGameUnlocks.id })
      .from(studentGameUnlocks)
      .where(and(eq(studentGameUnlocks.studentId, studentId), eq(studentGameUnlocks.gameKey, gameKey)))
      .limit(1);
    if (existing) throw new ServiceError("Already unlocked", 409);

    if (student.coinsBalance < coinCost) {
      throw new ServiceError("Not enough coins", 402);
    }

    await tx
      .update(students)
      .set({ coinsBalance: student.coinsBalance - coinCost, updatedAt: new Date() })
      .where(eq(students.id, studentId));
    await tx.insert(studentGameUnlocks).values({ studentId, gameKey });

    return { gameKey, coinsRemaining: student.coinsBalance - coinCost };
  });
}
