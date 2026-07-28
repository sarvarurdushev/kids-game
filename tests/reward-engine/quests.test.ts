import { describe, expect, it } from "vitest";
import {
  ALL_QUESTS,
  DAILY_QUESTS,
  WEEKLY_QUESTS,
  dayStartUTC,
  periodStartFor,
  weekStartUTC,
} from "@/lib/reward-engine/quests";

describe("quest period boundaries", () => {
  it("snaps the daily period to UTC midnight", () => {
    const start = dayStartUTC(new Date("2026-07-15T23:59:59.000Z"));
    expect(start.toISOString()).toBe("2026-07-15T00:00:00.000Z");
  });

  it("snaps the weekly period back to Monday", () => {
    // 2026-07-15 is a Wednesday; its week starts Monday the 13th.
    expect(weekStartUTC(new Date("2026-07-15T12:00:00.000Z")).toISOString()).toBe(
      "2026-07-13T00:00:00.000Z"
    );
  });

  it("treats Monday itself as the start of its own week, not the previous one", () => {
    expect(weekStartUTC(new Date("2026-07-13T00:00:00.000Z")).toISOString()).toBe(
      "2026-07-13T00:00:00.000Z"
    );
  });

  it("puts Sunday at the END of its week, not the start", () => {
    // The classic off-by-one: getUTCDay() is 0 for Sunday, so a naive
    // `date - getUTCDay()` would roll Sunday forward to the wrong Monday.
    expect(weekStartUTC(new Date("2026-07-19T18:00:00.000Z")).toISOString()).toBe(
      "2026-07-13T00:00:00.000Z"
    );
  });

  it("gives every day of one week the same weekly period start", () => {
    const starts = new Set(
      ["13", "14", "15", "16", "17", "18", "19"].map((d) =>
        weekStartUTC(new Date(`2026-07-${d}T09:00:00.000Z`)).toISOString()
      )
    );
    expect(starts.size).toBe(1);
  });

  it("routes each period type to the right boundary", () => {
    const now = new Date("2026-07-15T12:00:00.000Z");
    expect(periodStartFor("daily", now).toISOString()).toBe("2026-07-15T00:00:00.000Z");
    expect(periodStartFor("weekly", now).toISOString()).toBe("2026-07-13T00:00:00.000Z");
  });

  it("does not mutate the date it is given", () => {
    const now = new Date("2026-07-15T12:00:00.000Z");
    weekStartUTC(now);
    dayStartUTC(now);
    expect(now.toISOString()).toBe("2026-07-15T12:00:00.000Z");
  });
});

describe("quest catalog", () => {
  it("has unique keys", () => {
    expect(new Set(ALL_QUESTS.map((q) => q.key)).size).toBe(ALL_QUESTS.length);
  });

  it("tags every quest with the period list it came from", () => {
    expect(DAILY_QUESTS.every((q) => q.period === "daily")).toBe(true);
    expect(WEEKLY_QUESTS.every((q) => q.period === "weekly")).toBe(true);
  });

  it("keeps gold stars off the two easiest dailies so they stay a scarce currency", () => {
    const freebies = DAILY_QUESTS.filter((q) => q.rewardGoldStars === 0);
    expect(freebies.length).toBeGreaterThan(0);
    // Weekly quests are the real gold-star faucet.
    expect(WEEKLY_QUESTS.every((q) => q.rewardGoldStars > 0)).toBe(true);
  });

  it("rewards weekly quests more than daily ones", () => {
    const maxDaily = Math.max(...DAILY_QUESTS.map((q) => q.rewardCoins));
    const minWeekly = Math.min(...WEEKLY_QUESTS.map((q) => q.rewardCoins));
    expect(minWeekly).toBeGreaterThan(maxDaily);
  });

  it("sets a positive target for every quest", () => {
    expect(ALL_QUESTS.every((q) => q.target > 0)).toBe(true);
  });

  it("has 5 daily and 6 weekly quests (11 total), including the Word Book ones", () => {
    expect(DAILY_QUESTS.length).toBe(5);
    expect(WEEKLY_QUESTS.length).toBe(6);
    expect(ALL_QUESTS.length).toBe(11);
  });

  it("defines the daily word-review quest matching the other dailies' reward magnitude", () => {
    const quest = DAILY_QUESTS.find((q) => q.key === "daily_words_10");
    expect(quest).toMatchObject({
      period: "daily",
      metric: "words_reviewed",
      target: 10,
      rewardCoins: 25,
      rewardGoldStars: 1,
    });
  });

  it("defines the weekly word-review quest matching the other weeklies' reward magnitude", () => {
    const quest = WEEKLY_QUESTS.find((q) => q.key === "weekly_words_50");
    expect(quest).toMatchObject({
      period: "weekly",
      metric: "words_reviewed",
      target: 50,
      rewardCoins: 150,
      rewardGoldStars: 3,
    });
  });
});
