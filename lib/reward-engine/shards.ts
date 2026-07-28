import type { Rarity } from "./types";

// Awarded automatically whenever a pack pull turns out to be a card the
// student already owns — a duplicate is never wasted, and rarer duplicates
// award more (matching how rare they statistically are to roll again).
export const DUPLICATE_SHARD_REWARD: Record<Rarity, number> = {
  common: 8,
  rare: 20,
  epic: 50,
  legendary: 120,
};

// What it costs to redeem a specific still-missing card directly with
// shards instead of leaving it to chance. Roughly 7-8x a same-rarity
// duplicate's reward, so finishing off a stubborn last card or two in a
// near-complete universe is achievable without making packs pointless.
export const CARD_REDEEM_SHARD_COST: Record<Rarity, number> = {
  common: 60,
  rare: 160,
  epic: 400,
  legendary: 1000,
};
