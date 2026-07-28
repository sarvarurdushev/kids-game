import "server-only";
import { and, eq, gte, isNotNull, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { gameSessions, packGrants, questClaims, students, wordReviews } from "@/lib/db/schema";
import { ServiceError } from "@/lib/student/errors";

export type QuestPeriod = "daily" | "weekly";

/** What a quest counts. Every metric is derivable from rows we already write
 * (game_sessions, pack_grants, word_reviews), which is why quests need no
 * event hooks. */
export type QuestMetric =
  | "sessions_played"
  | "correct_answers"
  | "perfect_rounds"
  | "distinct_games"
  | "packs_opened"
  | "words_reviewed";

export interface QuestDef {
  key: string;
  period: QuestPeriod;
  label: string;
  emoji: string;
  metric: QuestMetric;
  target: number;
  rewardCoins: number;
  rewardGoldStars: number;
}

// Daily quests are small and finishable in one sitting; weekly ones are the
// real gold-star faucet. Rewards are deliberately modest against the ~153
// coins/day baseline — quests are a reason to come back and to play *varied*
// games, not a second grinding loop.
export const DAILY_QUESTS: QuestDef[] = [
  { key: "daily_play_3", period: "daily", label: "Play 3 rounds", emoji: "🎮", metric: "sessions_played", target: 3, rewardCoins: 25, rewardGoldStars: 0 },
  { key: "daily_correct_20", period: "daily", label: "Get 20 answers right", emoji: "✅", metric: "correct_answers", target: 20, rewardCoins: 30, rewardGoldStars: 0 },
  { key: "daily_perfect_1", period: "daily", label: "Finish a perfect round", emoji: "⭐", metric: "perfect_rounds", target: 1, rewardCoins: 20, rewardGoldStars: 1 },
  { key: "daily_variety_3", period: "daily", label: "Play 3 different games", emoji: "🎲", metric: "distinct_games", target: 3, rewardCoins: 35, rewardGoldStars: 1 },
  { key: "daily_words_10", period: "daily", label: "Review 10 words", emoji: "🧠", metric: "words_reviewed", target: 10, rewardCoins: 25, rewardGoldStars: 1 },
];

export const WEEKLY_QUESTS: QuestDef[] = [
  { key: "weekly_play_25", period: "weekly", label: "Play 25 rounds this week", emoji: "🏃", metric: "sessions_played", target: 25, rewardCoins: 150, rewardGoldStars: 3 },
  { key: "weekly_correct_150", period: "weekly", label: "Get 150 answers right", emoji: "🎯", metric: "correct_answers", target: 150, rewardCoins: 200, rewardGoldStars: 4 },
  { key: "weekly_perfect_8", period: "weekly", label: "Finish 8 perfect rounds", emoji: "🌟", metric: "perfect_rounds", target: 8, rewardCoins: 175, rewardGoldStars: 5 },
  { key: "weekly_variety_6", period: "weekly", label: "Play 6 different games", emoji: "🕹️", metric: "distinct_games", target: 6, rewardCoins: 150, rewardGoldStars: 3 },
  { key: "weekly_packs_3", period: "weekly", label: "Open 3 packs", emoji: "🎁", metric: "packs_opened", target: 3, rewardCoins: 100, rewardGoldStars: 2 },
  { key: "weekly_words_50", period: "weekly", label: "Review 50 words", emoji: "📚", metric: "words_reviewed", target: 50, rewardCoins: 150, rewardGoldStars: 3 },
];

export const ALL_QUESTS = [...DAILY_QUESTS, ...WEEKLY_QUESTS];

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function dayStartUTC(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Monday 00:00 UTC of the week `now` falls in. */
export function weekStartUTC(now: Date = new Date()): Date {
  const d = dayStartUTC(now);
  // getUTCDay is 0=Sunday; shift so Monday is the first day of the week.
  const daysSinceMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d;
}

export function periodStartFor(period: QuestPeriod, now: Date = new Date()): Date {
  return period === "daily" ? dayStartUTC(now) : weekStartUTC(now);
}

export interface QuestState extends QuestDef {
  progress: number;
  complete: boolean;
  claimed: boolean;
}

/** One aggregate query per period window covers every metric — the quest list
 * is two queries total regardless of how many quests are defined. */
async function metricsFor(studentId: string, since: Date) {
  const [row] = await db
    .select({
      sessions: sql<number>`count(*)`,
      correct: sql<number>`coalesce(sum(${gameSessions.correctCount}), 0)`,
      perfect: sql<number>`count(*) filter (where ${gameSessions.correctCount} = ${gameSessions.totalCount} and ${gameSessions.totalCount} > 0)`,
      distinct: sql<number>`count(distinct ${gameSessions.gameKey})`,
    })
    .from(gameSessions)
    .where(and(eq(gameSessions.studentId, studentId), gte(gameSessions.playedAt, since)));

  const [packs] = await db
    .select({ opened: sql<number>`count(*)` })
    .from(packGrants)
    .where(
      and(
        eq(packGrants.studentId, studentId),
        isNotNull(packGrants.openedAt),
        gte(packGrants.openedAt, since)
      )
    );

  const [words] = await db
    .select({ reviewed: sql<number>`count(*)` })
    .from(wordReviews)
    .where(and(eq(wordReviews.studentId, studentId), gte(wordReviews.reviewedAt, since)));

  return {
    sessions_played: Number(row?.sessions ?? 0),
    correct_answers: Number(row?.correct ?? 0),
    perfect_rounds: Number(row?.perfect ?? 0),
    distinct_games: Number(row?.distinct ?? 0),
    packs_opened: Number(packs?.opened ?? 0),
    words_reviewed: Number(words?.reviewed ?? 0),
  } satisfies Record<QuestMetric, number>;
}

export async function getQuestStates(studentId: string, now: Date = new Date()): Promise<QuestState[]> {
  const dayStart = dayStartUTC(now);
  const weekStart = weekStartUTC(now);

  const [dailyMetrics, weeklyMetrics, claims] = await Promise.all([
    metricsFor(studentId, dayStart),
    metricsFor(studentId, weekStart),
    db
      .select({ questKey: questClaims.questKey, periodStart: questClaims.periodStart })
      .from(questClaims)
      .where(and(eq(questClaims.studentId, studentId), gte(questClaims.periodStart, toDateOnly(weekStart)))),
  ]);

  const claimed = new Set(claims.map((c) => `${c.questKey}:${c.periodStart}`));

  return ALL_QUESTS.map((quest) => {
    const metrics = quest.period === "daily" ? dailyMetrics : weeklyMetrics;
    const progress = Math.min(metrics[quest.metric], quest.target);
    const periodStart = toDateOnly(quest.period === "daily" ? dayStart : weekStart);
    return {
      ...quest,
      progress,
      complete: progress >= quest.target,
      claimed: claimed.has(`${quest.key}:${periodStart}`),
    };
  });
}

export async function claimQuest(studentId: string, questKey: string, now: Date = new Date()) {
  const quest = ALL_QUESTS.find((q) => q.key === questKey);
  if (!quest) throw new ServiceError("Unknown quest", 404);

  const periodStart = toDateOnly(periodStartFor(quest.period, now));

  return db.transaction(async (tx) => {
    // Lock the student row so a double-tap can't award the same quest twice
    // before the unique index below is reached, matching how every other
    // reward path in the app serializes.
    const [student] = await tx.select().from(students).where(eq(students.id, studentId)).for("update");

    const [existing] = await tx
      .select({ id: questClaims.id })
      .from(questClaims)
      .where(
        and(
          eq(questClaims.studentId, studentId),
          eq(questClaims.questKey, questKey),
          eq(questClaims.periodStart, periodStart)
        )
      )
      .limit(1);
    if (existing) throw new ServiceError("Already claimed", 409);

    // Re-derive progress inside the transaction rather than trusting the
    // client's view of it — the whole point of deriving is that it's checkable.
    const since = periodStartFor(quest.period, now);
    const metrics = await metricsFor(studentId, since);
    if (metrics[quest.metric] < quest.target) {
      throw new ServiceError("Quest not finished yet", 400);
    }

    await tx.insert(questClaims).values({
      studentId,
      questKey,
      periodStart,
      coinsAwarded: quest.rewardCoins,
      goldStarsAwarded: quest.rewardGoldStars,
    });

    await tx
      .update(students)
      .set({
        coinsBalance: student.coinsBalance + quest.rewardCoins,
        goldStars: student.goldStars + quest.rewardGoldStars,
        updatedAt: new Date(),
      })
      .where(eq(students.id, studentId));

    return {
      questKey,
      coinsAwarded: quest.rewardCoins,
      goldStarsAwarded: quest.rewardGoldStars,
      coinsBalance: student.coinsBalance + quest.rewardCoins,
      goldStars: student.goldStars + quest.rewardGoldStars,
    };
  });
}

/** Unclaimed-but-finished count, for the nav/home badge. */
export async function getClaimableQuestCount(studentId: string, now: Date = new Date()): Promise<number> {
  const states = await getQuestStates(studentId, now);
  return states.filter((q) => q.complete && !q.claimed).length;
}
