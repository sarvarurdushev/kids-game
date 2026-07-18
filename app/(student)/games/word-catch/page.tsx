import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { WordCatch } from "@/components/games/WordCatch";

export default async function WordCatchPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const equippedKeys = await getEquippedAvatarKeys(student);

  return <WordCatch equippedKeys={equippedKeys} />;
}
