"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Avatar3D } from "@/components/three/Avatar3D";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";
import { Button } from "@/components/ui/Button";
import { playCorrect, playWrong, playGameOver, playTick, playPop } from "@/lib/sound";
import { randomWords, shuffle, wordsUpToDifficulty, type WordEntry } from "@/lib/games/wordBank";
import { GameRewardSummary } from "./GameRewardSummary";

const TOTAL_ROUNDS = 8;
const ROUND_TIME_MS = 6000;
const TICK_MS = 100;
const RESULT_PAUSE_MS = 900;

type Phase = "ready" | "playing" | "result" | "submitting" | "gameover";
type Outcome = "correct" | "wrong" | "timeout" | null;

interface RoundData {
  target: WordEntry;
  balloons: WordEntry[];
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
  if (roundIndex < 2) return 1;
  if (roundIndex < 5) return 2;
  return 3;
}

function buildRound(roundIndex: number, usedWords: Set<string>): RoundData {
  const pool = wordsUpToDifficulty(maxDifficultyFor(roundIndex));
  const fresh = pool.filter((w) => !usedWords.has(w.word));
  const candidates = fresh.length > 0 ? fresh : pool;
  const target = shuffle(candidates)[0];
  const distractors = randomWords(4, pool, target);
  return { target, balloons: shuffle([target, ...distractors]) };
}

// Same refs-for-synchronous-state + timer pattern as WordScramble.
export function BalloonPop({ equippedKeys }: { equippedKeys: AvatarEquippedKeys }) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [roundIndex, setRoundIndexState] = useState(0);
  const [round, setRound] = useState<RoundData | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [poppedWord, setPoppedWord] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [timeLeftMs, setTimeLeftMs] = useState(ROUND_TIME_MS);
  const [result, setResult] = useState<CompleteResponse | null>(null);
  const [finalRoundsPlayed, setFinalRoundsPlayed] = useState(0);

  const correctRef = useRef(0);
  const roundIndexRef = useRef(0);
  const roundRef = useRef<RoundData | null>(null);
  const usedWordsRef = useRef<Set<string>>(new Set());
  const resolvedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(ROUND_TIME_MS);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  function startRound(index: number) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    resolvedRef.current = false;
    roundIndexRef.current = index;
    setRoundIndexState(index);
    setPoppedWord(null);
    setOutcome(null);
    const data = buildRound(index, usedWordsRef.current);
    usedWordsRef.current.add(data.target.word);
    roundRef.current = data;
    setRound(data);
    remainingRef.current = ROUND_TIME_MS;
    setTimeLeftMs(ROUND_TIME_MS);
    setPhase("playing");

    intervalRef.current = setInterval(() => {
      remainingRef.current -= TICK_MS;
      if (remainingRef.current <= 0) {
        setTimeLeftMs(0);
        resolve("timeout");
      } else {
        setTimeLeftMs(remainingRef.current);
        if (remainingRef.current <= 2000 && remainingRef.current % 500 < TICK_MS) playTick();
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

  function popBalloon(balloon: WordEntry) {
    if (phase !== "playing" || !roundRef.current) return;
    playPop();
    setPoppedWord(balloon.word);
    resolve(balloon.word === roundRef.current.target.word ? "correct" : "wrong");
  }

  async function endGame(finalCorrect: number, roundsPlayed: number) {
    setPhase("submitting");
    setFinalRoundsPlayed(roundsPlayed);
    playGameOver();
    try {
      const res = await fetch("/api/games/balloon_pop/complete", {
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
          <h1 className="font-display text-2xl font-bold text-gold-dark">Balloon Pop</h1>
          <p className="mt-1 text-sm text-ink/60">
            Pop the balloon that matches the word before time runs out!
          </p>
        </div>
        <Button onClick={() => startRound(0)}>Start Game</Button>
        <Link href="/games" className="text-sm font-semibold text-teal underline-offset-2 hover:underline">
          Back to arcade
        </Link>
      </div>
    );
  }

  if (phase === "submitting") {
    return <p className="text-center font-display text-lg">Saving your score...</p>;
  }

  if (phase === "gameover") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <Avatar3D
          equippedKeys={equippedKeys}
          size={120}
          mood={correctCount >= finalRoundsPlayed * 0.6 ? "happy" : "neutral"}
        />
        <h1 className="font-display text-2xl font-bold text-gold-dark">Nice work!</h1>
        <p className="text-ink/70">
          You popped <span className="font-bold text-ink">{correctCount}</span> of{" "}
          <span className="font-bold text-ink">{finalRoundsPlayed}</span> correctly!
        </p>
        {result && <GameRewardSummary result={result} />}
        <div className="flex gap-3">
          <Button onClick={playAgain}>Play Again</Button>
          <Link href="/games">
            <Button variant="ghost">Back to Arcade</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!round) return null;

  const timePct = Math.max(0, Math.min(100, (timeLeftMs / ROUND_TIME_MS) * 100));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link href="/games" className="text-sm font-semibold text-ink/50">
          ← Exit
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

      <div className="flex flex-col items-center gap-2 rounded-3xl bg-white/80 py-3 shadow-sm">
        <Avatar3D equippedKeys={equippedKeys} size={64} mood={avatarMood} />
        <p className="font-display text-xl font-bold capitalize text-ink">{round.target.word}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {round.balloons.map((balloon, i) => {
          const isPopped = poppedWord === balloon.word;
          const revealCorrect = phase === "result" && balloon.word === round.target.word;
          const tone =
            phase === "result"
              ? revealCorrect
                ? "border-teal bg-teal/15"
                : isPopped
                  ? "border-coral bg-coral/15"
                  : "border-ink/10 bg-white/70 opacity-60"
              : "border-ink/10 bg-white/90 active:scale-90";
          return (
            <motion.button
              key={balloon.word}
              type="button"
              disabled={phase !== "playing"}
              onClick={() => popBalloon(balloon)}
              animate={phase === "playing" ? { y: [0, -8, 0] } : { y: 0 }}
              transition={{ duration: 1.6 + i * 0.2, repeat: phase === "playing" ? Infinity : 0, ease: "easeInOut" }}
              className={`rounded-2xl border-2 py-5 text-4xl transition-colors ${tone}`}
            >
              {balloon.emoji}
            </motion.button>
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
            {outcome === "correct"
              ? "Great job!"
              : outcome === "timeout"
                ? `Time's up! It was "${round.target.word}"`
                : "Not quite!"}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
