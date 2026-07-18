import { redirect } from "next/navigation";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { students } from "@/lib/db/schema";
import { getFamily } from "@/lib/auth/session";
import { getEquippedAvatarKeysForMany } from "@/lib/student/avatar";
import { LoginFlow } from "@/components/auth/LoginFlow";

export default async function LoginPage() {
  const familyIds = await getFamily();
  if (familyIds.length === 0) redirect("/welcome");

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

  const equippedByStudent = await getEquippedAvatarKeysForMany(rows);
  const members = rows.map((r) => ({
    id: r.id,
    displayName: r.displayName,
    equippedKeys: equippedByStudent.get(r.id) ?? {},
  }));

  return <LoginFlow members={members} />;
}
