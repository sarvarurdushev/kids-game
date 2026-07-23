import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { isGameUnlocked } from "@/lib/reward-engine/gameUnlocks";
import { EmojiQuiz } from "@/components/games/EmojiQuiz";

export default async function EmojiQuizPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");
  if (!(await isGameUnlocked(student, "emoji_quiz"))) redirect("/games");

  const equippedKeys = await getEquippedAvatarKeys(student);

  return <EmojiQuiz equippedKeys={equippedKeys} />;
}
