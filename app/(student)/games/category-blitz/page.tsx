import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { isGameUnlocked } from "@/lib/reward-engine/gameUnlocks";
import { CategoryBlitz } from "@/components/games/CategoryBlitz";

export default async function CategoryBlitzPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");
  if (!(await isGameUnlocked(student, "category_blitz"))) redirect("/games");

  const equippedKeys = await getEquippedAvatarKeys(student);

  return <CategoryBlitz equippedKeys={equippedKeys} />;
}
