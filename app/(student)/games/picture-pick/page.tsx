import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { isGameUnlocked } from "@/lib/reward-engine/gameUnlocks";
import { PicturePick } from "@/components/games/PicturePick";

export default async function PicturePickPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");
  if (!(await isGameUnlocked(student.id, "picture_pick"))) redirect("/games");

  const equippedKeys = await getEquippedAvatarKeys(student);

  return <PicturePick equippedKeys={equippedKeys} />;
}
