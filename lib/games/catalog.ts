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
  {
    key: "picture_pick",
    name: "Picture Pick",
    tagline: "A word shows up — tap the picture that matches!",
    href: "/games/picture-pick",
    color: "var(--color-gk-gold)",
    coinCost: 40,
  },
  {
    key: "true_or_false",
    name: "True or False",
    tagline: "Does the word match the picture? Tap yes or no!",
    href: "/games/true-or-false",
    color: "var(--color-teal)",
    coinCost: 40,
  },
  {
    key: "odd_one_out",
    name: "Odd One Out",
    tagline: "Three belong together — find the one that doesn't!",
    href: "/games/odd-one-out",
    color: "var(--color-gk-coral)",
    coinCost: 50,
  },
  {
    key: "category_sort",
    name: "Category Sort",
    tagline: "Tap the group each picture belongs to!",
    href: "/games/category-sort",
    color: "var(--color-teal)",
    coinCost: 50,
  },
  {
    key: "counting_quiz",
    name: "Counting Quiz",
    tagline: "Count the pictures and tap the number word!",
    href: "/games/counting-quiz",
    color: "var(--color-gk-gold)",
    coinCost: 60,
  },
  {
    key: "missing_letter",
    name: "Missing Letter",
    tagline: "Tap the letter that completes the word!",
    href: "/games/missing-letter",
    color: "var(--color-gk-coral)",
    coinCost: 70,
  },
  {
    key: "sequence_memory",
    name: "Sequence Memory",
    tagline: "Watch the pattern, then tap it back in order!",
    href: "/games/sequence-memory",
    color: "var(--color-teal)",
    coinCost: 80,
  },
  {
    key: "balloon_pop",
    name: "Balloon Pop",
    tagline: "Pop the balloon that matches before time runs out!",
    href: "/games/balloon-pop",
    color: "var(--color-gk-gold)",
    coinCost: 90,
  },
  {
    key: "fast_picks",
    name: "Fast Picks",
    tagline: "Pick the right word fast — the clock keeps speeding up!",
    href: "/games/fast-picks",
    color: "var(--color-gk-coral)",
    coinCost: 90,
  },
  {
    key: "word_rush",
    name: "Word Rush",
    tagline: "Answer as many as you can in 30 seconds!",
    href: "/games/word-rush",
    color: "var(--color-teal)",
    coinCost: 100,
  },
  {
    key: "category_blitz",
    name: "Category Blitz",
    tagline: "Sort as many as you can in 30 seconds!",
    href: "/games/category-blitz",
    color: "var(--color-gk-gold)",
    coinCost: 100,
  },
];
