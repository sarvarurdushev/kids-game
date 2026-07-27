import { describe, expect, it } from "vitest";
import {
  FEATURED_COUNT,
  discountedPrice,
  featuredKeysFor,
  isoWeekKey,
} from "@/lib/shop/weeklyRotation";

describe("isoWeekKey", () => {
  it("computes the week for an ordinary mid-year Monday", () => {
    // 2026-07-27 is a Monday, the first day of ISO week 31.
    expect(isoWeekKey(new Date("2026-07-27T00:00:00Z"))).toBe("2026-W31");
  });

  it("assigns week 1 to the year containing the first Thursday", () => {
    // 2026-01-01 is a Thursday, so it's the first day of 2026-W01.
    expect(isoWeekKey(new Date("2026-01-01T00:00:00Z"))).toBe("2026-W01");
  });

  it("rolls a Jan 1 that falls on a Friday back into the previous ISO year's last week", () => {
    // 2027-01-01 is a Friday. Its ISO week's Thursday is 2026-12-31, so the
    // whole week — including Jan 1 — belongs to 2026, not 2027. 2026 has 53
    // ISO weeks (it starts on a Thursday), so this lands on 2026-W53, not
    // 2027-W01 or 2026-W52.
    expect(isoWeekKey(new Date("2027-01-01T00:00:00Z"))).toBe("2026-W53");
  });

  it("rolls a Jan 1 that falls on a Sunday back into the previous ISO year", () => {
    // 2023-01-01 is a Sunday, the last day of the ISO week whose Thursday
    // (2022-12-29) sits in 2022 — and 2022 only has 52 weeks.
    expect(isoWeekKey(new Date("2023-01-01T00:00:00Z"))).toBe("2022-W52");
  });

  it("gives a leap year with a Wednesday Jan 1 a 53rd week", () => {
    // 2020 is a leap year starting on a Wednesday, one of the two ISO rules
    // that produce a 53-week year.
    expect(isoWeekKey(new Date("2020-12-31T00:00:00Z"))).toBe("2020-W53");
  });

  it("buckets by the UTC day, not the server's local day", () => {
    // These two instants straddle UTC midnight between Sunday 2026-08-02
    // (end of W31) and Monday 2026-08-03 (start of W32). Reading local
    // calendar fields instead of UTC ones would shift the boundary by the
    // server's offset and put these in the wrong weeks on any non-UTC host.
    expect(isoWeekKey(new Date("2026-08-02T23:59:59Z"))).toBe("2026-W31");
    expect(isoWeekKey(new Date("2026-08-03T00:00:01Z"))).toBe("2026-W32");
  });

  it("is stable across a whole week (Monday through Sunday)", () => {
    const monday = isoWeekKey(new Date("2026-07-27T00:00:00Z"));
    const sunday = isoWeekKey(new Date("2026-08-02T00:00:00Z"));
    expect(monday).toBe("2026-W31");
    expect(sunday).toBe("2026-W31");
  });
});

const CANDIDATES = [
  "hat-wizard",
  "hat-crown",
  "hat-cap",
  "clothes-cape",
  "clothes-robe",
  "eyes-star",
  "eyes-heart",
  "hair-braid",
  "hair-spike",
  "accessory-wand",
];

describe("featuredKeysFor", () => {
  it("returns the same set for the same week, every time it's called", () => {
    const date = new Date("2026-07-27T00:00:00Z");
    const first = featuredKeysFor(CANDIDATES, date);
    const second = featuredKeysFor(CANDIDATES, date);
    expect(second).toEqual(first);
  });

  it("returns the same set for any date within the same ISO week", () => {
    const monday = featuredKeysFor(CANDIDATES, new Date("2026-07-27T00:00:00Z"));
    const wednesday = featuredKeysFor(CANDIDATES, new Date("2026-07-29T00:00:00Z"));
    const sunday = featuredKeysFor(CANDIDATES, new Date("2026-08-02T00:00:00Z"));
    expect(wednesday).toEqual(monday);
    expect(sunday).toEqual(monday);
  });

  it("varies across consecutive weeks", () => {
    // Check several week-over-week pairs rather than just one, so a single
    // coincidental collision in the shuffle can't make this test flaky.
    const results = Array.from({ length: 8 }, (_, i) => {
      const date = new Date("2026-01-01T00:00:00Z");
      date.setUTCDate(date.getUTCDate() + i * 7);
      return featuredKeysFor(CANDIDATES, date);
    });

    const distinctSerializations = new Set(results.map((r) => r.join(",")));
    // 8 consecutive weeks shouldn't all collapse to the same handful of
    // shuffles — allow at most one repeat to avoid a knife-edge assertion.
    expect(distinctSerializations.size).toBeGreaterThanOrEqual(results.length - 1);
  });

  it("does not mutate the input array", () => {
    const original = [...CANDIDATES];
    featuredKeysFor(CANDIDATES, new Date("2026-07-27T00:00:00Z"));
    expect(CANDIDATES).toEqual(original);
  });

  it("is unaffected by the input array's order", () => {
    const date = new Date("2026-07-27T00:00:00Z");
    const inOrder = featuredKeysFor(CANDIDATES, date);
    const shuffledInput = [...CANDIDATES].reverse();
    const reversed = featuredKeysFor(shuffledInput, date);
    expect(reversed).toEqual(inOrder);
  });

  it("never returns more than FEATURED_COUNT keys", () => {
    const result = featuredKeysFor(CANDIDATES, new Date("2026-07-27T00:00:00Z"));
    expect(result.length).toBe(FEATURED_COUNT);
  });

  it("returns every candidate, unpadded, when there are fewer than FEATURED_COUNT", () => {
    const fewCandidates = CANDIDATES.slice(0, 3);
    const result = featuredKeysFor(fewCandidates, new Date("2026-07-27T00:00:00Z"));
    expect(result.length).toBe(3);
    expect([...result].sort()).toEqual([...fewCandidates].sort());
  });

  it("returns an empty array for an empty candidate list", () => {
    expect(featuredKeysFor([], new Date("2026-07-27T00:00:00Z"))).toEqual([]);
  });
});

describe("discountedPrice", () => {
  it("applies the 25% discount and rounds to the nearest coin", () => {
    expect(discountedPrice(400)).toBe(300);
    expect(discountedPrice(100)).toBe(75);
    // 150 * 0.75 = 112.5 -> rounds to 113 (banker's-unaware round-half-up).
    expect(discountedPrice(150)).toBe(113);
  });

  it("never lets the discounted price fall below 1", () => {
    expect(discountedPrice(1)).toBe(1);
    expect(discountedPrice(2)).toBe(2); // 2 * 0.75 = 1.5 -> rounds to 2
    expect(discountedPrice(0)).toBe(1);
  });
});
