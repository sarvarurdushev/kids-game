import "server-only";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { levelCurve } from "@/lib/db/schema";
import { levelForXp } from "@/lib/reward-engine/levels";

export interface LevelInfo {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number | null;
  currentLevelMinXp: number;
  nextLevelMinXp: number | null;
}

export async function getLevelInfo(xpTotal: number): Promise<LevelInfo> {
  const curve = await db.select().from(levelCurve).orderBy(asc(levelCurve.level));
  const level = levelForXp(xpTotal, curve);
  const currentEntry = curve.find((c) => c.level === level)!;
  const nextEntry = curve.find((c) => c.level === level + 1) ?? null;

  return {
    level,
    xpIntoLevel: xpTotal - currentEntry.minXp,
    xpForNextLevel: nextEntry ? nextEntry.minXp - currentEntry.minXp : null,
    currentLevelMinXp: currentEntry.minXp,
    nextLevelMinXp: nextEntry?.minXp ?? null,
  };
}
