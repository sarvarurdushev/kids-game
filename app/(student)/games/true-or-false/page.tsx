import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { isGameUnlocked } from "@/lib/reward-engine/gameUnlocks";
import { TrueOrFalse } from "@/components/games/TrueOrFalse";

export default async function TrueOrFalsePage() {
  const student = await requireStudent();
  if (!student) redirect("/login");
  if (!(await isGameUnlocked(student, "true_or_false"))) redirect("/games");

  const equippedKeys = await getEquippedAvatarKeys(student);

  return <TrueOrFalse equippedKeys={equippedKeys} />;
}
