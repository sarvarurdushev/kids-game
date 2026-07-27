// Pure, DB-free module: the weekly "Featured" shop rotation is derived
// entirely from the current date, not stored anywhere. Same ISO week ⇒ same
// featured set for every student, with no table to seed and no cron to run.
// Keeping this free of DB imports also makes it trivial to unit test.

export const FEATURED_DISCOUNT = 0.25;
export const FEATURED_COUNT = 6;

/**
 * ISO-8601 week key, e.g. "2026-W31". ISO weeks start Monday, and week 1 is
 * defined as the week containing the year's first Thursday — so a date in
 * early January can belong to the *previous* ISO year's last week. E.g.
 * 2027-01-01 is a Friday, which puts it in 2026-W53, not 2027-W01.
 */
export function isoWeekKey(date: Date): string {
  // Read UTC calendar fields, not local ones. Using getFullYear/getMonth/
  // getDate here would make the rotation depend on the server's timezone —
  // the same instant resolves to a different ISO week under, say,
  // America/New_York than under UTC, and the rotation would roll over at
  // local midnight while quests and daily claims (which are explicitly UTC)
  // roll at UTC midnight. Everything time-bucketed in this app is UTC.
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7; // Mon=1 ... Sun=7 (getUTCDay's Sunday=0 becomes 7)
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // jump to the Thursday of this ISO week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

/** Small string hash (djb2-ish) turning the week key into a numeric PRNG seed. */
function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(h, 31) + input.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, deterministic PRNG. Good enough for "shuffle a
 * shop shelf," not for anything security-sensitive. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministically picks up to FEATURED_COUNT keys to feature for the ISO
 * week containing `date`. Candidates are sorted defensively before shuffling
 * so callers passing the same set in a different order (e.g. after a DB
 * query re-sorts rows) land on the same featured set, and the input array is
 * never mutated — the shuffle operates on a copy.
 */
export function featuredKeysFor(candidateKeys: string[], date: Date): string[] {
  const shuffled = [...candidateKeys].sort();
  const rng = mulberry32(hashString(isoWeekKey(date)));

  // Fisher-Yates shuffle of the copy.
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, FEATURED_COUNT);
}

/** Applies the featured discount, rounded to the nearest coin, floored at 1
 * so a cheap item never goes free. */
export function discountedPrice(basePrice: number): number {
  return Math.max(1, Math.round(basePrice * (1 - FEATURED_DISCOUNT)));
}
