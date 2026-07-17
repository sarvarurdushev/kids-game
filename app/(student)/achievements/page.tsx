import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getAchievements } from "@/lib/student/achievements";
import { AchievementBadge } from "@/components/achievements/AchievementBadge";

export default async function AchievementsPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const achievements = await getAchievements(student.id);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Achievements</h1>
        <p className="text-ink/60">
          {achievements.filter((a) => a.unlocked).length}/{achievements.length} unlocked
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {achievements.map((a) => (
          <AchievementBadge
            key={a.id}
            name={a.name}
            description={a.description}
            unlocked={a.unlocked}
            progress={a.progress}
            threshold={a.threshold}
          />
        ))}
      </div>
    </div>
  );
}
