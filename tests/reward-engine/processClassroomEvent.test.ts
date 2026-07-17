import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  achievements as achievementsTable,
  levelCurve,
  packTypes,
  rewardRules,
  students,
  studentExternalRefs,
  webhookEvents,
} from "@/lib/db/schema";
import { processClassroomEvent } from "@/lib/reward-engine/processClassroomEvent";

const SOURCE_SYSTEM = "test_source_system";
const RULE_KEYS = ["test_attendance", "test_participation"];
const ACHIEVEMENT_KEY = "test_first_class";
const PACK_TYPE_KEY = "test_achievement_pack";
const LEVELS = [1, 2, 3];
const TEST_LEVEL_CURVE = [
  { level: 1, minXp: 0, bonusCoins: 0, bonusPackTypeId: null as string | null },
  { level: 2, minXp: 100, bonusCoins: 10, bonusPackTypeId: null as string | null },
  { level: 3, minXp: 250, bonusCoins: 15, bonusPackTypeId: null as string | null },
];

// Seeded reward rules ("class_attendance", "active_participation") match the
// same metrics fields this test drives, so they'd double-fire alongside the
// test's own rules. Deactivate them for the test window and restore after.
const COLLIDING_SOURCE_FIELDS = ["attendance", "participationScore"];

let packTypeId: string;
// levels 1-3 already exist once the real seed data has run; this test needs
// exact control over their thresholds, so snapshot whatever's there and
// restore it in afterAll instead of deleting real seeded rows.
let priorLevelCurveRows: (typeof TEST_LEVEL_CURVE)[number][] = [];
let deactivatedRuleIds: string[] = [];

async function createTestStudent(externalId: string) {
  const [student] = await db
    .insert(students)
    .values({
      displayName: "Test Student",
      enrollmentCode: `test-${externalId}-${Math.random().toString(36).slice(2)}`,
      pinHash: "unused-in-this-test",
    })
    .returning();
  await db.insert(studentExternalRefs).values({
    studentId: student.id,
    sourceSystem: SOURCE_SYSTEM,
    externalId,
  });
  return student;
}

async function cleanupStudent(studentId: string) {
  await db.delete(webhookEvents).where(eq(webhookEvents.studentId, studentId));
  await db.delete(students).where(eq(students.id, studentId));
}

beforeAll(async () => {
  const [packType] = await db
    .insert(packTypes)
    .values({ key: PACK_TYPE_KEY, name: "Test Achievement Pack", coinCost: 999999 })
    .returning();
  packTypeId = packType.id;

  priorLevelCurveRows = await db
    .select()
    .from(levelCurve)
    .where(inArray(levelCurve.level, LEVELS));

  for (const row of TEST_LEVEL_CURVE) {
    const bonusPackTypeId = row.level === 3 ? packTypeId : null;
    await db
      .insert(levelCurve)
      .values({ ...row, bonusPackTypeId })
      .onConflictDoUpdate({
        target: levelCurve.level,
        set: { minXp: row.minXp, bonusCoins: row.bonusCoins, bonusPackTypeId },
      });
  }

  const collidingRules = await db
    .select({ id: rewardRules.id })
    .from(rewardRules)
    .where(
      and(inArray(rewardRules.sourceField, COLLIDING_SOURCE_FIELDS), eq(rewardRules.active, true))
    );
  deactivatedRuleIds = collidingRules.map((r) => r.id);
  if (deactivatedRuleIds.length > 0) {
    await db
      .update(rewardRules)
      .set({ active: false })
      .where(inArray(rewardRules.id, deactivatedRuleIds));
  }

  await db.insert(rewardRules).values([
    {
      ruleKey: "test_attendance",
      triggerType: "boolean_field",
      sourceField: "attendance",
      xpAmount: 50,
      coinAmount: 20,
    },
    {
      ruleKey: "test_participation",
      triggerType: "score_threshold",
      sourceField: "participationScore",
      threshold: 70,
      xpAmount: 25,
      coinAmount: 10,
    },
  ]);

  await db.insert(achievementsTable).values({
    key: ACHIEVEMENT_KEY,
    name: "First Class",
    description: "Attend your first class",
    eventKey: "test_attendance",
    threshold: 1,
    rewardCoins: 50,
  });
});

afterAll(async () => {
  await db.delete(webhookEvents).where(eq(webhookEvents.sourceSystem, SOURCE_SYSTEM));

  if (deactivatedRuleIds.length > 0) {
    await db
      .update(rewardRules)
      .set({ active: true })
      .where(inArray(rewardRules.id, deactivatedRuleIds));
  }

  for (const level of LEVELS) {
    const prior = priorLevelCurveRows.find((r) => r.level === level);
    if (prior) {
      await db
        .update(levelCurve)
        .set({ minXp: prior.minXp, bonusCoins: prior.bonusCoins, bonusPackTypeId: prior.bonusPackTypeId })
        .where(eq(levelCurve.level, level));
    } else {
      await db.delete(levelCurve).where(eq(levelCurve.level, level));
    }
  }

  await db.delete(achievementsTable).where(eq(achievementsTable.key, ACHIEVEMENT_KEY));
  await db.delete(rewardRules).where(inArray(rewardRules.ruleKey, RULE_KEYS));
  await db.delete(packTypes).where(eq(packTypes.key, PACK_TYPE_KEY));
});

describe("processClassroomEvent", () => {
  let studentId: string;

  afterEach(async () => {
    if (studentId) await cleanupStudent(studentId);
  });

  it("applies XP, coins, and an event counter for a triggered rule", async () => {
    const student = await createTestStudent("ext-1");
    studentId = student.id;

    const result = await processClassroomEvent({
      sourceSystem: SOURCE_SYSTEM,
      externalEventId: "evt-1",
      studentExternalId: "ext-1",
      program: null,
      metrics: { attendance: true },
      rawPayload: { attendance: true },
    });

    expect(result.status).toBe("processed");
    if (result.status !== "processed") throw new Error("unreachable");
    expect(result.xpAwarded).toBe(50);
    // class attendance also unlocks the First Class achievement (+50 coins)
    expect(result.coinsAwarded).toBe(20 + 50);
    expect(result.achievementsUnlocked).toEqual([ACHIEVEMENT_KEY]);

    const [updated] = await db.select().from(students).where(eq(students.id, studentId));
    expect(updated.xpTotal).toBe(50);
    expect(updated.coinsBalance).toBe(70);
  });

  it("applies every level crossed by a multi-rule event, not just the last", async () => {
    const student = await createTestStudent("ext-2");
    studentId = student.id;

    const result = await processClassroomEvent({
      sourceSystem: SOURCE_SYSTEM,
      externalEventId: "evt-2",
      studentExternalId: "ext-2",
      program: null,
      metrics: { attendance: true, participationScore: 85 },
      rawPayload: {},
    });

    expect(result.status).toBe("processed");
    if (result.status !== "processed") throw new Error("unreachable");
    // 50 + 25 xp = 75, not enough to cross level 2 (100) on its own in this test,
    // so re-fire attendance again to push past both level thresholds.
    expect(result.levelsCrossed).toEqual([]);

    const second = await processClassroomEvent({
      sourceSystem: SOURCE_SYSTEM,
      externalEventId: "evt-3",
      studentExternalId: "ext-2",
      program: null,
      metrics: { attendance: true, participationScore: 85 },
      rawPayload: {},
    });
    expect(second.status).toBe("processed");
    if (second.status !== "processed") throw new Error("unreachable");
    // xp now 150 -> crosses level 2 only
    expect(second.levelsCrossed).toEqual([2]);

    const third = await processClassroomEvent({
      sourceSystem: SOURCE_SYSTEM,
      externalEventId: "evt-4",
      studentExternalId: "ext-2",
      program: null,
      metrics: { attendance: true, participationScore: 85 },
      rawPayload: {},
    });
    expect(third.status).toBe("processed");
    if (third.status !== "processed") throw new Error("unreachable");
    // xp now 225 -> still under level 3's 250 threshold
    expect(third.levelsCrossed).toEqual([]);

    const fourth = await processClassroomEvent({
      sourceSystem: SOURCE_SYSTEM,
      externalEventId: "evt-5",
      studentExternalId: "ext-2",
      program: null,
      metrics: { attendance: true, participationScore: 85 },
      rawPayload: {},
    });
    expect(fourth.status).toBe("processed");
    if (fourth.status !== "processed") throw new Error("unreachable");
    // xp now 300 -> crosses level 3, granting the bonus pack
    expect(fourth.levelsCrossed).toEqual([3]);
    expect(fourth.packsGranted.length).toBe(1);
  });

  it("is idempotent for a repeated external_event_id", async () => {
    const student = await createTestStudent("ext-3");
    studentId = student.id;

    const first = await processClassroomEvent({
      sourceSystem: SOURCE_SYSTEM,
      externalEventId: "evt-dup",
      studentExternalId: "ext-3",
      program: null,
      metrics: { attendance: true },
      rawPayload: {},
    });
    const second = await processClassroomEvent({
      sourceSystem: SOURCE_SYSTEM,
      externalEventId: "evt-dup",
      studentExternalId: "ext-3",
      program: null,
      metrics: { attendance: true },
      rawPayload: {},
    });

    expect(first.status).toBe("processed");
    expect(second.status).toBe("duplicate");

    const [updated] = await db.select().from(students).where(eq(students.id, studentId));
    // Only the first delivery's reward should have applied.
    expect(updated.xpTotal).toBe(50);
  });

  it("marks the webhook event failed and reports unresolved_student for an unknown student", async () => {
    const result = await processClassroomEvent({
      sourceSystem: SOURCE_SYSTEM,
      externalEventId: "evt-unknown",
      studentExternalId: "does-not-exist",
      program: null,
      metrics: { attendance: true },
      rawPayload: {},
    });

    expect(result.status).toBe("unresolved_student");

    const [row] = await db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.id, result.webhookEventId));
    expect(row.status).toBe("failed");
  });
});
