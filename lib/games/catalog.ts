import type { GameKey } from "@/lib/reward-engine/gameSession";
import type { TranslationKey } from "@/lib/i18n/dictionary";

export interface GameMeta {
  key: GameKey;
  // Dictionary keys, not raw strings — this is plain data (not a component),
  // so it can't call useTranslation() itself. Whatever renders the catalog
  // (app/(student)/games/GamesArcade.tsx) looks these up with t(). See
  // lib/i18n/dictionary.ts's "Games: catalog names/taglines" section.
  nameKey: TranslationKey;
  taglineKey: TranslationKey;
  href: string;
  color: string;
  // Level required to unlock (lib/reward-engine/gameUnlocks.ts). Absent =
  // free from level 1, so a brand-new student always has something to play.
  //
  // Games are gated on LEVEL rather than coins on purpose. When they cost
  // coins, unlocking one raised your daily coin income (it added rewarded
  // sessions), so a game paid for itself within a day or two and then
  // printed currency — a faucet dressed up as a sink. Levels come from XP,
  // which you earn by actually playing and learning, so the roster now
  // unlocks on a steady schedule and coins stay purely cosmetic.
  unlockLevel?: number;
}

export const GAME_CATALOG: GameMeta[] = [
  {
    key: "word_catch",
    nameKey: "game.wordCatch.name",
    taglineKey: "game.wordCatch.tagline",
    href: "/games/word-catch",
    color: "var(--color-gk-gold)",
  },
  {
    key: "memory_match",
    nameKey: "game.memoryMatch.name",
    taglineKey: "game.memoryMatch.tagline",
    href: "/games/memory-match",
    color: "var(--color-gk-coral)",
  },
  {
    key: "word_scramble",
    nameKey: "game.wordScramble.name",
    taglineKey: "game.wordScramble.tagline",
    href: "/games/word-scramble",
    color: "var(--color-teal)",
  },
  {
    key: "emoji_quiz",
    nameKey: "game.emojiQuiz.name",
    taglineKey: "game.emojiQuiz.tagline",
    href: "/games/emoji-quiz",
    color: "var(--color-gk-coral)",
    unlockLevel: 4,
  },
  {
    key: "picture_pick",
    nameKey: "game.picturePick.name",
    taglineKey: "game.picturePick.tagline",
    href: "/games/picture-pick",
    color: "var(--color-gk-gold)",
    unlockLevel: 2,
  },
  {
    key: "true_or_false",
    nameKey: "game.trueOrFalse.name",
    taglineKey: "game.trueOrFalse.tagline",
    href: "/games/true-or-false",
    color: "var(--color-teal)",
    unlockLevel: 3,
  },
  {
    key: "odd_one_out",
    nameKey: "game.oddOneOut.name",
    taglineKey: "game.oddOneOut.tagline",
    href: "/games/odd-one-out",
    color: "var(--color-gk-coral)",
    unlockLevel: 5,
  },
  {
    key: "category_sort",
    nameKey: "game.categorySort.name",
    taglineKey: "game.categorySort.tagline",
    href: "/games/category-sort",
    color: "var(--color-teal)",
    unlockLevel: 6,
  },
  {
    key: "counting_quiz",
    nameKey: "game.countingQuiz.name",
    taglineKey: "game.countingQuiz.tagline",
    href: "/games/counting-quiz",
    color: "var(--color-gk-gold)",
    unlockLevel: 7,
  },
  {
    key: "missing_letter",
    nameKey: "game.missingLetter.name",
    taglineKey: "game.missingLetter.tagline",
    href: "/games/missing-letter",
    color: "var(--color-gk-coral)",
    unlockLevel: 8,
  },
  {
    key: "sequence_memory",
    nameKey: "game.sequenceMemory.name",
    taglineKey: "game.sequenceMemory.tagline",
    href: "/games/sequence-memory",
    color: "var(--color-teal)",
    unlockLevel: 9,
  },
  {
    key: "balloon_pop",
    nameKey: "game.balloonPop.name",
    taglineKey: "game.balloonPop.tagline",
    href: "/games/balloon-pop",
    color: "var(--color-gk-gold)",
    unlockLevel: 10,
  },
  {
    key: "fast_picks",
    nameKey: "game.fastPicks.name",
    taglineKey: "game.fastPicks.tagline",
    href: "/games/fast-picks",
    color: "var(--color-gk-coral)",
    unlockLevel: 11,
  },
  {
    key: "word_rush",
    nameKey: "game.wordRush.name",
    taglineKey: "game.wordRush.tagline",
    href: "/games/word-rush",
    color: "var(--color-teal)",
    unlockLevel: 12,
  },
  {
    key: "category_blitz",
    nameKey: "game.categoryBlitz.name",
    taglineKey: "game.categoryBlitz.tagline",
    href: "/games/category-blitz",
    color: "var(--color-gk-gold)",
    unlockLevel: 13,
  },
];
