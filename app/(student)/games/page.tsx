import { redirect } from "next/navigation";
import Link from "next/link";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getGamePlaysRemainingToday } from "@/lib/reward-engine/gameSession";
import { GAME_CATALOG } from "@/lib/games/catalog";
import { Card } from "@/components/ui/Card";
import { WordCatchIcon, MemoryMatchIcon, WordScrambleIcon } from "@/components/icons";

const GAME_ICONS = {
  word_catch: WordCatchIcon,
  memory_match: MemoryMatchIcon,
  word_scramble: WordScrambleIcon,
};

export default async function GamesPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const games = await Promise.all(
    GAME_CATALOG.map(async (game) => ({
      ...game,
      playsRemaining: await getGamePlaysRemainingToday(student.id, game.key),
    }))
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Game Arcade</h1>
        <p className="text-ink/60">Play, learn, and earn XP + coins!</p>
      </div>

      <div className="flex flex-col gap-4">
        {games.map((game) => {
          const Icon = GAME_ICONS[game.key];
          return (
            <Link key={game.key} href={game.href}>
              <Card
                className="flex items-center gap-4 !p-4 transition-transform active:scale-[0.98]"
                style={{ boxShadow: `0 4px 0 0 ${game.color}` }}
              >
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `color-mix(in srgb, ${game.color} 22%, white)` }}
                >
                  <Icon size={44} />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-lg font-bold">{game.name}</h2>
                  <p className="text-sm text-ink/60">{game.tagline}</p>
                  <p className="mt-1 text-xs font-bold" style={{ color: game.color }}>
                    {game.playsRemaining > 0
                      ? `${game.playsRemaining} rewarded round${game.playsRemaining === 1 ? "" : "s"} left today`
                      : "Practice mode — play for fun!"}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
