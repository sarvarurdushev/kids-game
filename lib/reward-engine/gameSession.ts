import "server-only";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { gameSessions, levelCurve, packGrants, students } from "@/lib/db/schema";
import { levelsCrossed } from "./levels";
import { getEffectivePetHappiness, petHappinessCoinMultiplier } from "./pet";

export const GAME_KEYS = ["word_catch", "memory_match", "word_scramble", "emoji_quiz"] as const;
export type GameKey = (typeof GAME_KEYS)[number];

// Games award modest XP/coins on top of the classroom-driven economy, not a
// replacement for it — a daily cap per game keeps grinding from becoming a
// more efficient path to coins than actually attending class.
const DAILY_REWARDED_PLAYS_PER_GAME = 3;
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

async function rewardedPlaysToday(studentId: string, gameKey: GameKey): Promise<number> {
  const rows = await db
    .select({ id: gameSessions.id })
    .from(gameSessions)
    .where(
      and(
        eq(gameSessions.studentId, studentId),
        eq(gameSessions.gameKey, gameKey),
        eq(gameSessions.rewarded, true),
        gte(gameSessions.playedAt, todayStartUTC())
      )
    );
  return rows.length;
}

export async function getGamePlaysRemainingToday(studentId: string, gameKey: GameKey): Promise<number> {
  return Math.max(0, DAILY_REWARDED_PLAYS_PER_GAME - (await rewardedPlaysToday(studentId, gameKey)));
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
          eq(gameSessions.gameKey, gameKey),
          eq(gameSessions.rewarded, true),
          gte(gameSessions.playedAt, todayStartUTC())
        )
      );

    const rewarded = todaysRewarded.length < DAILY_REWARDED_PLAYS_PER_GAME;

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
        DAILY_REWARDED_PLAYS_PER_GAME - todaysRewarded.length - (rewarded ? 1 : 0)
      ),
    };
  });
}
