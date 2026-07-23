// Placeholder visual system: emoji + brand-color tiles stand in for
// illustrated character/avatar art, which is a separate content pipeline.
// Keys here must match the `key` values seeded in scripts/seed.ts.

// One entry per curriculum month (lib/games/curriculum.ts) — the collection
// universes are these 12 topics, so the emoji here mirror CURRICULUM's.
export const UNIVERSE_EMOJI: Record<string, string> = {
  space: "🚀",
  culture: "🎉",
  friends: "👫",
  environment: "🌳",
  family: "👪",
  animals: "🐾",
  weather: "⛈️",
  travel: "✈️",
  body: "🖐️",
  halloween: "🎃",
  emotions: "😊",
  christmas: "🎄",
};

export const RARITY_COLOR_VAR: Record<string, string> = {
  common: "var(--color-rarity-common)",
  rare: "var(--color-rarity-rare)",
  epic: "var(--color-rarity-epic)",
  legendary: "var(--color-rarity-legendary)",
};

export function emojiForUniverse(key: string): string {
  return UNIVERSE_EMOJI[key] ?? "❔";
}
