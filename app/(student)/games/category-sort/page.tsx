import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { isGameUnlocked } from "@/lib/reward-engine/gameUnlocks";
import { CategorySort } from "@/components/games/CategorySort";

export default async function CategorySortPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");
  if (!(await isGameUnlocked(student.id, "category_sort"))) redirect("/games");

  const equippedKeys = await getEquippedAvatarKeys(student);

  return <CategorySort equippedKeys={equippedKeys} />;
}
