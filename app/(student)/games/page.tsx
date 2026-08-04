import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getRewardedSessionsRemainingToday } from "@/lib/reward-engine/gameSession";
import { getGameUnlockStates } from "@/lib/reward-engine/gameUnlocks";
import { getWordBookDueCount } from "@/lib/student/wordBook";
import { GAME_CATALOG } from "@/lib/games/catalog";
import { GamesArcade } from "@/components/games/GamesArcade";

export default async function GamesPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  // The rewarded-session budget is shared across every game, so it's one
  // number for the whole page rather than a per-card count.
  const [unlockStates, sessionsRemaining, wordBookDueCount] = await Promise.all([
    getGameUnlockStates(student),
    getRewardedSessionsRemainingToday(student.id),
    getWordBookDueCount(student.id),
  ]);
  const unlockByKey = new Map(unlockStates.map((s) => [s.key, s]));
  const games = GAME_CATALOG.map((game) => ({
    ...game,
    unlocked: unlockByKey.get(game.key)?.unlocked ?? false,
    requiredLevel: unlockByKey.get(game.key)?.requiredLevel ?? null,
  }));

  return (
    <GamesArcade games={games} sessionsRemaining={sessionsRemaining} wordBookDueCount={wordBookDueCount} />
  );
}
