import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { isGameUnlocked } from "@/lib/reward-engine/gameUnlocks";
import { SequenceMemory } from "@/components/games/SequenceMemory";

export default async function SequenceMemoryPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");
  if (!(await isGameUnlocked(student, "sequence_memory"))) redirect("/games");

  const equippedKeys = await getEquippedAvatarKeys(student);

  return <SequenceMemory equippedKeys={equippedKeys} />;
}
