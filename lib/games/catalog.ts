import type { GameKey } from "@/lib/reward-engine/gameSession";

export interface GameMeta {
  key: GameKey;
  name: string;
  tagline: string;
  href: string;
  color: string;
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
    key: "train_the_robot",
    name: "Train the Robot",
    tagline: "Sort pictures into groups and check Sparx's guesses!",
    href: "/ai-lab/train-the-robot",
    color: "var(--color-teal)",
  },
  {
    key: "sequence_builder",
    name: "Sequence Builder",
    tagline: "Put the steps of a routine in the right order!",
    href: "/ai-lab/sequence-builder",
    color: "var(--color-gk-coral)",
  },
];
