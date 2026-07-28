import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { wordProgress, wordReviews, students } from "@/lib/db/schema";
import { curriculumWordsUpToDifficulty } from "@/lib/games/curriculum";
import { WORD_BANK, shuffle, type WordEntry } from "@/lib/games/wordBank";
import { ServiceError } from "./errors";

export const LEITNER_INTERVAL_DAYS = [1, 2, 4, 7, 14];
export const MAX_BOX = 5;
const REVIEW_QUEUE_CAP = 20;

export interface WordBookSummary {
  totalWords: number;
  dueCount: number;
  masteredCount: number; // box === MAX_BOX
  queue: WordEntry[]; // due words, capped at REVIEW_QUEUE_CAP, for the review flow
}

function dueAtFor(box: number, now: Date): Date {
  const days = LEITNER_INTERVAL_DAYS[box - 1];
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

/** Full summary of a student's spaced-repetition state over every word
 * they've been taught so far (lib/games/curriculum.ts's taught-word pool) —
 * how many are due right now, how many are fully mastered, and a shuffled,
 * capped queue of due words ready for the review flow. */
export async function getWordBookSummary(studentId: string, now: Date = new Date()): Promise<WordBookSummary> {
  const pool = curriculumWordsUpToDifficulty(3, now);
  if (pool.length === 0) {
    return { totalWords: 0, dueCount: 0, masteredCount: 0, queue: [] };
  }

  const poolWords = pool.map((w) => w.word);
  const rows = await db
    .select()
    .from(wordProgress)
    .where(and(eq(wordProgress.studentId, studentId), inArray(wordProgress.word, poolWords)));
  const rowByWord = new Map(rows.map((r) => [r.word, r]));

  const dueWords: WordEntry[] = [];
  let masteredCount = 0;
  for (const entry of pool) {
    const row = rowByWord.get(entry.word);
    if (!row) {
      dueWords.push(entry);
      continue;
    }
    if (row.box === MAX_BOX) masteredCount += 1;
    if (row.dueAt <= now) dueWords.push(entry);
  }

  return {
    totalWords: pool.length,
    dueCount: dueWords.length,
    masteredCount,
    queue: shuffle(dueWords).slice(0, REVIEW_QUEUE_CAP),
  };
}

/** Lightweight variant for badges/banners that only need the due count, so
 * secondary UI (Games page link, Home banner) doesn't have to pull the full
 * pool + queue just to show a number. */
export async function getWordBookDueCount(studentId: string, now: Date = new Date()): Promise<number> {
  const pool = curriculumWordsUpToDifficulty(3, now);
  if (pool.length === 0) return 0;

  const poolWords = pool.map((w) => w.word);
  const rows = await db
    .select({ word: wordProgress.word, dueAt: wordProgress.dueAt })
    .from(wordProgress)
    .where(and(eq(wordProgress.studentId, studentId), inArray(wordProgress.word, poolWords)));
  const rowByWord = new Map(rows.map((r) => [r.word, r]));

  let dueCount = 0;
  for (const entry of pool) {
    const row = rowByWord.get(entry.word);
    if (!row || row.dueAt <= now) dueCount += 1;
  }
  return dueCount;
}

/** Reviews one word: moves it up a Leitner box on "I knew it", resets it to
 * box 1 on "Still learning", and schedules its next dueAt accordingly. A
 * word with no existing progress row is being reviewed for the first time —
 * treated as starting from box 1, so a correct first review promotes it to
 * box 2 (box 1 was "too easy") while a wrong one just keeps it at box 1. */
export async function reviewWord(
  studentId: string,
  word: string,
  knewIt: boolean,
  now: Date = new Date()
): Promise<{ box: number; dueAt: Date }> {
  if (!WORD_BANK.some((w) => w.word === word)) {
    throw new ServiceError("Unknown word", 404);
  }

  return db.transaction(async (tx) => {
    // Lock the student row so a double-tap can't race, matching every other
    // mutation in this codebase — even though this path doesn't touch
    // coins/xp, it keeps the serialization pattern consistent.
    await tx.select().from(students).where(eq(students.id, studentId)).for("update");

    const [existing] = await tx
      .select()
      .from(wordProgress)
      .where(and(eq(wordProgress.studentId, studentId), eq(wordProgress.word, word)))
      .limit(1);

    const currentBox = existing?.box ?? 1;
    const newBox = knewIt ? Math.min(currentBox + 1, MAX_BOX) : 1;
    const dueAt = dueAtFor(newBox, now);
    const reviewCount = (existing?.reviewCount ?? 0) + 1;

    await tx
      .insert(wordProgress)
      .values({ studentId, word, box: newBox, dueAt, lastReviewedAt: now, reviewCount })
      .onConflictDoUpdate({
        target: [wordProgress.studentId, wordProgress.word],
        set: { box: newBox, dueAt, lastReviewedAt: now, reviewCount },
      });

    await tx.insert(wordReviews).values({ studentId, word, knewIt });

    return { box: newBox, dueAt };
  });
}
