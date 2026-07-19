import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getGamePlaysRemainingToday } from "@/lib/reward-engine/gameSession";
import { getEquippedAvatarKeys } from "@/lib/student/avatar";
import { AiLabHome } from "@/components/ai-lab/AiLabHome";

export default async function AiLabPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const [equippedKeys, trainPlaysRemaining, sequencePlaysRemaining] = await Promise.all([
    getEquippedAvatarKeys(student),
    getGamePlaysRemainingToday(student.id, "train_the_robot"),
    getGamePlaysRemainingToday(student.id, "sequence_builder"),
  ]);

  return (
    <AiLabHome
      equippedKeys={equippedKeys}
      playsRemaining={{
        train_the_robot: trainPlaysRemaining,
        sequence_builder: sequencePlaysRemaining,
      }}
    />
  );
}
