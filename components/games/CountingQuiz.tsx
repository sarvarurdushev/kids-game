"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Avatar3D } from "@/components/three/Avatar3D";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";
import { Button } from "@/components/ui/Button";
import { playCorrect, playWrong, playGameOver } from "@/lib/sound";
import { shuffle, type WordEntry } from "@/lib/games/wordBank";
import { curriculumWordsUpToDifficulty } from "@/lib/games/curriculum";
import { GameRewardSummary } from "./GameRewardSummary";
import { useTranslation } from "@/components/i18n/LanguageProvider";

const TOTAL_ROUNDS = 10;
const RESULT_PAUSE_MS = 900;
const NUMBER_WORDS = ["one", "two", "three", "four", "five"];

type Phase = "ready" | "playing" | "result" | "submitting" | "gameover";

interface RoundData {
  item: WordEntry;
  count: number;
  choices: number[];
}

interface CompleteResponse {
  rewarded: boolean;
  xpAwarded: number;
  coinsAwarded: number;
  streakMultiplier: number;
  spinBonusCoins: number;
  levelsCrossed: number[];
  playsRemainingToday: number;
}

function buildRound(): RoundData {
  const pool = curriculumWordsUpToDifficulty(1).filter((w) => w.category !== "numbers");
  const item = shuffle(pool)[0];
  const count = 1 + Math.floor(Math.random() * 5);
  const decoys = shuffle([1, 2, 3, 4, 5].filter((n) => n !== count)).slice(0, 3);
  return { item, count, choices: shuffle([count, ...decoys]) };
}

// Same refs-for-synchronous-state pattern as EmojiQuiz/WordCatch.
export function CountingQuiz({ equippedKeys }: { equippedKeys: AvatarEquippedKeys }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("ready");
  const [roundIndex, setRoundIndexState] = useState(0);
  const [round, setRound] = useState<RoundData | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pickedNumber, setPickedNumber] = useState<number | null>(null);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [result, setResult] = useState<CompleteResponse | null>(null);
  const [finalRoundsPlayed, setFinalRoundsPlayed] = useState(0);

  const correctRef = useRef(0);
  const roundIndexRef = useRef(0);
  const roundRef = useRef<RoundData | null>(null);

  function startRound(index: number) {
    roundIndexRef.current = index;
    setRoundIndexState(index);
    setPickedNumber(null);
    const data = buildRound();
    roundRef.current = data;
    setRound(data);
    setPhase("playing");
  }

  function pick(n: number) {
    if (phase !== "playing" || !roundRef.current) return;
    const correct = n === roundRef.current.count;
    setPickedNumber(n);
    setLastCorrect(correct);
    setPhase("result");

    if (correct) {
      playCorrect();
      correctRef.current += 1;
      setCorrectCount(correctRef.current);
      setStreak((s) => s + 1);
    } else {
      playWrong();
      setStreak(0);
    }

    setTimeout(() => {
      const roundsPlayed = roundIndexRef.current + 1;
      if (roundsPlayed >= TOTAL_ROUNDS) {
        void endGame(correctRef.current, roundsPlayed);
      } else {
        startRound(roundsPlayed);
      }
    }, RESULT_PAUSE_MS);
  }

  async function endGame(finalCorrect: number, roundsPlayed: number) {
    setPhase("submitting");
    setFinalRoundsPlayed(roundsPlayed);
    playGameOver();
    try {
      const res = await fetch("/api/games/counting_quiz/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: finalCorrect * 10, correctCount: finalCorrect, totalCount: roundsPlayed }),
      });
      setResult(res.ok ? await res.json() : null);
    } catch {
      setResult(null);
    } finally {
      setPhase("gameover");
    }
  }

  function playAgain() {
    correctRef.current = 0;
    setCorrectCount(0);
    setStreak(0);
    setResult(null);
    startRound(0);
  }

  const avatarMood = phase === "result" ? (lastCorrect ? "happy" : "sad") : "neutral";

  if (phase === "ready") {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <Avatar3D equippedKeys={equippedKeys} size={130} mood="happy" />
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-dark">{t("game.countingQuiz.name")}</h1>
          <p className="mt-1 text-sm text-ink/60">{t("game.countingQuiz.instructions")}</p>
        </div>
        <Button onClick={() => startRound(0)}>{t("games.startGame")}</Button>
        <Link href="/games" className="text-sm font-semibold text-teal underline-offset-2 hover:underline">
          {t("games.backToArcade")}
        </Link>
      </div>
    );
  }

  if (phase === "submitting") {
    return <p className="text-center font-display text-lg">{t("games.savingScore")}</p>;
  }

  if (phase === "gameover") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <Avatar3D
          equippedKeys={equippedKeys}
          size={120}
          mood={correctCount >= finalRoundsPlayed * 0.6 ? "happy" : "neutral"}
        />
        <h1 className="font-display text-2xl font-bold text-gold-dark">{t("games.niceWork")}</h1>
        <p className="text-ink/70">
          {t("games.scoreOutOf", { correct: correctCount, total: finalRoundsPlayed })}
        </p>
        {result && <GameRewardSummary result={result} />}
        <div className="flex gap-3">
          <Button onClick={playAgain}>{t("games.playAgain")}</Button>
          <Link href="/games">
            <Button variant="ghost">{t("games.backToArcade")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!round) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link href="/games" className="text-sm font-semibold text-ink/50">
          {t("games.exit")}
        </Link>
        <div className="flex items-center gap-2">
          {streak >= 3 && (
            <span className="rounded-full bg-coral/15 px-2 py-0.5 text-xs font-bold text-coral">
              🔥 x{streak}
            </span>
          )}
          <span className="text-xs font-bold text-ink/40">
            {roundIndex + 1} / {TOTAL_ROUNDS}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 rounded-3xl bg-white/80 py-4 shadow-sm">
        <Avatar3D equippedKeys={equippedKeys} size={64} mood={avatarMood} />
        <div className="flex max-w-xs flex-wrap justify-center gap-1 text-4xl">
          {Array.from({ length: round.count }).map((_, i) => (
            <span key={i}>{round.item.emoji}</span>
          ))}
        </div>
        <p className="text-sm font-semibold text-ink/60">{t("game.countingQuiz.howMany")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {round.choices.map((n) => {
          const isPicked = pickedNumber === n;
          const revealCorrect = phase === "result" && n === round.count;
          const tone =
            phase === "result"
              ? revealCorrect
                ? "border-teal bg-teal/15 text-teal"
                : isPicked
                  ? "border-coral bg-coral/15 text-coral"
                  : "border-ink/10 bg-white/70 text-ink/40"
              : "border-ink/10 bg-white/90 text-ink hover:border-gold active:scale-95";
          return (
            <button
              key={n}
              type="button"
              disabled={phase !== "playing"}
              onClick={() => pick(n)}
              className={`font-display rounded-2xl border-2 py-4 text-lg font-bold capitalize transition-all ${tone}`}
            >
              {NUMBER_WORDS[n - 1]}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {phase === "result" && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center text-sm font-bold ${lastCorrect ? "text-teal" : "text-coral"}`}
          >
            {lastCorrect
              ? t("games.greatJob")
              : t("game.countingQuiz.notQuiteWasNumber", { word: NUMBER_WORDS[round.count - 1] })}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
