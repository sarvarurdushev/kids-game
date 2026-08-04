"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import type { GameMeta } from "@/lib/games/catalog";
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

export interface GameCardData extends GameMeta {
  unlocked: boolean;
  requiredLevel: number | null;
}

/** Renders the arcade list — split out from page.tsx (a server component,
 * since it calls requireStudent()) purely so this piece can call
 * useTranslation(); the card's name/tagline come from catalog.ts's
 * nameKey/taglineKey (see dictionary.ts's "Games: catalog names/taglines"
 * section) rather than raw strings. */
export function GamesArcade({
  games,
  sessionsRemaining,
  wordBookDueCount,
}: {
  games: GameCardData[];
  sessionsRemaining: number;
  wordBookDueCount: number;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold lg:text-4xl">{t("games.title")}</h1>
        <p className="text-ink/60">
          {sessionsRemaining > 0
            ? t("games.roundsLeft", { count: sessionsRemaining })
            : t("games.noRoundsLeft")}
        </p>
        <Link
          href="/word-book"
          className="relative mt-1 inline-flex items-center gap-1 text-sm font-semibold text-teal underline-offset-2 hover:underline"
        >
          📖 {t("games.wordBook")}
          {wordBookDueCount > 0 && (
            <span className="rounded-full bg-coral px-1.5 py-0.5 text-[10px] leading-none font-bold text-white">
              {wordBookDueCount}
            </span>
          )}
        </Link>
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
                <h2 className="font-display text-lg font-bold">{t(game.nameKey)}</h2>
                <p className="text-sm text-ink/60">{t(game.taglineKey)}</p>
              </div>
              {!game.unlocked && game.requiredLevel && (
                <span className="shrink-0 rounded-full bg-ink/10 px-3 py-1.5 text-xs font-bold whitespace-nowrap text-ink/50">
                  {t("games.levelLocked", { level: game.requiredLevel })}
                </span>
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
