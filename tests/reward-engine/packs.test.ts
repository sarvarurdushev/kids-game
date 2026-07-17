import { describe, expect, it } from "vitest";
import { rollPackContents, DEFAULT_RARITY_WEIGHTS } from "@/lib/reward-engine/packs";
import type { CharacterConfig } from "@/lib/reward-engine/types";

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

const discoveryCharacters: CharacterConfig[] = [
  { id: "explorer", universeId: "discovery", rarity: "common" },
  { id: "scientist", universeId: "discovery", rarity: "rare" },
  { id: "inventor", universeId: "discovery", rarity: "epic" },
  { id: "archaeologist", universeId: "discovery", rarity: "legendary" },
];

const oceanCharacters: CharacterConfig[] = [
  { id: "dolphin", universeId: "ocean", rarity: "common" },
  { id: "turtle", universeId: "ocean", rarity: "common" },
  { id: "octopus", universeId: "ocean", rarity: "rare" },
  { id: "shark", universeId: "ocean", rarity: "epic" },
  { id: "whale", universeId: "ocean", rarity: "legendary" },
];

const allCharacters = new Map<string, CharacterConfig[]>([
  ["discovery", discoveryCharacters],
  ["ocean", oceanCharacters],
]);

describe("rollPackContents", () => {
  it("never returns a character outside the pack's universe pool", () => {
    const rng = mulberry32(42);
    const results = rollPackContents(
      500,
      [{ universeId: "discovery", weight: 1 }],
      allCharacters,
      rng
    );
    expect(results.length).toBe(500);
    expect(results.every((c) => c.universeId === "discovery")).toBe(true);
  });

  it("matches rarity distribution within tolerance over many rolls", () => {
    const rng = mulberry32(7);
    const results = rollPackContents(
      10_000,
      [
        { universeId: "discovery", weight: 1 },
        { universeId: "ocean", weight: 1 },
      ],
      allCharacters,
      rng
    );

    const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
    for (const card of results) counts[card.rarity]++;

    const total = results.length;
    for (const rarity of Object.keys(DEFAULT_RARITY_WEIGHTS) as (keyof typeof DEFAULT_RARITY_WEIGHTS)[]) {
      const expectedRatio = DEFAULT_RARITY_WEIGHTS[rarity] / 100;
      const actualRatio = counts[rarity] / total;
      expect(Math.abs(actualRatio - expectedRatio)).toBeLessThan(0.03);
    }
  });

  it("is deterministic for a fixed seed", () => {
    const runOnce = () =>
      rollPackContents(
        5,
        [{ universeId: "ocean", weight: 1 }],
        allCharacters,
        mulberry32(123)
      ).map((c) => c.id);

    expect(runOnce()).toEqual(runOnce());
  });

  it("weights universe selection according to the pool", () => {
    const rng = mulberry32(99);
    const results = rollPackContents(
      2000,
      [
        { universeId: "discovery", weight: 3 },
        { universeId: "ocean", weight: 1 },
      ],
      allCharacters,
      rng
    );
    const discoveryCount = results.filter((c) => c.universeId === "discovery").length;
    const ratio = discoveryCount / results.length;
    expect(ratio).toBeGreaterThan(0.65);
    expect(ratio).toBeLessThan(0.85);
  });
});
