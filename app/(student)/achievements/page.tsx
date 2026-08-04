import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getAchievements } from "@/lib/student/achievements";
import { AchievementBadge } from "@/components/achievements/AchievementBadge";
import { T } from "@/components/i18n/T";

export default async function AchievementsPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const achievements = await getAchievements(student.id);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold lg:text-4xl">
          <T k="achievements.title" />
        </h1>
        <p className="text-ink/60">
          <T
            k="achievements.unlockedCount"
            vars={{ count: achievements.filter((a) => a.unlocked).length, total: achievements.length }}
          />
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
