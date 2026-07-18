import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { MemoryMatch } from "@/components/games/MemoryMatch";

export default async function MemoryMatchPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const equippedKeys = await getEquippedAvatarKeys(student);

  return <MemoryMatch equippedKeys={equippedKeys} />;
}
