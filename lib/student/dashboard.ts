import "server-only";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { packGrants } from "@/lib/db/schema";
import { getLevelInfo } from "./levelInfo";
import { getDailyClaimStatus } from "@/lib/reward-engine/dailyClaim";
import { petMoodFromHappiness } from "@/lib/reward-engine/pet";
import { currentPetHappiness } from "./pet";
import type { AuthedStudent } from "@/lib/auth/requireStudent";

export async function getDashboard(student: AuthedStudent) {
  const levelInfo = await getLevelInfo(student.xpTotal);
  const [{ count: unopenedPackCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(packGrants)
    .where(and(eq(packGrants.studentId, student.id), isNull(packGrants.openedAt)));
  const dailyClaim = await getDailyClaimStatus(student.id);
  const petHappiness = currentPetHappiness(student);

  return {
    displayName: student.displayName,
    xpTotal: student.xpTotal,
    coinsBalance: student.coinsBalance,
    currentStreak: student.currentStreak,
    longestStreak: student.longestStreak,
    level: levelInfo,
    unopenedPackCount: Number(unopenedPackCount),
    dailyClaim,
    petHappiness,
    petMood: petMoodFromHappiness(petHappiness),
  };
}
