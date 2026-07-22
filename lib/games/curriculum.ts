import { WORD_BANK, wordsUpToDifficulty, type WordCategory, type WordEntry } from "./wordBank";

export interface CurriculumTopic {
  /** Calendar month, 1-12 (January = 1) — the curriculum runs on the real
   * calendar year, not a school-year offset. */
  month: number;
  key: WordCategory;
  label: string;
  emoji: string;
}

export const CURRICULUM: CurriculumTopic[] = [
  { month: 1, key: "space", label: "Space", emoji: "🚀" },
  { month: 2, key: "culture", label: "Culture", emoji: "🎉" },
  { month: 3, key: "friends", label: "Friends", emoji: "👫" },
  { month: 4, key: "environment", label: "Environment", emoji: "🌳" },
  { month: 5, key: "family", label: "Family", emoji: "👪" },
  { month: 6, key: "animals", label: "Animals", emoji: "🐾" },
  { month: 7, key: "weather", label: "Weather", emoji: "⛈️" },
  { month: 8, key: "travel", label: "Travel", emoji: "✈️" },
  { month: 9, key: "body", label: "My Body", emoji: "🖐️" },
  { month: 10, key: "halloween", label: "Halloween", emoji: "🎃" },
  { month: 11, key: "emotions", label: "Emotions", emoji: "😊" },
  { month: 12, key: "christmas", label: "Christmas", emoji: "🎄" },
];

/** Each month is split into 4 weeks of rotating vocabulary under the same
 * topic — days 1-7/8-14/15-21/22-end, so every calendar month (28-31 days)
 * divides evenly into exactly 4 buckets. */
export function getCurriculumWeekIndex(date: Date = new Date()): 1 | 2 | 3 | 4 {
  const day = date.getDate();
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
}

export interface CurrentCurriculum extends CurriculumTopic {
  weekIndex: 1 | 2 | 3 | 4;
  /** e.g. "2026-07" — stable key for "has this student seen this month's
   * announcement yet," distinct per calendar year so the same topic
   * announces again next year rather than being permanently dismissed. */
  monthKey: string;
}

export function getCurrentCurriculum(date: Date = new Date()): CurrentCurriculum {
  const month = date.getMonth() + 1;
  const topic = CURRICULUM.find((c) => c.month === month) ?? CURRICULUM[0];
  const weekIndex = getCurriculumWeekIndex(date);
  const monthKey = `${date.getFullYear()}-${String(month).padStart(2, "0")}`;
  return { ...topic, weekIndex, monthKey };
}

// Below this, very early in the curriculum year (e.g. week 1 of January,
// before any other month has unlocked) there might not be enough distinct
// words for a 4-5 choice game round, so it's topped up with the evergreen,
// non-curriculum categories rather than ever leaving a game short of choices.
const MIN_CURRICULUM_POOL = 8;

const CURRICULUM_KEYS = new Set(CURRICULUM.map((c) => c.key));

/** Same shape as wordsUpToDifficulty, but scoped to what's actually been
 * taught so far: the current month's topic (cumulative through the current
 * week) plus every *past* month's topic this calendar year, in full — so
 * vocabulary keeps building on what a student already learned instead of
 * vanishing the moment the topic changes. Future months never appear, even
 * as filler (that was the bug: a generic "top up with anything" fallback
 * could surface e.g. Halloween words in July). */
export function curriculumWordsUpToDifficulty(maxDifficulty: 1 | 2 | 3, date: Date = new Date()): WordEntry[] {
  const { month, key, weekIndex } = getCurrentCurriculum(date);
  const unlockedTopicKeys = new Set(CURRICULUM.filter((c) => c.month <= month).map((c) => c.key));

  const curriculumPool = WORD_BANK.filter((w) => {
    if (w.difficulty > maxDifficulty) return false;
    if (!unlockedTopicKeys.has(w.category)) return false;
    if (w.category === key) return (w.week ?? 1) <= weekIndex;
    return true; // a past month's topic — fully unlocked, no week ceiling
  });
  if (curriculumPool.length >= MIN_CURRICULUM_POOL) return curriculumPool;

  // Never dip into curriculum topics as filler (that would just reintroduce
  // the future-month leak) — only the categories that were never part of
  // the monthly rotation in the first place (colors, numbers, food, etc).
  const evergreen = wordsUpToDifficulty(maxDifficulty).filter((w) => !CURRICULUM_KEYS.has(w.category));
  const seen = new Set(curriculumPool.map((w) => w.word));
  return [...curriculumPool, ...evergreen.filter((w) => !seen.has(w.word))];
}
