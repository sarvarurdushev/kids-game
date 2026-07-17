import type { LevelCurveEntry, LevelUpEvent } from "./types";

function sortedCurve(curve: LevelCurveEntry[]): LevelCurveEntry[] {
  return [...curve].sort((a, b) => a.level - b.level);
}

export function levelForXp(xp: number, curve: LevelCurveEntry[]): number {
  const sorted = sortedCurve(curve);
  let level = sorted[0]?.level ?? 1;
  for (const entry of sorted) {
    if (xp >= entry.minXp) {
      level = entry.level;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Every level between the student's old and new XP, not just the final one —
 * a single event that fires several rules at once can jump more than one
 * level, and each crossed level's bonus should still apply.
 */
export function levelsCrossed(
  oldXp: number,
  newXp: number,
  curve: LevelCurveEntry[]
): LevelUpEvent[] {
  const sorted = sortedCurve(curve);
  const oldLevel = levelForXp(oldXp, sorted);
  return sorted
    .filter((entry) => entry.level > oldLevel && entry.minXp <= newXp)
    .map((entry) => ({
      level: entry.level,
      bonusCoins: entry.bonusCoins,
      bonusPackTypeId: entry.bonusPackTypeId,
    }));
}
