import "server-only";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { gameSessions, levelCurve, packGrants, students } from "@/lib/db/schema";
import { levelsCrossed } from "./levels";

export const GAME_KEYS = [
  "word_catch",
  "memory_match",
  "word_scramble",
  "train_the_robot",
  "sequence_builder",
] as const;
export type GameKey = (typeof GAME_KEYS)[number];

// Games award modest XP/coins on top of the classroom-driven economy, not a
// replacement for it — a daily cap per game keeps grinding from becoming a
// more efficient path to coins than actually attending class.
const DAILY_REWARDED_PLAYS_PER_GAME = 3;
const XP_PER_CORRECT = 2;
const COINS_PER_CORRECT = 1;
const PERFECT_BONUS_COINS = 5;

export interface GameSessionResult {
  rewarded: boolean;
  xpAwarded: number;
  coinsAwarded: number;
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

    if (rewarded) {
      xpAwarded = correctCount * XP_PER_CORRECT;
      coinsAwarded = correctCount * COINS_PER_CORRECT;
      if (totalCount > 0 && correctCount === totalCount) {
        coinsAwarded += PERFECT_BONUS_COINS;
      }

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
