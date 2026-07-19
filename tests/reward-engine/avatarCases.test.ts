import { describe, expect, it } from "vitest";
import { rollCaseItem, type CaseItemConfig } from "@/lib/reward-engine/avatarCases";
import { DEFAULT_RARITY_WEIGHTS } from "@/lib/reward-engine/packs";

function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pool: CaseItemConfig[] = [
  { id: "cat", rarity: "common" },
  { id: "dog", rarity: "common" },
  { id: "fox", rarity: "rare" },
  { id: "wolf", rarity: "rare" },
  { id: "bear", rarity: "epic" },
  { id: "dragon", rarity: "legendary" },
];

describe("rollCaseItem", () => {
  it("returns null for an empty pool", () => {
    expect(rollCaseItem([], new Set(), DEFAULT_RARITY_WEIGHTS, mulberry32(1))).toBeNull();
  });

  it("matches rarity distribution within tolerance over many rolls", () => {
    const rng = mulberry32(7);
    const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
    for (let i = 0; i < 10_000; i++) {
      const item = rollCaseItem(pool, new Set(), DEFAULT_RARITY_WEIGHTS, rng);
      counts[item!.rarity]++;
    }
    const total = 10_000;
    for (const rarity of Object.keys(DEFAULT_RARITY_WEIGHTS) as (keyof typeof DEFAULT_RARITY_WEIGHTS)[]) {
      const expectedRatio = DEFAULT_RARITY_WEIGHTS[rarity] / 100;
      const actualRatio = counts[rarity] / total;
      expect(Math.abs(actualRatio - expectedRatio)).toBeLessThan(0.03);
    }
  });

  it("prefers not-yet-owned items at the rolled rarity", () => {
    const rng = mulberry32(3);
    const owned = new Set(["cat"]);
    for (let i = 0; i < 200; i++) {
      const item = rollCaseItem(
        [{ id: "cat", rarity: "common" }, { id: "dog", rarity: "common" }],
        owned,
        { common: 1, rare: 0, epic: 0, legendary: 0 },
        rng
      );
      expect(item!.id).toBe("dog");
    }
  });

  it("falls back to an owned item at the rarity rather than crashing when everything is owned", () => {
    const rng = mulberry32(9);
    const owned = new Set(["cat", "dog"]);
    const item = rollCaseItem(
      [{ id: "cat", rarity: "common" }, { id: "dog", rarity: "common" }],
      owned,
      { common: 1, rare: 0, epic: 0, legendary: 0 },
      rng
    );
    expect(["cat", "dog"]).toContain(item!.id);
  });

  it("is deterministic for a fixed seed", () => {
    const runOnce = () => rollCaseItem(pool, new Set(), DEFAULT_RARITY_WEIGHTS, mulberry32(123))!.id;
    expect(runOnce()).toEqual(runOnce());
  });
});
