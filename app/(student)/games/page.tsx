import { redirect } from "next/navigation";
import Link from "next/link";
import { requireStudent } from "@/lib/auth/requireStudent";
import { getGamePlaysRemainingToday } from "@/lib/reward-engine/gameSession";
import { isGameUnlocked } from "@/lib/reward-engine/gameUnlocks";
import { GAME_CATALOG } from "@/lib/games/catalog";
import { Card } from "@/components/ui/Card";
import { UnlockGameButton } from "@/components/games/UnlockGameButton";
import {
  WordCatchIcon,
  MemoryMatchIcon,
  WordScrambleIcon,
  EmojiQuizIcon,
  PicturePickIcon,
  TrueOrFalseIcon,
  OddOneOutIcon,
  CategorySortIcon,
  CountingQuizIcon,
  MissingLetterIcon,
  SequenceMemoryIcon,
  BalloonPopIcon,
  FastPicksIcon,
  WordRushIcon,
  CategoryBlitzIcon,
} from "@/components/icons";

const GAME_ICONS = {
  word_catch: WordCatchIcon,
  memory_match: MemoryMatchIcon,
  word_scramble: WordScrambleIcon,
  emoji_quiz: EmojiQuizIcon,
  picture_pick: PicturePickIcon,
  true_or_false: TrueOrFalseIcon,
  odd_one_out: OddOneOutIcon,
  category_sort: CategorySortIcon,
  counting_quiz: CountingQuizIcon,
  missing_letter: MissingLetterIcon,
  sequence_memory: SequenceMemoryIcon,
  balloon_pop: BalloonPopIcon,
  fast_picks: FastPicksIcon,
  word_rush: WordRushIcon,
  category_blitz: CategoryBlitzIcon,
};

export default async function GamesPage() {
  const student = await requireStudent();
  if (!student) redirect("/login");

  const games = await Promise.all(
    GAME_CATALOG.map(async (game) => {
      const unlocked = await isGameUnlocked(student.id, game.key);
      return {
        ...game,
        unlocked,
        playsRemaining: unlocked ? await getGamePlaysRemainingToday(student.id, game.key) : 0,
      };
    })
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
          const card = (
            <Card
              className={`flex items-center gap-4 !p-4 transition-transform ${game.unlocked ? "active:scale-[0.98]" : ""}`}
              style={{ boxShadow: `0 4px 0 0 ${game.color}` }}
            >
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${!game.unlocked ? "grayscale" : ""}`}
                style={{ backgroundColor: `color-mix(in srgb, ${game.color} 22%, white)` }}
              >
                <Icon size={44} />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-bold">{game.name}</h2>
                <p className="text-sm text-ink/60">{game.tagline}</p>
                {game.unlocked && (
                  <p className="mt-1 text-xs font-bold" style={{ color: game.color }}>
                    {game.playsRemaining > 0
                      ? `${game.playsRemaining} rewarded round${game.playsRemaining === 1 ? "" : "s"} left today`
                      : "Practice mode — play for fun!"}
                  </p>
                )}
              </div>
              {!game.unlocked && game.coinCost && (
                <UnlockGameButton
                  gameKey={game.key}
                  coinCost={game.coinCost}
                  affordable={student.coinsBalance >= game.coinCost}
                />
              )}
            </Card>
          );
          return game.unlocked ? (
            <Link key={game.key} href={game.href}>
              {card}
            </Link>
          ) : (
            <div key={game.key}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
