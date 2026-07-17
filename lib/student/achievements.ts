import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  achievements as achievementsTable,
  studentAchievements,
  studentEventCounters,
} from "@/lib/db/schema";

export async function getAchievements(studentId: string) {
  const all = await db.select().from(achievementsTable);
  const unlocked = await db
    .select()
    .from(studentAchievements)
    .where(eq(studentAchievements.studentId, studentId));
  const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));

  const counters = await db
    .select()
    .from(studentEventCounters)
    .where(eq(studentEventCounters.studentId, studentId));
  const countByEventKey = new Map(counters.map((c) => [c.eventKey, c.count]));

  return all.map((a) => ({
    id: a.id,
    key: a.key,
    name: a.name,
    description: a.description,
    badgeImageUrl: a.badgeImageUrl,
    threshold: a.threshold,
    progress: Math.min(countByEventKey.get(a.eventKey) ?? 0, a.threshold),
    unlocked: unlockedMap.has(a.id),
    unlockedAt: unlockedMap.get(a.id) ?? null,
  }));
}
