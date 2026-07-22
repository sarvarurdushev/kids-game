import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { isGameUnlocked } from "@/lib/reward-engine/gameUnlocks";
import { FastPicks } from "@/components/games/FastPicks";

export default async function FastPicksPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");
  if (!(await isGameUnlocked(student.id, "fast_picks"))) redirect("/games");

  const equippedKeys = await getEquippedAvatarKeys(student);

  return <FastPicks equippedKeys={equippedKeys} />;
}
