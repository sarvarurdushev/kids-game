import { describe, expect, it } from "vitest";
import { levelForXp, levelsCrossed } from "@/lib/reward-engine/levels";
import type { LevelCurveEntry } from "@/lib/reward-engine/types";

const curve: LevelCurveEntry[] = [
  { level: 1, minXp: 0, bonusCoins: 5, bonusPackTypeId: null },
  { level: 2, minXp: 100, bonusCoins: 10, bonusPackTypeId: null },
  { level: 3, minXp: 250, bonusCoins: 15, bonusPackTypeId: null },
  { level: 4, minXp: 500, bonusCoins: 20, bonusPackTypeId: null },
  { level: 5, minXp: 1000, bonusCoins: 25, bonusPackTypeId: "pack-achievement" },
];

describe("levelForXp", () => {
  it("stays at level 1 below the level 2 threshold", () => {
    expect(levelForXp(0, curve)).toBe(1);
    expect(levelForXp(99, curve)).toBe(1);
  });

  it("advances exactly at the threshold, not before", () => {
    expect(levelForXp(100, curve)).toBe(2);
    expect(levelForXp(249, curve)).toBe(2);
    expect(levelForXp(250, curve)).toBe(3);
  });

  it("handles xp far beyond the top of the curve", () => {
    expect(levelForXp(999999, curve)).toBe(5);
  });

  it("does not depend on curve row order", () => {
    const shuffled = [...curve].reverse();
    expect(levelForXp(600, shuffled)).toBe(4);
  });
});

describe("levelsCrossed", () => {
  it("returns nothing when xp moves without crossing a threshold", () => {
    expect(levelsCrossed(10, 50, curve)).toEqual([]);
  });

  it("returns exactly one level when crossing a single threshold", () => {
    const crossed = levelsCrossed(90, 150, curve);
    expect(crossed).toEqual([{ level: 2, bonusCoins: 10, bonusPackTypeId: null }]);
  });

  it("returns every level spanned by a large jump, not just the final one", () => {
    const crossed = levelsCrossed(0, 1000, curve);
    expect(crossed.map((c) => c.level)).toEqual([2, 3, 4, 5]);
    expect(crossed.find((c) => c.level === 5)?.bonusPackTypeId).toBe(
      "pack-achievement"
    );
  });

  it("is exclusive of the old level and inclusive of the new one", () => {
    expect(levelsCrossed(100, 100, curve)).toEqual([]);
    expect(levelsCrossed(99, 100, curve)).toEqual([
      { level: 2, bonusCoins: 10, bonusPackTypeId: null },
    ]);
  });
});
