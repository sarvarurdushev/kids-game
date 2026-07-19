import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { students } from "@/lib/db/schema";
import { boostHappiness, getEffectivePetHappiness } from "@/lib/reward-engine/pet";

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
