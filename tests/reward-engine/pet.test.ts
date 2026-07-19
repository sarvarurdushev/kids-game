import { describe, expect, it } from "vitest";
import {
  boostHappiness,
  getEffectivePetHappiness,
  petHappinessCoinMultiplier,
  petMoodFromHappiness,
} from "@/lib/reward-engine/pet";

describe("getEffectivePetHappiness", () => {
  it("returns the stored value with no elapsed time", () => {
    const now = new Date("2026-01-10T00:00:00Z");
    expect(getEffectivePetHappiness(70, now, now, now)).toBe(70);
  });

  it("decays over days since the last interaction", () => {
    const lastInteraction = new Date("2026-01-01T00:00:00Z");
    const now = new Date("2026-01-04T00:00:00Z"); // 3 days later, 4/day decay
    expect(getEffectivePetHappiness(70, lastInteraction, lastInteraction, now)).toBe(70 - 12);
  });

  it("falls back to createdAt when never interacted with", () => {
    const createdAt = new Date("2026-01-01T00:00:00Z");
    const now = new Date("2026-01-02T00:00:00Z"); // 1 day later
    expect(getEffectivePetHappiness(70, null, createdAt, now)).toBe(70 - 4);
  });

  it("clamps to [0, 100]", () => {
    const longAgo = new Date("2020-01-01T00:00:00Z");
    const now = new Date("2026-01-01T00:00:00Z");
    expect(getEffectivePetHappiness(70, longAgo, longAgo, now)).toBe(0);
    expect(getEffectivePetHappiness(150, now, now, now)).toBe(100);
  });
});

describe("petMoodFromHappiness", () => {
  it("maps happiness to mood tiers", () => {
    expect(petMoodFromHappiness(80)).toBe("happy");
    expect(petMoodFromHappiness(65)).toBe("happy");
    expect(petMoodFromHappiness(50)).toBe("neutral");
    expect(petMoodFromHappiness(29)).toBe("sad");
    expect(petMoodFromHappiness(0)).toBe("sad");
  });
});

describe("petHappinessCoinMultiplier", () => {
  it("never penalizes a neglected pet below 1x", () => {
    expect(petHappinessCoinMultiplier(0)).toBe(1);
    expect(petHappinessCoinMultiplier(49)).toBe(1);
  });

  it("rewards a well-cared-for pet", () => {
    expect(petHappinessCoinMultiplier(50)).toBeCloseTo(1.05);
    expect(petHappinessCoinMultiplier(80)).toBeCloseTo(1.1);
    expect(petHappinessCoinMultiplier(100)).toBeCloseTo(1.1);
  });
});

describe("boostHappiness", () => {
  it("adds the interaction boost, capped at 100", () => {
    expect(boostHappiness(50)).toBe(65);
    expect(boostHappiness(95)).toBe(100);
  });
});
