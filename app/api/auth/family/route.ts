import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { students } from "@/lib/db/schema";
import { getFamily } from "@/lib/auth/session";

export async function GET() {
  const familyIds = await getFamily();
  if (familyIds.length === 0) {
    return NextResponse.json({ students: [] });
  }

  const rows = await db
    .select({
      id: students.id,
      displayName: students.displayName,
      equippedHairId: students.equippedHairId,
      equippedEyesId: students.equippedEyesId,
      equippedClothesId: students.equippedClothesId,
      equippedHatId: students.equippedHatId,
      equippedAccessoryId: students.equippedAccessoryId,
      equippedBackgroundId: students.equippedBackgroundId,
    })
    .from(students)
    .where(inArray(students.id, familyIds));

  return NextResponse.json({ students: rows });
}
