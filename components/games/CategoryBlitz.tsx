"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Avatar3D } from "@/components/three/Avatar3D";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";
import { Button } from "@/components/ui/Button";
import { playCorrect, playWrong, playGameOver } from "@/lib/sound";
import { shuffle, type WordCategory, type WordEntry } from "@/lib/games/wordBank";
import { curriculumWordsUpToDifficulty } from "@/lib/games/curriculum";
import { GameRewardSummary } from "./GameRewardSummary";
import { useTranslation } from "@/components/i18n/LanguageProvider";

const GLOBAL_TIME_MS = 30000;
const TICK_MS = 100;
const RESULT_PAUSE_MS = 500;

const CATEGORY_LABELS: Record<WordCategory, string> = {
  animals: "Animals",
  colors: "Colors",
  numbers: "Numbers",
  food: "Food",
  weather: "Weather",
  family: "Family",
  actions: "Actions",
  school: "School",
  space: "Space",
  culture: "Culture",
  friends: "Friends",
  environment: "Environment",
  travel: "Travel",
  body: "My Body",
  halloween: "Halloween",
  emotions: "Emotions",
  christmas: "Christmas",
};

type Phase = "ready" | "playing" | "result" | "submitting" | "gameover";

interface RoundData {
  target: WordEntry;
  categoryA: WordCategory;
  categoryB: WordCategory;
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
  const pool = curriculumWordsUpToDifficulty(3);
  const categories = Array.from(new Set(pool.map((w) => w.category)));
  const [categoryA, categoryB] = shuffle(categories).slice(0, 2);
  const target = shuffle(pool.filter((w) => w.category === categoryA || w.category === categoryB))[0];
  return { target, categoryA, categoryB };
}

// Endless mode: same global-timer skeleton as WordRush, with Category Sort's
// two-bucket tap mechanic instead of word choices.
export function CategoryBlitz({ equippedKeys }: { equippedKeys: AvatarEquippedKeys }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("ready");
  const [round, setRound] = useState<RoundData | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pickedCategory, setPickedCategory] = useState<WordCategory | null>(null);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [globalTimeLeftMs, setGlobalTimeLeftMs] = useState(GLOBAL_TIME_MS);
  const [result, setResult] = useState<CompleteResponse | null>(null);

  const correctRef = useRef(0);
  const totalRef = useRef(0);
  const roundRef = useRef<RoundData | null>(null);
  const finishedRef = useRef(false);
  const globalIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const globalRemainingRef = useRef(GLOBAL_TIME_MS);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (globalIntervalRef.current) clearInterval(globalIntervalRef.current);
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    },
    []
  );

  function nextRound() {
    setPickedCategory(null);
    const data = buildRound();
    roundRef.current = data;
    setRound(data);
    setPhase("playing");
  }

  function startGame() {
    finishedRef.current = false;
    correctRef.current = 0;
    totalRef.current = 0;
    setCorrectCount(0);
    setTotalAnswered(0);
    setStreak(0);
    setResult(null);
    globalRemainingRef.current = GLOBAL_TIME_MS;
    setGlobalTimeLeftMs(GLOBAL_TIME_MS);
    nextRound();

    if (globalIntervalRef.current) clearInterval(globalIntervalRef.current);
    globalIntervalRef.current = setInterval(() => {
      globalRemainingRef.current -= TICK_MS;
      if (globalRemainingRef.current <= 0) {
        setGlobalTimeLeftMs(0);
        finish();
      } else {
        setGlobalTimeLeftMs(globalRemainingRef.current);
      }
    }, TICK_MS);
  }

  function finish() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (globalIntervalRef.current) clearInterval(globalIntervalRef.current);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    void endGame(correctRef.current, totalRef.current);
  }

  function pick(category: WordCategory) {
    if (phase !== "playing" || !roundRef.current || finishedRef.current) return;
    const correct = category === roundRef.current.target.category;
    setPickedCategory(category);
    setLastCorrect(correct);
    setPhase("result");
    totalRef.current += 1;
    setTotalAnswered(totalRef.current);

    if (correct) {
      playCorrect();
      correctRef.current += 1;
      setCorrectCount(correctRef.current);
      setStreak((s) => s + 1);
    } else {
      playWrong();
      setStreak(0);
    }

    advanceTimeoutRef.current = setTimeout(() => {
      if (finishedRef.current) return;
      if (globalRemainingRef.current <= 0) {
        finish();
      } else {
        nextRound();
      }
    }, RESULT_PAUSE_MS);
  }

  async function endGame(finalCorrect: number, finalTotal: number) {
    setPhase("submitting");
    playGameOver();
    try {
      const res = await fetch("/api/games/category_blitz/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: finalCorrect * 10, correctCount: finalCorrect, totalCount: finalTotal }),
      });
      setResult(res.ok ? await res.json() : null);
    } catch {
      setResult(null);
    } finally {
      setPhase("gameover");
    }
  }

  const avatarMood = phase === "result" ? (lastCorrect ? "happy" : "sad") : "neutral";

  if (phase === "ready") {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <Avatar3D equippedKeys={equippedKeys} size={130} mood="happy" />
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-dark">{t("game.categoryBlitz.name")}</h1>
          <p className="mt-1 text-sm text-ink/60">{t("game.categoryBlitz.instructions")}</p>
        </div>
        <Button onClick={startGame}>{t("games.startGame")}</Button>
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
        <Avatar3D equippedKeys={equippedKeys} size={120} mood={correctCount >= 8 ? "happy" : "neutral"} />
        <h1 className="font-display text-2xl font-bold text-gold-dark">{t("games.timesUp")}</h1>
        <p className="text-ink/70">
          {t("games.scoreOutOf", { correct: correctCount, total: totalAnswered })}
        </p>
        {result && <GameRewardSummary result={result} />}
        <div className="flex gap-3">
          <Button onClick={startGame}>{t("games.playAgain")}</Button>
          <Link href="/games">
            <Button variant="ghost">{t("games.backToArcade")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!round) return null;

  const timePct = Math.max(0, Math.min(100, (globalTimeLeftMs / GLOBAL_TIME_MS) * 100));

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
          <span className="text-xs font-bold text-ink/40">{t("games.correctCount", { count: correctCount })}</span>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: timePct < 30 ? "var(--color-gk-coral)" : "var(--color-teal)" }}
          animate={{ width: `${timePct}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>

      <div className="flex flex-col items-center gap-2 rounded-3xl bg-white/80 py-4 shadow-sm">
        <Avatar3D equippedKeys={equippedKeys} size={72} mood={avatarMood} />
        <div className="text-6xl">{round.target.emoji}</div>
        <p className="text-sm font-semibold text-ink/60">{t("games.whichGroup")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[round.categoryA, round.categoryB].map((category) => {
          const isPicked = pickedCategory === category;
          const revealCorrect = phase === "result" && category === round.target.category;
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
              key={category}
              type="button"
              disabled={phase !== "playing"}
              onClick={() => pick(category)}
              className={`font-display rounded-2xl border-2 py-5 text-lg font-bold transition-all ${tone}`}
            >
              {CATEGORY_LABELS[category]}
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
              : t("games.notQuiteWasCategory", { category: CATEGORY_LABELS[round.target.category] })}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
