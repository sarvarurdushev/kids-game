import { describe, expect, it } from "vitest";
import { checkAchievementUnlocks } from "@/lib/reward-engine/achievements";
import type { AchievementConfig } from "@/lib/reward-engine/types";

const achievements: AchievementConfig[] = [
  {
    id: "first-class",
    key: "first_class",
    eventKey: "class_attendance",
    threshold: 1,
    rewardCoins: 50,
    rewardPackTypeId: "achievement-pack",
    rewardAvatarItemId: null,
  },
  {
    id: "attendance-champion",
    key: "attendance_champion",
    eventKey: "class_attendance",
    threshold: 30,
    rewardCoins: 200,
    rewardPackTypeId: null,
    rewardAvatarItemId: null,
  },
];

describe("checkAchievementUnlocks", () => {
  it("does not unlock below threshold", () => {
    expect(checkAchievementUnlocks("class_attendance", 0, achievements, new Set())).toEqual([]);
  });

  it("unlocks exactly at threshold", () => {
    const unlocks = checkAchievementUnlocks(
      "class_attendance",
      1,
      achievements,
      new Set()
    );
    expect(unlocks.map((u) => u.key)).toEqual(["first_class"]);
  });

  it("unlocks multiple achievements sharing an event key when both thresholds are met", () => {
    const unlocks = checkAchievementUnlocks(
      "class_attendance",
      30,
      achievements,
      new Set()
    );
    expect(unlocks.map((u) => u.key).sort()).toEqual(
      ["attendance_champion", "first_class"].sort()
    );
  });

  it("does not re-unlock an achievement already unlocked", () => {
    const unlocks = checkAchievementUnlocks(
      "class_attendance",
      1,
      achievements,
      new Set(["first-class"])
    );
    expect(unlocks).toEqual([]);
  });

  it("ignores achievements tied to a different event key", () => {
    const unlocks = checkAchievementUnlocks(
      "teamwork",
      100,
      achievements,
      new Set()
    );
    expect(unlocks).toEqual([]);
  });
});
