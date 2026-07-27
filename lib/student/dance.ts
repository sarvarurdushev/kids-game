import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { students } from "@/lib/db/schema";
import { ServiceError } from "./errors";

// Priced in line with the most expensive single avatar item (~40-50 coins)
// and the mid-tier packs (50-100), not above them — 150 sat well beyond what
// a student earns in a session or two, so the unlock button never felt like
// a reachable goal, just a locked wall.
export const DANCE_UNLOCK_COST = 250;

export async function isDanceUnlocked(studentId: string): Promise<boolean> {
  const [student] = await db
    .select({ danceUnlockedAt: students.danceUnlockedAt })
    .from(students)
    .where(eq(students.id, studentId))
    .limit(1);
  return !!student?.danceUnlockedAt;
}

export async function unlockDance(studentId: string) {
  return db.transaction(async (tx) => {
    // Lock the student row first, same reason as purchaseAvatarItem/
    // unlockGame: two concurrent unlock taps must serialize here rather than
    // both passing the balance check and double-spending the coins.
    const [student] = await tx.select().from(students).where(eq(students.id, studentId)).for("update");
    if (student.danceUnlockedAt) throw new ServiceError("Already unlocked", 409);
    if (student.coinsBalance < DANCE_UNLOCK_COST) {
      throw new ServiceError("Not enough coins", 402);
    }

    await tx
      .update(students)
      .set({ coinsBalance: student.coinsBalance - DANCE_UNLOCK_COST, danceUnlockedAt: new Date(), updatedAt: new Date() })
      .where(eq(students.id, studentId));

    return { coinsRemaining: student.coinsBalance - DANCE_UNLOCK_COST };
  });
}
