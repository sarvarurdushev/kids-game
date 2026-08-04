"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Avatar3D } from "@/components/three/Avatar3D";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";
import { Button } from "@/components/ui/Button";
import { playCorrect, playWrong, playGameOver, playTick } from "@/lib/sound";
import { randomWords, shuffle, type WordEntry } from "@/lib/games/wordBank";
import { curriculumWordsUpToDifficulty } from "@/lib/games/curriculum";
import { GameRewardSummary } from "./GameRewardSummary";
import { useTranslation } from "@/components/i18n/LanguageProvider";

const TOTAL_ROUNDS = 10;
const TICK_MS = 100;
const RESULT_PAUSE_MS = 800;

type Phase = "ready" | "playing" | "result" | "submitting" | "gameover";
type Outcome = "correct" | "wrong" | "timeout" | null;

interface RoundData {
  target: WordEntry;
  choices: WordEntry[];
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

function maxDifficultyFor(roundIndex: number): 1 | 2 | 3 {
  if (roundIndex < 3) return 1;
  if (roundIndex < 7) return 2;
  return 3;
}

function timeForRound(roundIndex: number): number {
  if (roundIndex < 3) return 5000;
  if (roundIndex < 7) return 4000;
  return 3000;
}

function buildRound(roundIndex: number, usedWords: Set<string>): RoundData {
  const pool = curriculumWordsUpToDifficulty(maxDifficultyFor(roundIndex));
  const fresh = pool.filter((w) => !usedWords.has(w.word));
  const candidates = fresh.length > 0 ? fresh : pool;
  const target = shuffle(candidates)[0];
  const sameCategory = pool.filter((w) => w.category === target.category && w.word !== target.word);
  const distractorPool = sameCategory.length >= 3 ? sameCategory : pool.filter((w) => w.word !== target.word);
  const distractors = randomWords(3, distractorPool, target);
  return { target, choices: shuffle([target, ...distractors]) };
}

// Same refs-for-synchronous-state + timer pattern as WordScramble/BalloonPop.
export function FastPicks({ equippedKeys }: { equippedKeys: AvatarEquippedKeys }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("ready");
  const [roundIndex, setRoundIndexState] = useState(0);
  const [round, setRound] = useState<RoundData | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pickedWord, setPickedWord] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [totalTimeMs, setTotalTimeMs] = useState(1);
  const [result, setResult] = useState<CompleteResponse | null>(null);
  const [finalRoundsPlayed, setFinalRoundsPlayed] = useState(0);

  const correctRef = useRef(0);
  const roundIndexRef = useRef(0);
  const roundRef = useRef<RoundData | null>(null);
  const usedWordsRef = useRef<Set<string>>(new Set());
  const resolvedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(0);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  function startRound(index: number) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    resolvedRef.current = false;
    roundIndexRef.current = index;
    setRoundIndexState(index);
    setPickedWord(null);
    setOutcome(null);
    const data = buildRound(index, usedWordsRef.current);
    usedWordsRef.current.add(data.target.word);
    roundRef.current = data;
    setRound(data);

    const duration = timeForRound(index);
    remainingRef.current = duration;
    setTimeLeftMs(duration);
    setTotalTimeMs(duration);
    setPhase("playing");

    intervalRef.current = setInterval(() => {
      remainingRef.current -= TICK_MS;
      if (remainingRef.current <= 0) {
        setTimeLeftMs(0);
        resolve("timeout");
      } else {
        setTimeLeftMs(remainingRef.current);
        if (remainingRef.current <= 1500 && remainingRef.current % 500 < TICK_MS) playTick();
      }
    }, TICK_MS);
  }

  function resolve(nextOutcome: "correct" | "wrong" | "timeout") {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (nextOutcome === "correct") {
      playCorrect();
      correctRef.current += 1;
      setCorrectCount(correctRef.current);
      setStreak((s) => s + 1);
    } else {
      playWrong();
      setStreak(0);
    }
    setOutcome(nextOutcome);
    setPhase("result");

    setTimeout(() => {
      const roundsPlayed = roundIndexRef.current + 1;
      if (roundsPlayed >= TOTAL_ROUNDS) {
        void endGame(correctRef.current, roundsPlayed);
      } else {
        startRound(roundsPlayed);
      }
    }, RESULT_PAUSE_MS);
  }

  function pick(word: string) {
    if (phase !== "playing" || !roundRef.current) return;
    setPickedWord(word);
    resolve(word === roundRef.current.target.word ? "correct" : "wrong");
  }

  async function endGame(finalCorrect: number, roundsPlayed: number) {
    setPhase("submitting");
    setFinalRoundsPlayed(roundsPlayed);
    playGameOver();
    try {
      const res = await fetch("/api/games/fast_picks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: finalCorrect * 12, correctCount: finalCorrect, totalCount: roundsPlayed }),
      });
      setResult(res.ok ? await res.json() : null);
    } catch {
      setResult(null);
    } finally {
      setPhase("gameover");
    }
  }

  function playAgain() {
    usedWordsRef.current = new Set();
    correctRef.current = 0;
    setCorrectCount(0);
    setStreak(0);
    setResult(null);
    startRound(0);
  }

  const avatarMood = outcome === "correct" ? "happy" : outcome === "wrong" || outcome === "timeout" ? "sad" : "neutral";

  if (phase === "ready") {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <Avatar3D equippedKeys={equippedKeys} size={130} mood="happy" />
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-dark">{t("game.fastPicks.name")}</h1>
          <p className="mt-1 text-sm text-ink/60">{t("game.fastPicks.instructions")}</p>
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

  const timePct = Math.max(0, Math.min(100, (timeLeftMs / totalTimeMs) * 100));

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
        <p className="text-sm font-semibold text-ink/60">{t("games.whatIsThis")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {round.choices.map((choice) => {
          const isPicked = pickedWord === choice.word;
          const revealCorrect = phase === "result" && choice.word === round.target.word;
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
              key={choice.word}
              type="button"
              disabled={phase !== "playing"}
              onClick={() => pick(choice.word)}
              className={`font-display rounded-2xl border-2 py-4 text-lg font-bold capitalize transition-all ${tone}`}
            >
              {choice.word}
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
            className={`text-center text-sm font-bold ${outcome === "correct" ? "text-teal" : "text-coral"}`}
          >
            {outcome === "correct" ? t("games.greatJob") : outcome === "timeout" ? t("games.tooSlow") : t("games.notQuite")}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
