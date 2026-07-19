import { describe, expect, it } from "vitest";
import { streakCoinMultiplier, rollSpinBonusCoins } from "@/lib/reward-engine/gameSession";

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

describe("streakCoinMultiplier", () => {
  it("is 1x with no streak", () => {
    expect(streakCoinMultiplier(0)).toBe(1);
  });

  it("grows 5% per day", () => {
    expect(streakCoinMultiplier(1)).toBeCloseTo(1.05);
    expect(streakCoinMultiplier(4)).toBeCloseTo(1.2);
  });

  it("caps at +50% from 10 days on", () => {
    expect(streakCoinMultiplier(10)).toBeCloseTo(1.5);
    expect(streakCoinMultiplier(50)).toBeCloseTo(1.5);
  });

  it("never drops below 1x for a negative streak", () => {
    expect(streakCoinMultiplier(-3)).toBe(1);
  });
});

describe("rollSpinBonusCoins", () => {
  it("always returns one of the configured coin amounts", () => {
    const rng = mulberry32(11);
    const allowed = new Set([2, 4, 6, 10, 20]);
    for (let i = 0; i < 500; i++) {
      expect(allowed.has(rollSpinBonusCoins(rng))).toBe(true);
    }
  });

  it("is deterministic for a fixed seed", () => {
    expect(rollSpinBonusCoins(mulberry32(7))).toBe(rollSpinBonusCoins(mulberry32(7)));
  });
});
