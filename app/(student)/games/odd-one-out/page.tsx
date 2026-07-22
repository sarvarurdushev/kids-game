import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { isGameUnlocked } from "@/lib/reward-engine/gameUnlocks";
import { OddOneOut } from "@/components/games/OddOneOut";

export default async function OddOneOutPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");
  if (!(await isGameUnlocked(student.id, "odd_one_out"))) redirect("/games");

  const equippedKeys = await getEquippedAvatarKeys(student);

  return <OddOneOut equippedKeys={equippedKeys} />;
}
