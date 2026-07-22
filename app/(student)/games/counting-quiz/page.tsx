import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { isGameUnlocked } from "@/lib/reward-engine/gameUnlocks";
import { CountingQuiz } from "@/components/games/CountingQuiz";

export default async function CountingQuizPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");
  if (!(await isGameUnlocked(student.id, "counting_quiz"))) redirect("/games");

  const equippedKeys = await getEquippedAvatarKeys(student);

  return <CountingQuiz equippedKeys={equippedKeys} />;
}
