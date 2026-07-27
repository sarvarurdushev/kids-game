import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getQuestStates } from "@/lib/reward-engine/quests";
import { QuestList } from "@/components/quests/QuestList";
import { CoinIcon } from "@/components/icons";

export default async function QuestsPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const quests = await getQuestStates(student.id);
  const claimable = quests.filter((q) => q.complete && !q.claimed).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Quests</h1>
          <p className="text-ink/60">
            {claimable > 0
              ? `${claimable} reward${claimable === 1 ? "" : "s"} ready to claim!`
              : "Play games to finish your quests."}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5 text-sm font-semibold text-ink/60">
          <span className="flex items-center gap-1">
            <CoinIcon size={16} /> {student.coinsBalance}
          </span>
          <span>⭐ {student.goldStars}</span>
        </div>
      </div>

      <QuestList
        daily={quests.filter((q) => q.period === "daily")}
        weekly={quests.filter((q) => q.period === "weekly")}
      />
    </div>
  );
}
