import { describe, expect, it } from "vitest";
import {
  CURRICULUM,
  curriculumWordsUpToDifficulty,
  getCurrentCurriculum,
  getCurriculumWeekIndex,
} from "@/lib/games/curriculum";
import { WORD_BANK } from "@/lib/games/wordBank";

describe("getCurriculumWeekIndex", () => {
  it("maps days 1-7 to week 1", () => {
    expect(getCurriculumWeekIndex(new Date(2026, 0, 1))).toBe(1);
    expect(getCurriculumWeekIndex(new Date(2026, 0, 7))).toBe(1);
  });

  it("maps days 8-14 to week 2", () => {
    expect(getCurriculumWeekIndex(new Date(2026, 0, 8))).toBe(2);
    expect(getCurriculumWeekIndex(new Date(2026, 0, 14))).toBe(2);
  });

  it("maps days 15-21 to week 3", () => {
    expect(getCurriculumWeekIndex(new Date(2026, 0, 15))).toBe(3);
    expect(getCurriculumWeekIndex(new Date(2026, 0, 21))).toBe(3);
  });

  it("maps day 22 through the end of the month to week 4", () => {
    expect(getCurriculumWeekIndex(new Date(2026, 0, 22))).toBe(4);
    expect(getCurriculumWeekIndex(new Date(2026, 0, 31))).toBe(4);
  });
});

describe("getCurrentCurriculum", () => {
  it("resolves January to Space, week 3, for a mid-month date", () => {
    const result = getCurrentCurriculum(new Date(2026, 0, 15));
    expect(result.key).toBe("space");
    expect(result.weekIndex).toBe(3);
    expect(result.monthKey).toBe("2026-01");
  });

  it("resolves December to Christmas at month-end", () => {
    const result = getCurrentCurriculum(new Date(2026, 11, 31));
    expect(result.key).toBe("christmas");
    expect(result.weekIndex).toBe(4);
    expect(result.monthKey).toBe("2026-12");
  });

  it("resolves July to Weather (today's month in this session)", () => {
    const result = getCurrentCurriculum(new Date(2026, 6, 22));
    expect(result.key).toBe("weather");
    expect(result.weekIndex).toBe(4);
    expect(result.monthKey).toBe("2026-07");
  });

  it("covers every calendar month exactly once", () => {
    const months = CURRICULUM.map((c) => c.month).sort((a, b) => a - b);
    expect(months).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
});

describe("curriculumWordsUpToDifficulty", () => {
  it("returns only this month's topic once enough weeks have accumulated", () => {
    // Late in the month, Weather (July) has accumulated all 11 words at
    // difficulty <= 3, comfortably above the fallback threshold.
    const words = curriculumWordsUpToDifficulty(3, new Date(2026, 6, 22));
    expect(words.length).toBeGreaterThanOrEqual(8);
    expect(words.every((w) => w.category === "weather")).toBe(true);
  });

  it("never includes this month's own topic beyond the current week, even as fallback filler", () => {
    const words = curriculumWordsUpToDifficulty(3, new Date(2026, 6, 8)); // week 2 of Weather
    const weatherWords = words.filter((w) => w.category === "weather");
    expect(weatherWords.every((w) => (w.week ?? 1) <= 2)).toBe(true);
  });

  it("blends in the evergreen pool when the topic alone is too thin", () => {
    // First week of Space (January) — only 4 words exist at week 1, below
    // the fallback threshold, so non-space words must be blended in.
    const words = curriculumWordsUpToDifficulty(1, new Date(2026, 0, 3));
    const spaceWords = words.filter((w) => w.category === "space");
    const otherWords = words.filter((w) => w.category !== "space");
    expect(spaceWords.length).toBeGreaterThan(0);
    expect(otherWords.length).toBeGreaterThan(0);
  });

  it("never returns duplicate words when blending in the fallback pool", () => {
    const words = curriculumWordsUpToDifficulty(1, new Date(2026, 0, 3));
    const uniqueWords = new Set(words.map((w) => w.word));
    expect(uniqueWords.size).toBe(words.length);
  });
});

describe("WORD_BANK content", () => {
  it("has no duplicate word strings across the whole bank", () => {
    const seen = new Set<string>();
    for (const entry of WORD_BANK) {
      expect(seen.has(entry.word)).toBe(false);
      seen.add(entry.word);
    }
  });

  it("every curriculum topic key has at least one word in every week", () => {
    for (const topic of CURRICULUM) {
      for (const week of [1, 2, 3, 4] as const) {
        const words = WORD_BANK.filter((w) => w.category === topic.key && w.week === week);
        expect(words.length, `${topic.key} week ${week}`).toBeGreaterThan(0);
      }
    }
  });
});
