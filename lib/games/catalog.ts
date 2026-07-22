import type { GameKey } from "@/lib/reward-engine/gameSession";

export interface GameMeta {
  key: GameKey;
  name: string;
  tagline: string;
  href: string;
  color: string;
  // Coin cost to unlock (lib/reward-engine/gameUnlocks.ts). Absent/0 = free,
  // no unlock row needed at all — the three original games stay free so a
  // brand-new student always has something to play immediately.
  coinCost?: number;
}

export const GAME_CATALOG: GameMeta[] = [
  {
    key: "word_catch",
    name: "Word Catch",
    tagline: "Catch the right word before it drops!",
    href: "/games/word-catch",
    color: "var(--color-gk-gold)",
  },
  {
    key: "memory_match",
    name: "Memory Match",
    tagline: "Flip cards and find every matching pair!",
    href: "/games/memory-match",
    color: "var(--color-gk-coral)",
  },
  {
    key: "word_scramble",
    name: "Word Scramble",
    tagline: "Unscramble the letters before time runs out!",
    href: "/games/word-scramble",
    color: "var(--color-teal)",
  },
  {
    key: "emoji_quiz",
    name: "Emoji Quiz",
    tagline: "Pick the word that matches the picture!",
    href: "/games/emoji-quiz",
    color: "var(--color-gk-coral)",
    coinCost: 60,
  },
];
