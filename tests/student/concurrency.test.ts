import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  avatarItems,
  characters,
  packGrants,
  packTypePool,
  packTypes,
  students,
  universes,
} from "@/lib/db/schema";
import { purchaseAvatarItem } from "@/lib/student/avatar";
import { openPack } from "@/lib/student/packs";

// Regression coverage for a real race found during manual QA: both
// purchaseAvatarItem and openPack used to check "does this already exist"
// before locking the student row, so two concurrent requests could both
// pass the check and then crash on the unique-constraint insert instead of
// one succeeding and the other failing gracefully. Both now lock the
// student row first.

const TEST_UNIVERSE_KEY = "test_concurrency_universe";
const TEST_PACK_TYPE_KEY = "test_concurrency_pack";
const TEST_AVATAR_ITEM_KEY = "test_concurrency_hat";

let universeId: string;
let packTypeId: string;
let avatarItemId: string;
let characterIds: string[];

async function createTestStudent() {
  const [student] = await db
    .insert(students)
    .values({
      displayName: "Concurrency Test Student",
      enrollmentCode: `test-concurrency-${Math.random().toString(36).slice(2)}`,
      pinHash: "unused",
      coinsBalance: 1000,
    })
    .returning();
  return student;
}

async function cleanupStudent(studentId: string) {
  await db.delete(students).where(eq(students.id, studentId));
}

beforeAll(async () => {
  const [universe] = await db
    .insert(universes)
    .values({ key: TEST_UNIVERSE_KEY, name: "Test Universe", color: "#000" })
    .returning();
  universeId = universe.id;

  const characterRows = await db
    .insert(characters)
    .values(
      Array.from({ length: 4 }, (_, i) => ({
        universeId,
        key: `test_concurrency_char_${i}`,
        name: `Test Char ${i}`,
        rarity: "common" as const,
      }))
    )
    .returning();
  characterIds = characterRows.map((c) => c.id);

  const [packType] = await db
    .insert(packTypes)
    .values({ key: TEST_PACK_TYPE_KEY, name: "Test Pack", coinCost: 1, cardsPerPack: 3 })
    .returning();
  packTypeId = packType.id;
  await db.insert(packTypePool).values({ packTypeId, universeId, weight: 1 });

  const [avatarItem] = await db
    .insert(avatarItems)
    .values({
      slot: "hat",
      key: TEST_AVATAR_ITEM_KEY,
      name: "Test Hat",
      acquisitionMethod: "coin_purchase",
      coinPrice: 10,
    })
    .returning();
  avatarItemId = avatarItem.id;
});

afterAll(async () => {
  await db.delete(avatarItems).where(eq(avatarItems.key, TEST_AVATAR_ITEM_KEY));
  await db.delete(packTypePool).where(eq(packTypePool.packTypeId, packTypeId));
  await db.delete(packTypes).where(eq(packTypes.key, TEST_PACK_TYPE_KEY));
  await db.delete(characters).where(eq(characters.universeId, universeId));
  await db.delete(universes).where(eq(universes.key, TEST_UNIVERSE_KEY));
});

describe("purchaseAvatarItem concurrency", () => {
  let studentId: string;

  afterEach(async () => {
    if (studentId) await cleanupStudent(studentId);
  });

  it("lets exactly one of many concurrent purchases succeed, the rest fail cleanly", async () => {
    const student = await createTestStudent();
    studentId = student.id;

    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () => purchaseAvatarItem(studentId, avatarItemId))
    );

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter(
      (r): r is PromiseRejectedResult => r.status === "rejected"
    );

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(7);
    // Every rejection should be the clean "Already owned" ServiceError, not
    // an unhandled unique-constraint crash.
    for (const r of rejected) {
      expect(r.reason?.message).toBe("Already owned");
    }
  });
});

describe("openPack concurrency", () => {
  let studentId: string;

  afterEach(async () => {
    if (studentId) await cleanupStudent(studentId);
  });

  it("opens several different packs for the same student concurrently without crashing", async () => {
    const student = await createTestStudent();
    studentId = student.id;

    const grants = await db
      .insert(packGrants)
      .values(
        Array.from({ length: 4 }, () => ({
          studentId,
          packTypeId,
          source: "test",
        }))
      )
      .returning();

    const results = await Promise.allSettled(
      grants.map((g) => openPack(studentId, g.id))
    );

    expect(results.every((r) => r.status === "fulfilled")).toBe(true);

    // No matter how the 4 packs' worth of rolls overlapped on the same
    // small 4-character pool, student_cards must end up with exactly one
    // row per distinct character actually drawn, quantities summing to the
    // total number of cards rolled (4 packs x 3 cards = 12).
    const cardRows = await db.query.studentCards.findMany({
      where: (sc, { eq: eqOp, and: andOp, inArray }) =>
        andOp(eqOp(sc.studentId, studentId), inArray(sc.characterId, characterIds)),
    });
    const totalQuantity = cardRows.reduce((sum, r) => sum + r.quantity, 0);
    expect(totalQuantity).toBe(12);
  });
});
