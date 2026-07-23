import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { isGameUnlocked } from "@/lib/reward-engine/gameUnlocks";
import { BalloonPop } from "@/components/games/BalloonPop";

export default async function BalloonPopPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");
  if (!(await isGameUnlocked(student, "balloon_pop"))) redirect("/games");

  const equippedKeys = await getEquippedAvatarKeys(student);

  return <BalloonPop equippedKeys={equippedKeys} />;
}
