// Placeholder visual system: emoji + brand-color tiles stand in for
// illustrated character/avatar art, which is a separate content pipeline.
// Keys here must match the `key` values seeded in scripts/seed.ts.

export const UNIVERSE_EMOJI: Record<string, string> = {
  ocean: "🌊",
  dinosaur: "🦖",
  space: "🚀",
  story: "📖",
  discovery: "🔬",
};

export const AVATAR_ITEM_EMOJI: Record<string, string> = {
  hair_brown: "💇",
  hair_curly: "💇‍♀️",
  hair_spiky: "🧑‍🦱",
  hair_pigtails: "👧",
  eyes_round: "👀",
  eyes_star: "✨",
  eyes_sparkle: "😍",
  clothes_tshirt: "👕",
  clothes_hoodie: "🧥",
  clothes_dress: "👗",
  clothes_superhero: "🦸",
  hat_cap: "🧢",
  hat_wizard: "🎩",
  hat_crown: "👑",
  hat_party: "🥳",
  accessory_glasses: "🕶️",
  accessory_bowtie: "🎀",
  accessory_scarf: "🧣",
  accessory_medal: "🏅",
  background_sunny: "☀️",
  background_stars: "🌌",
  background_rainbow: "🌈",
  background_forest: "🌳",
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

export function emojiForAvatarItem(key: string): string {
  return AVATAR_ITEM_EMOJI[key] ?? "❔";
}
