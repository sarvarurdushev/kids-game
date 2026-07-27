import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { studentGameUnlocks } from "@/lib/db/schema";
import { ServiceError } from "@/lib/student/errors";
import { GAME_CATALOG } from "@/lib/games/catalog";
import { getLevelInfo } from "@/lib/student/levelInfo";
import type { AuthedStudent } from "@/lib/auth/requireStudent";
import type { GameKey } from "./gameSession";

function gameMeta(gameKey: GameKey) {
  const meta = GAME_CATALOG.find((g) => g.key === gameKey);
  if (!meta) throw new ServiceError("Unknown game", 404);
  return meta;
}

/** Games unlock by reaching a level (lib/games/catalog.ts). Two exceptions
 * keep this fair to existing students: rows in student_game_unlocks are still
 * honored forever, so anyone who bought a game back when they cost coins
 * keeps it even below its level, and the admin login sees everything. */
async function unlockedGameKeys(student: AuthedStudent): Promise<Set<string>> {
  const rows = await db
    .select({ gameKey: studentGameUnlocks.gameKey })
    .from(studentGameUnlocks)
    .where(eq(studentGameUnlocks.studentId, student.id));
  return new Set(rows.map((r) => r.gameKey));
}

export async function isGameUnlocked(student: AuthedStudent, gameKey: GameKey): Promise<boolean> {
  const meta = gameMeta(gameKey);
  if (!meta.unlockLevel || student.isAdmin) return true;
  const { level } = await getLevelInfo(student.xpTotal);
  if (level >= meta.unlockLevel) return true;
  return (await unlockedGameKeys(student)).has(gameKey);
}

export interface GameUnlockState {
  key: GameKey;
  unlocked: boolean;
  /** Level still needed, or null when already unlocked / free. */
  requiredLevel: number | null;
}

/** One batched pass over the whole catalog — avoids the N queries that
 * calling isGameUnlocked per game would cost on the games index page. */
export async function getGameUnlockStates(student: AuthedStudent): Promise<GameUnlockState[]> {
  const { level } = await getLevelInfo(student.xpTotal);
  const legacy = await unlockedGameKeys(student);

  return GAME_CATALOG.map((meta) => {
    const unlocked =
      !meta.unlockLevel || student.isAdmin || level >= meta.unlockLevel || legacy.has(meta.key);
    return {
      key: meta.key,
      unlocked,
      requiredLevel: unlocked ? null : (meta.unlockLevel ?? null),
    };
  });
}
