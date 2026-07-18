import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { WordScramble } from "@/components/games/WordScramble";

export default async function WordScramblePage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const equippedKeys = await getEquippedAvatarKeys(student);

  return <WordScramble equippedKeys={equippedKeys} />;
}
