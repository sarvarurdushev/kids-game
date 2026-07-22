"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Avatar3D } from "@/components/three/Avatar3D";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";
import { Button } from "@/components/ui/Button";
import { playCorrect, playWrong, playGameOver } from "@/lib/sound";
import { randomWords, shuffle, type WordEntry } from "@/lib/games/wordBank";
import { curriculumWordsUpToDifficulty } from "@/lib/games/curriculum";
import { GameRewardSummary } from "./GameRewardSummary";

const TOTAL_ROUNDS = 10;
const RESULT_PAUSE_MS = 900;

type Phase = "ready" | "playing" | "result" | "submitting" | "gameover";

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

// Same refs-for-synchronous-state pattern as WordCatch: the "move to next
// round" timeout reads roundIndex/correctCount right after they change, and
// a value threaded only through React state can be stale inside that
// closure if the timeout fires across a render boundary.
export function EmojiQuiz({ equippedKeys }: { equippedKeys: AvatarEquippedKeys }) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [roundIndex, setRoundIndexState] = useState(0);
  const [round, setRound] = useState<RoundData | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pickedWord, setPickedWord] = useState<string | null>(null);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [result, setResult] = useState<CompleteResponse | null>(null);
  const [finalRoundsPlayed, setFinalRoundsPlayed] = useState(0);

  const correctRef = useRef(0);
  const roundIndexRef = useRef(0);
  const roundRef = useRef<RoundData | null>(null);
  const usedWordsRef = useRef<Set<string>>(new Set());

  function startRound(index: number) {
    roundIndexRef.current = index;
    setRoundIndexState(index);
    setPickedWord(null);
    const data = buildRound(index, usedWordsRef.current);
    usedWordsRef.current.add(data.target.word);
    roundRef.current = data;
    setRound(data);
    setPhase("playing");
  }

  function pick(word: string) {
    if (phase !== "playing" || !roundRef.current) return;
    const correct = word === roundRef.current.target.word;
    setPickedWord(word);
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
      const res = await fetch("/api/games/emoji_quiz/complete", {
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
    usedWordsRef.current = new Set();
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
          <h1 className="font-display text-2xl font-bold text-gold-dark">Emoji Quiz</h1>
          <p className="mt-1 text-sm text-ink/60">
            A picture shows up — tap the word that matches it!
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
          You got <span className="font-bold text-ink">{correctCount}</span> of{" "}
          <span className="font-bold text-ink">{finalRoundsPlayed}</span> right!
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

      <div className="flex flex-col items-center gap-2 rounded-3xl bg-white/80 py-4 shadow-sm">
        <Avatar3D equippedKeys={equippedKeys} size={72} mood={avatarMood} />
        <div className="text-6xl">{round.target.emoji}</div>
        <p className="text-sm font-semibold text-ink/60">What is this?</p>
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
            className={`text-center text-sm font-bold ${lastCorrect ? "text-teal" : "text-coral"}`}
          >
            {lastCorrect ? "Great job!" : "Not quite!"}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
