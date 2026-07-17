import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  dailyClaims,
  dailyRewardCurve,
  levelCurve,
  packGrants,
  students,
} from "@/lib/db/schema";
import { levelsCrossed } from "./levels";

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function todayUTC(): string {
  return toDateOnly(new Date());
}

function yesterdayUTC(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return toDateOnly(d);
}

export interface DailyClaimResult {
  alreadyClaimedToday: boolean;
  cycleDay: number;
  xpAwarded: number;
  coinsAwarded: number;
  newStreak: number;
  levelsCrossed: number[];
  packGranted: string | null;
}

/** Streak continues if the student's last claim was yesterday, resets to 1 otherwise (including a first-ever claim). */
function nextStreak(lastClaimDate: string | null, currentStreak: number): number {
  return lastClaimDate === yesterdayUTC() ? currentStreak + 1 : 1;
}

function cycleDayFor(streak: number): number {
  return ((streak - 1) % 7) + 1;
}

export async function getDailyClaimStatus(studentId: string) {
  const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  const today = todayUTC();
  const [existingClaim] = await db
    .select()
    .from(dailyClaims)
    .where(and(eq(dailyClaims.studentId, studentId), eq(dailyClaims.claimDate, today)))
    .limit(1);

  const projectedStreak = existingClaim
    ? student.currentStreak
    : nextStreak(student.lastClaimDate, student.currentStreak);
  const cycleDay = cycleDayFor(projectedStreak);
  const [reward] = await db
    .select()
    .from(dailyRewardCurve)
    .where(eq(dailyRewardCurve.cycleDay, cycleDay))
    .limit(1);

  return {
    claimedToday: Boolean(existingClaim),
    cycleDay,
    currentStreak: student.currentStreak,
    projectedStreak,
    nextReward: reward
      ? {
          xpReward: reward.xpReward,
          coinReward: reward.coinReward,
          packTypeId: reward.packTypeId,
        }
      : null,
  };
}

export async function claimDailyReward(studentId: string): Promise<DailyClaimResult> {
  return db.transaction(async (tx) => {
    const [student] = await tx
      .select()
      .from(students)
      .where(eq(students.id, studentId))
      .for("update");

    const today = todayUTC();
    const [existingClaim] = await tx
      .select()
      .from(dailyClaims)
      .where(and(eq(dailyClaims.studentId, studentId), eq(dailyClaims.claimDate, today)))
      .limit(1);

    if (existingClaim) {
      return {
        alreadyClaimedToday: true,
        cycleDay: existingClaim.cycleDay,
        xpAwarded: existingClaim.xpAwarded,
        coinsAwarded: existingClaim.coinsAwarded,
        newStreak: student.currentStreak,
        levelsCrossed: [],
        packGranted: existingClaim.packGrantId,
      };
    }

    const newStreak = nextStreak(student.lastClaimDate, student.currentStreak);
    const cycleDay = cycleDayFor(newStreak);

    const [reward] = await tx
      .select()
      .from(dailyRewardCurve)
      .where(eq(dailyRewardCurve.cycleDay, cycleDay))
      .limit(1);
    if (!reward) {
      throw new Error(`No daily_reward_curve row configured for cycle day ${cycleDay}`);
    }

    const oldXp = student.xpTotal;
    const newXp = oldXp + reward.xpReward;
    const curveRows = await tx.select().from(levelCurve);
    const crossed = levelsCrossed(oldXp, newXp, curveRows);
    const levelBonusCoins = crossed.reduce((sum, l) => sum + l.bonusCoins, 0);

    let packGrantId: string | null = null;
    if (reward.packTypeId) {
      const [grant] = await tx
        .insert(packGrants)
        .values({ studentId, packTypeId: reward.packTypeId, source: "daily_claim" })
        .returning({ id: packGrants.id });
      packGrantId = grant.id;
    }
    for (const lvl of crossed) {
      if (lvl.bonusPackTypeId) {
        await tx.insert(packGrants).values({
          studentId,
          packTypeId: lvl.bonusPackTypeId,
          source: `level_up:${lvl.level}`,
        });
      }
    }

    const coinsAwarded = reward.coinReward + levelBonusCoins;

    await tx
      .update(students)
      .set({
        xpTotal: newXp,
        coinsBalance: student.coinsBalance + coinsAwarded,
        currentStreak: newStreak,
        longestStreak: Math.max(student.longestStreak, newStreak),
        lastClaimDate: today,
        updatedAt: new Date(),
      })
      .where(eq(students.id, studentId));

    await tx.insert(dailyClaims).values({
      studentId,
      claimDate: today,
      cycleDay,
      xpAwarded: reward.xpReward,
      coinsAwarded,
      packGrantId,
    });

    return {
      alreadyClaimedToday: false,
      cycleDay,
      xpAwarded: reward.xpReward,
      coinsAwarded,
      newStreak,
      levelsCrossed: crossed.map((l) => l.level),
      packGranted: packGrantId,
    };
  });
}
