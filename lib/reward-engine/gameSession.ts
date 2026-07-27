import "server-only";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { gameSessions, levelCurve, packGrants, students } from "@/lib/db/schema";
import { levelsCrossed } from "./levels";
import { getEffectivePetHappiness, petHappinessCoinMultiplier } from "./pet";

export const GAME_KEYS = [
  "word_catch",
  "memory_match",
  "word_scramble",
  "emoji_quiz",
  "picture_pick",
  "true_or_false",
  "odd_one_out",
  "category_sort",
  "counting_quiz",
  "missing_letter",
  "sequence_memory",
  "balloon_pop",
  "fast_picks",
  "word_rush",
  "category_blitz",
] as const;
export type GameKey = (typeof GAME_KEYS)[number];

// Games award modest XP/coins on top of the classroom-driven economy, not a
// replacement for it.
//
// This cap is deliberately GLOBAL (across every game) rather than per-game.
// It used to be 3 plays *per game*, which meant daily income scaled with how
// many games you owned — 9 rewarded sessions on day one, but 45 once the
// roster was unlocked, so coins/day went from ~110 to ~550-1100. That made
// buying a game a compounding investment (a 40-coin game paid for itself in
// about a day, then printed coins forever) instead of a purchase, and the
// whole shop could be cleared inside a week. One global budget keeps income
// flat and predictable (~150/day) no matter how many games are unlocked, so
// unlocking a game is about variety, not income.
const DAILY_REWARDED_SESSIONS = 12;
const XP_PER_CORRECT = 2;
const COINS_PER_CORRECT = 1;
const PERFECT_BONUS_COINS = 5;

// A live daily streak (lib/reward-engine/dailyClaim.ts) makes every
// rewarded game session pay out a bit better — +5%/day up to +50% at a
// 10-day streak — so playing games and keeping the streak alive reinforce
// each other instead of being two unrelated systems.
const STREAK_BONUS_PER_DAY = 0.05;
const STREAK_BONUS_CAP_DAYS = 10;

export function streakCoinMultiplier(currentStreak: number): number {
  return 1 + Math.min(Math.max(currentStreak, 0), STREAK_BONUS_CAP_DAYS) * STREAK_BONUS_PER_DAY;
}

// A small surprise-chest roll after a rewarded session — mirrors a mobile
// "gold run" bonus spin: mostly a small top-up, rarely a jackpot.
const SPIN_BONUS_TABLE: Array<{ coins: number; weight: number }> = [
  { coins: 2, weight: 40 },
  { coins: 4, weight: 30 },
  { coins: 6, weight: 15 },
  { coins: 10, weight: 10 },
  { coins: 20, weight: 5 },
];

export function rollSpinBonusCoins(rng: () => number = Math.random): number {
  const total = SPIN_BONUS_TABLE.reduce((sum, o) => sum + o.weight, 0);
  let roll = rng() * total;
  for (const option of SPIN_BONUS_TABLE) {
    roll -= option.weight;
    if (roll < 0) return option.coins;
  }
  return SPIN_BONUS_TABLE[SPIN_BONUS_TABLE.length - 1].coins;
}

export interface GameSessionResult {
  rewarded: boolean;
  xpAwarded: number;
  coinsAwarded: number;
  streakMultiplier: number;
  spinBonusCoins: number;
  newXpTotal: number;
  newCoinsBalance: number;
  levelsCrossed: number[];
  playsRemainingToday: number;
}

function todayStartUTC(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function rewardedSessionsToday(studentId: string): Promise<number> {
  const rows = await db
    .select({ id: gameSessions.id })
    .from(gameSessions)
    .where(
      and(
        eq(gameSessions.studentId, studentId),
        eq(gameSessions.rewarded, true),
        gte(gameSessions.playedAt, todayStartUTC())
      )
    );
  return rows.length;
}

/** Rewarded sessions left today across ALL games combined, not per game. */
export async function getRewardedSessionsRemainingToday(studentId: string): Promise<number> {
  return Math.max(0, DAILY_REWARDED_SESSIONS - (await rewardedSessionsToday(studentId)));
}

export async function completeGameSession(
  studentId: string,
  gameKey: GameKey,
  correctCount: number,
  totalCount: number,
  score: number
): Promise<GameSessionResult> {
  return db.transaction(async (tx) => {
    const [student] = await tx
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .for("update");

    const todaysRewarded = await tx
      .select({ id: gameSessions.id })
      .from(gameSessions)
      .where(
        and(
          eq(gameSessions.studentId, studentId),
          eq(gameSessions.rewarded, true),
          gte(gameSessions.playedAt, todayStartUTC())
        )
      );

    const rewarded = todaysRewarded.length < DAILY_REWARDED_SESSIONS;

    let xpAwarded = 0;
    let coinsAwarded = 0;
    let crossedLevels: number[] = [];
    let streakMultiplier = 1;
    let spinBonusCoins = 0;

    if (rewarded) {
      xpAwarded = correctCount * XP_PER_CORRECT;
      streakMultiplier = streakCoinMultiplier(student.currentStreak);
      const petHappiness = getEffectivePetHappiness(student.petHappiness, student.petLastInteractionAt, student.createdAt);
      const petMultiplier = petHappinessCoinMultiplier(petHappiness);
      const baseCoins = correctCount * COINS_PER_CORRECT + (totalCount > 0 && correctCount === totalCount ? PERFECT_BONUS_COINS : 0);
      coinsAwarded = Math.round(baseCoins * streakMultiplier * petMultiplier);
      spinBonusCoins = rollSpinBonusCoins();
      coinsAwarded += spinBonusCoins;

      const oldXp = student.xpTotal;
      const newXp = oldXp + xpAwarded;
      const curveRows = await tx.select().from(levelCurve);
      const crossed = levelsCrossed(oldXp, newXp, curveRows);
      coinsAwarded += crossed.reduce((sum, l) => sum + l.bonusCoins, 0);
      crossedLevels = crossed.map((l) => l.level);

      for (const lvl of crossed) {
        if (lvl.bonusPackTypeId) {
          await tx.insert(packGrants).values({
            studentId,
            packTypeId: lvl.bonusPackTypeId,
            source: `level_up:${lvl.level}`,
          });
        }
      }

      await tx
        .update(students)
        .set({
          xpTotal: newXp,
          coinsBalance: student.coinsBalance + coinsAwarded,
          updatedAt: new Date(),
        })
        .where(eq(students.id, studentId));
    }

    await tx.insert(gameSessions).values({
      studentId,
      gameKey,
      score,
      correctCount,
      totalCount,
      xpAwarded,
      coinsAwarded,
      rewarded,
    });

    return {
      rewarded,
      xpAwarded,
      coinsAwarded,
      streakMultiplier,
      spinBonusCoins,
      newXpTotal: student.xpTotal + xpAwarded,
      newCoinsBalance: student.coinsBalance + coinsAwarded,
      levelsCrossed: crossedLevels,
      playsRemainingToday: Math.max(
        0,
        DAILY_REWARDED_SESSIONS - todaysRewarded.length - (rewarded ? 1 : 0)
      ),
    };
  });
}
