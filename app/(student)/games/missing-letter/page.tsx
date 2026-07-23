import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { isGameUnlocked } from "@/lib/reward-engine/gameUnlocks";
import { MissingLetter } from "@/components/games/MissingLetter";

export default async function MissingLetterPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");
  if (!(await isGameUnlocked(student, "missing_letter"))) redirect("/games");

  const equippedKeys = await getEquippedAvatarKeys(student);

  return <MissingLetter equippedKeys={equippedKeys} />;
}
