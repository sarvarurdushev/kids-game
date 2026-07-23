import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { isGameUnlocked } from "@/lib/reward-engine/gameUnlocks";
import { WordRush } from "@/components/games/WordRush";

export default async function WordRushPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");
  if (!(await isGameUnlocked(student, "word_rush"))) redirect("/games");

  const equippedKeys = await getEquippedAvatarKeys(student);

  return <WordRush equippedKeys={equippedKeys} />;
}
