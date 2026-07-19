import type { Rarity, RarityWeights } from "./types";

export type Rng = () => number; // uniform [0, 1)

const RARITY_ORDER: Rarity[] = ["common", "rare", "epic", "legendary"];

export interface CaseItemConfig {
  id: string;
  rarity: Rarity;
}

function pickRarity(weights: RarityWeights, rng: Rng): Rarity {
  const total = RARITY_ORDER.reduce((sum, r) => sum + (weights[r] ?? 0), 0);
  if (total <= 0) return RARITY_ORDER[0];
  let roll = rng() * total;
  for (const rarity of RARITY_ORDER) {
    roll -= weights[rarity] ?? 0;
    if (roll < 0) return rarity;
  }
  return RARITY_ORDER[RARITY_ORDER.length - 1];
}

/**
 * Rolls one item from a case: pick a rarity per the case's configured odds,
 * then a random item at that rarity — preferring ones the student doesn't
 * already own, so opening cases feels like progress rather than a coin sink
 * once the easy rarities are filled out. Falls back to any item at the
 * rolled rarity (everything at that tier already owned), then to any
 * not-owned item in the whole pool, then to any item at all, so a thin or
 * fully-collected catalog never comes back empty.
 */
export function rollCaseItem(
  pool: CaseItemConfig[],
  ownedIds: Set<string>,
  rarityWeights: RarityWeights,
  rng: Rng = Math.random
): CaseItemConfig | null {
  if (pool.length === 0) return null;
  const rarity = pickRarity(rarityWeights, rng);
  const atRarity = pool.filter((p) => p.rarity === rarity);
  const unownedAtRarity = atRarity.filter((p) => !ownedIds.has(p.id));
  const unownedAny = pool.filter((p) => !ownedIds.has(p.id));
  const candidates =
    unownedAtRarity.length > 0
      ? unownedAtRarity
      : atRarity.length > 0
        ? atRarity
        : unownedAny.length > 0
          ? unownedAny
          : pool;
  const index = Math.floor(rng() * candidates.length);
  return candidates[index];
}
