import type { CharacterConfig, Rarity, RarityWeights } from "./types";

export const DEFAULT_RARITY_WEIGHTS: RarityWeights = {
  common: 60,
  rare: 25,
  epic: 10,
  legendary: 5,
};

const RARITY_ORDER: Rarity[] = ["common", "rare", "epic", "legendary"];

export type Rng = () => number; // uniform [0, 1)

export interface UniversePoolEntry {
  universeId: string;
  weight: number;
}

function pickRarity(weights: RarityWeights, rng: Rng): Rarity {
  const total = RARITY_ORDER.reduce((sum, r) => sum + weights[r], 0);
  let roll = rng() * total;
  for (const rarity of RARITY_ORDER) {
    roll -= weights[rarity];
    if (roll < 0) return rarity;
  }
  return RARITY_ORDER[RARITY_ORDER.length - 1];
}

function pickUniverse(pool: UniversePoolEntry[], rng: Rng): string {
  const total = pool.reduce((sum, p) => sum + p.weight, 0);
  let roll = rng() * total;
  for (const p of pool) {
    roll -= p.weight;
    if (roll < 0) return p.universeId;
  }
  return pool[pool.length - 1].universeId;
}

/**
 * Rolls `cardCount` cards for a pack. `pool` restricts which universe(s) the
 * pack draws from (e.g. a Discovery Pack's pool is Discovery-only); rarity is
 * rolled independently per card against `rarityWeights`. Falls back to any
 * character in the chosen universe if none exist at the rolled rarity, so a
 * thin catalog never produces an empty card.
 */
export function rollPackContents(
  cardCount: number,
  pool: UniversePoolEntry[],
  charactersByUniverse: Map<string, CharacterConfig[]>,
  rng: Rng = Math.random,
  rarityWeights: RarityWeights = DEFAULT_RARITY_WEIGHTS
): CharacterConfig[] {
  if (pool.length === 0) return [];
  const results: CharacterConfig[] = [];

  for (let i = 0; i < cardCount; i++) {
    const universeId = pickUniverse(pool, rng);
    const rarity = pickRarity(rarityWeights, rng);
    const universeCharacters = charactersByUniverse.get(universeId) ?? [];
    const atRarity = universeCharacters.filter((c) => c.rarity === rarity);
    const candidates = atRarity.length > 0 ? atRarity : universeCharacters;
    if (candidates.length === 0) continue;
    const index = Math.floor(rng() * candidates.length);
    results.push(candidates[index]);
  }

  return results;
}
