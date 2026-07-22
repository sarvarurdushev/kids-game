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

// Below this, a brand-new topic's first week or two wouldn't have enough
// distinct words for a 4-5 choice game round, so it's topped up with the
// evergreen pool rather than ever leaving a game short of choices.
const MIN_CURRICULUM_POOL = 8;

/** Same shape as wordsUpToDifficulty, but scoped to the current month's
 * curriculum topic (cumulative through the current week), so a game's
 * vocabulary follows what's actually being taught right now. */
export function curriculumWordsUpToDifficulty(maxDifficulty: 1 | 2 | 3, date: Date = new Date()): WordEntry[] {
  const { key, weekIndex } = getCurrentCurriculum(date);
  const curriculumPool = WORD_BANK.filter(
    (w) => w.category === key && (w.week ?? 1) <= weekIndex && w.difficulty <= maxDifficulty
  );
  if (curriculumPool.length >= MIN_CURRICULUM_POOL) return curriculumPool;

  // wordsUpToDifficulty has no concept of "week," so on its own it would leak
  // this same topic's not-yet-reached words (e.g. week 3's "storm" appearing
  // during week 2) — excluded here; they'll join the pool once their week
  // arrives. Other categories' words are fair game as generic filler.
  const isSameTopicButFuture = (w: WordEntry) => w.category === key && (w.week ?? 1) > weekIndex;
  const fallback = wordsUpToDifficulty(maxDifficulty).filter((w) => !isSameTopicButFuture(w));
  const seen = new Set(curriculumPool.map((w) => w.word));
  return [...curriculumPool, ...fallback.filter((w) => !seen.has(w.word))];
}
