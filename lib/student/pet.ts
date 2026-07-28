import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { students } from "@/lib/db/schema";
import {
  boostHappiness,
  boostHappinessBy,
  FEED_BOOST,
  FEED_COST_COINS,
  getEffectivePetHappiness,
} from "@/lib/reward-engine/pet";
import { ServiceError } from "./errors";

interface PetState {
  petHappiness: number;
  petLastInteractionAt: Date | null;
  createdAt: Date;
}

export function currentPetHappiness(student: PetState): number {
  return getEffectivePetHappiness(student.petHappiness, student.petLastInteractionAt, student.createdAt);
}

export async function interactWithPet(studentId: string): Promise<{ happiness: number }> {
  return db.transaction(async (tx) => {
    const [student] = await tx.select().from(students).where(eq(students.id, studentId)).for("update");
    const happiness = boostHappiness(currentPetHappiness(student));

    await tx
      .update(students)
      .set({ petHappiness: happiness, petLastInteractionAt: new Date(), updatedAt: new Date() })
      .where(eq(students.id, studentId));

    return { happiness };
  });
}

/** A paid, bigger boost alongside the free poke — purely additive, doesn't
 * change interactWithPet's behavior at all. */
export async function feedPet(studentId: string): Promise<{ happiness: number; coinsRemaining: number }> {
  return db.transaction(async (tx) => {
    const [student] = await tx.select().from(students).where(eq(students.id, studentId)).for("update");

    const currentHappiness = currentPetHappiness(student);
    if (currentHappiness >= 100) {
      throw new ServiceError("Your pet is already full and happy!", 400);
    }
    if (student.coinsBalance < FEED_COST_COINS) {
      throw new ServiceError("Not enough coins", 402);
    }

    const happiness = boostHappinessBy(currentHappiness, FEED_BOOST);
    const coinsRemaining = student.coinsBalance - FEED_COST_COINS;

    await tx
      .update(students)
      .set({
        petHappiness: happiness,
        petLastInteractionAt: new Date(),
        coinsBalance: coinsRemaining,
        updatedAt: new Date(),
      })
      .where(eq(students.id, studentId));

    return { happiness, coinsRemaining };
  });
}
