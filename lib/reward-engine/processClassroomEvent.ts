import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  achievements as achievementsTable,
  levelCurve,
  packGrants,
  rewardRules,
  studentAchievements,
  studentAvatarItems,
  studentEventCounters,
  studentExternalRefs,
  students,
  webhookEvents,
} from "@/lib/db/schema";
import { evaluateEvent } from "./rules";
import { levelsCrossed } from "./levels";
import { checkAchievementUnlocks } from "./achievements";
import type { ClassroomEventMetrics, ClassroomProgram } from "./types";

export interface ProcessClassroomEventInput {
  sourceSystem: string;
  externalEventId: string | null;
  studentExternalId: string;
  program: ClassroomProgram | null;
  metrics: ClassroomEventMetrics;
  rawPayload: unknown;
}

export type ProcessClassroomEventResult =
  | {
      status: "duplicate" | "processed";
      webhookEventId: string;
      studentId: string;
      xpAwarded: number;
      coinsAwarded: number;
      triggeredRules: string[];
      levelsCrossed: number[];
      achievementsUnlocked: string[];
      packsGranted: string[];
    }
  | {
      status: "unresolved_student";
      webhookEventId: string;
    };

/**
 * Ingests one classroom AI event. Idempotent per (sourceSystem, externalEventId):
 * a resend of the same external_event_id returns the originally computed result
 * instead of double-awarding anything.
 *
 * The webhook_events audit row is inserted and committed *before* the reward
 * transaction starts, so if the reward transaction throws, the audit row still
 * exists and can be marked failed in the catch block below — the failure is
 * recorded, not silently swallowed along with the rolled-back reward writes.
 */
export async function processClassroomEvent(
  input: ProcessClassroomEventInput
): Promise<ProcessClassroomEventResult> {
  const [inserted] = await db
    .insert(webhookEvents)
    .values({
      sourceSystem: input.sourceSystem,
      externalEventId: input.externalEventId,
      studentExternalId: input.studentExternalId,
      program: input.program,
      rawPayload: input.rawPayload as object,
    })
    .onConflictDoNothing({
      target: [webhookEvents.sourceSystem, webhookEvents.externalEventId],
      where: sql`${webhookEvents.externalEventId} is not null`,
    })
    .returning({ id: webhookEvents.id });

  if (!inserted) {
    const [existing] = await db
      .select()
      .from(webhookEvents)
      .where(
        and(
          eq(webhookEvents.sourceSystem, input.sourceSystem),
          eq(webhookEvents.externalEventId, input.externalEventId ?? "")
        )
      )
      .limit(1);
    const previousResult = (existing?.result ?? {}) as Record<string, unknown>;
    return {
      ...(previousResult as object),
      status: "duplicate",
      webhookEventId: existing?.id ?? "",
    } as ProcessClassroomEventResult;
  }

  const webhookEventId = inserted.id;

  try {
    return await db.transaction(async (tx) => {
      const [ref] = await tx
        .select({ studentId: studentExternalRefs.studentId })
        .from(studentExternalRefs)
        .where(
          and(
            eq(studentExternalRefs.sourceSystem, input.sourceSystem),
            eq(studentExternalRefs.externalId, input.studentExternalId)
          )
        )
        .limit(1);

      if (!ref) {
        await tx
          .update(webhookEvents)
          .set({
            status: "failed",
            errorMessage: `No student linked for ${input.sourceSystem}:${input.studentExternalId}`,
            processedAt: new Date(),
          })
          .where(eq(webhookEvents.id, webhookEventId));
        return { status: "unresolved_student", webhookEventId };
      }

      const studentId = ref.studentId;

      const activeRules = await tx
        .select()
        .from(rewardRules)
        .where(eq(rewardRules.active, true));
      const triggered = evaluateEvent(input.metrics, input.program, activeRules);

      const xpDelta = triggered.reduce((sum, r) => sum + r.xpAmount, 0);
      const coinDelta = triggered.reduce((sum, r) => sum + r.coinAmount, 0);

      const [student] = await tx
        .select()
        .from(students)
        .where(eq(students.id, studentId))
        .for("update");

      const oldXp = student.xpTotal;
      const newXp = oldXp + xpDelta;

      const curveRows = await tx.select().from(levelCurve);
      const crossedLevels = levelsCrossed(oldXp, newXp, curveRows);
      const levelBonusCoins = crossedLevels.reduce((s, l) => s + l.bonusCoins, 0);

      await tx
        .update(students)
        .set({
          xpTotal: newXp,
          coinsBalance: student.coinsBalance + coinDelta + levelBonusCoins,
          updatedAt: new Date(),
        })
        .where(eq(students.id, studentId));

      const touchedEventKeys = Array.from(
        new Set(triggered.map((r) => r.ruleKey))
      );
      for (const eventKey of touchedEventKeys) {
        await tx
          .insert(studentEventCounters)
          .values({ studentId, eventKey, count: 1 })
          .onConflictDoUpdate({
            target: [
              studentEventCounters.studentId,
              studentEventCounters.eventKey,
            ],
            set: { count: sql`${studentEventCounters.count} + 1` },
          });
      }

      const packsGranted: string[] = [];
      for (const lvl of crossedLevels) {
        if (lvl.bonusPackTypeId) {
          const [grant] = await tx
            .insert(packGrants)
            .values({
              studentId,
              packTypeId: lvl.bonusPackTypeId,
              source: `level_up:${lvl.level}`,
            })
            .returning({ id: packGrants.id });
          packsGranted.push(grant.id);
        }
      }

      const achievementsUnlocked: string[] = [];
      let achievementCoinBonus = 0;
      if (touchedEventKeys.length > 0) {
        const relevantAchievements = await tx
          .select()
          .from(achievementsTable)
          .where(inArray(achievementsTable.eventKey, touchedEventKeys));

        const alreadyUnlockedRows = await tx
          .select({ achievementId: studentAchievements.achievementId })
          .from(studentAchievements)
          .where(eq(studentAchievements.studentId, studentId));
        const alreadyUnlockedIds = new Set(
          alreadyUnlockedRows.map((r) => r.achievementId)
        );

        const counterRows = await tx
          .select()
          .from(studentEventCounters)
          .where(
            and(
              eq(studentEventCounters.studentId, studentId),
              inArray(studentEventCounters.eventKey, touchedEventKeys)
            )
          );
        const countsByEventKey = new Map(
          counterRows.map((r) => [r.eventKey, r.count])
        );

        for (const eventKey of touchedEventKeys) {
          const count = countsByEventKey.get(eventKey) ?? 0;
          const unlocks = checkAchievementUnlocks(
            eventKey,
            count,
            relevantAchievements,
            alreadyUnlockedIds
          );

          for (const unlock of unlocks) {
            await tx
              .insert(studentAchievements)
              .values({ studentId, achievementId: unlock.achievementId });
            alreadyUnlockedIds.add(unlock.achievementId);

            if (unlock.rewardCoins > 0) {
              await tx
                .update(students)
                .set({
                  coinsBalance: sql`${students.coinsBalance} + ${unlock.rewardCoins}`,
                })
                .where(eq(students.id, studentId));
              achievementCoinBonus += unlock.rewardCoins;
            }
            if (unlock.rewardPackTypeId) {
              const [grant] = await tx
                .insert(packGrants)
                .values({
                  studentId,
                  packTypeId: unlock.rewardPackTypeId,
                  source: `achievement:${unlock.key}`,
                })
                .returning({ id: packGrants.id });
              packsGranted.push(grant.id);
            }
            if (unlock.rewardAvatarItemId) {
              await tx
                .insert(studentAvatarItems)
                .values({
                  studentId,
                  avatarItemId: unlock.rewardAvatarItemId,
                  acquiredVia: `achievement:${unlock.key}`,
                })
                .onConflictDoNothing();
            }
            achievementsUnlocked.push(unlock.key);
          }
        }
      }

      const result: ProcessClassroomEventResult = {
        status: "processed",
        webhookEventId,
        studentId,
        xpAwarded: xpDelta,
        coinsAwarded: coinDelta + levelBonusCoins + achievementCoinBonus,
        triggeredRules: triggered.map((t) => t.ruleKey),
        levelsCrossed: crossedLevels.map((l) => l.level),
        achievementsUnlocked,
        packsGranted,
      };

      await tx
        .update(webhookEvents)
        .set({
          status: "processed",
          result: result as object,
          studentId,
          processedAt: new Date(),
        })
        .where(eq(webhookEvents.id, webhookEventId));

      return result;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db
      .update(webhookEvents)
      .set({ status: "failed", errorMessage: message, processedAt: new Date() })
      .where(eq(webhookEvents.id, webhookEventId))
      .catch(() => undefined);
    throw error;
  }
}
