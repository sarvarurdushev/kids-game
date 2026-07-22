"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Avatar3D } from "@/components/three/Avatar3D";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";
import { Button } from "@/components/ui/Button";
import { playCorrect, playWrong, playGameOver, playPop } from "@/lib/sound";
import { shuffle, type WordEntry } from "@/lib/games/wordBank";
import { curriculumWordsUpToDifficulty } from "@/lib/games/curriculum";
import { GameRewardSummary } from "./GameRewardSummary";

const TOTAL_ROUNDS = 6;
const PAD_COUNT = 4;
const FLASH_MS = 500;
const GAP_MS = 250;
const HIGHLIGHT_MS = 250;
const RESULT_PAUSE_MS = 1000;

type Phase = "ready" | "watching" | "input" | "result" | "submitting" | "gameover";

interface RoundData {
  sequence: number[];
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

function buildPads(): WordEntry[] {
  return shuffle(curriculumWordsUpToDifficulty(3)).slice(0, PAD_COUNT);
}

function buildRound(roundIndex: number): RoundData {
  const length = roundIndex + 2;
  const sequence = Array.from({ length }, () => Math.floor(Math.random() * PAD_COUNT));
  return { sequence };
}

// Same refs-for-synchronous-state pattern as EmojiQuiz/WordCatch, plus a
// timeouts array so leaving mid-playback doesn't leak scheduled highlights.
export function SequenceMemory({ equippedKeys }: { equippedKeys: AvatarEquippedKeys }) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [pads, setPads] = useState<WordEntry[]>([]);
  const [roundIndex, setRoundIndexState] = useState(0);
  const [round, setRound] = useState<RoundData | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [result, setResult] = useState<CompleteResponse | null>(null);
  const [finalRoundsPlayed, setFinalRoundsPlayed] = useState(0);

  const correctRef = useRef(0);
  const roundIndexRef = useRef(0);
  const roundRef = useRef<RoundData | null>(null);
  const inputProgressRef = useRef(0);
  const resolvedRef = useRef(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimeouts() {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }

  function schedule(fn: () => void, delay: number) {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  }

  useEffect(() => () => clearTimeouts(), []);

  function playSequence(sequence: number[]) {
    sequence.forEach((padIdx, i) => {
      schedule(() => {
        setHighlightIndex(padIdx);
        playPop();
        schedule(() => setHighlightIndex(null), FLASH_MS);
      }, i * (FLASH_MS + GAP_MS));
    });
    schedule(() => setPhase("input"), sequence.length * (FLASH_MS + GAP_MS));
  }

  function startRound(index: number) {
    clearTimeouts();
    resolvedRef.current = false;
    inputProgressRef.current = 0;
    roundIndexRef.current = index;
    setRoundIndexState(index);
    setHighlightIndex(null);
    const data = buildRound(index);
    roundRef.current = data;
    setRound(data);
    setPhase("watching");
    playSequence(data.sequence);
  }

  function startGame() {
    setPads(buildPads());
    correctRef.current = 0;
    setCorrectCount(0);
    setStreak(0);
    setResult(null);
    startRound(0);
  }

  function resolve(success: boolean) {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    clearTimeouts();

    if (success) {
      playCorrect();
      correctRef.current += 1;
      setCorrectCount(correctRef.current);
      setStreak((s) => s + 1);
    } else {
      playWrong();
      setStreak(0);
    }
    setLastCorrect(success);
    setPhase("result");

    schedule(() => {
      const roundsPlayed = roundIndexRef.current + 1;
      if (roundsPlayed >= TOTAL_ROUNDS) {
        void endGame(correctRef.current, roundsPlayed);
      } else {
        startRound(roundsPlayed);
      }
    }, RESULT_PAUSE_MS);
  }

  function tapPad(padIdx: number) {
    if (phase !== "input" || !roundRef.current) return;
    const seq = roundRef.current.sequence;
    const expected = seq[inputProgressRef.current];
    setHighlightIndex(padIdx);
    playPop();
    schedule(() => setHighlightIndex(null), HIGHLIGHT_MS);

    if (padIdx === expected) {
      inputProgressRef.current += 1;
      if (inputProgressRef.current === seq.length) resolve(true);
    } else {
      resolve(false);
    }
  }

  async function endGame(finalCorrect: number, roundsPlayed: number) {
    setPhase("submitting");
    setFinalRoundsPlayed(roundsPlayed);
    playGameOver();
    try {
      const res = await fetch("/api/games/sequence_memory/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: finalCorrect * 15, correctCount: finalCorrect, totalCount: roundsPlayed }),
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
          <h1 className="font-display text-2xl font-bold text-gold-dark">Sequence Memory</h1>
          <p className="mt-1 text-sm text-ink/60">
            Watch the pattern, then tap it back in the same order!
          </p>
        </div>
        <Button onClick={startGame}>Start Game</Button>
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
          You remembered <span className="font-bold text-ink">{correctCount}</span> of{" "}
          <span className="font-bold text-ink">{finalRoundsPlayed}</span> patterns!
        </p>
        {result && <GameRewardSummary result={result} />}
        <div className="flex gap-3">
          <Button onClick={startGame}>Play Again</Button>
          <Link href="/games">
            <Button variant="ghost">Back to Arcade</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!round || pads.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link href="/games" className="text-sm font-semibold text-ink/50">
          ← Exit
        </Link>
        <div className="flex items-center gap-2">
          {streak >= 2 && (
            <span className="rounded-full bg-coral/15 px-2 py-0.5 text-xs font-bold text-coral">
              🔥 x{streak}
            </span>
          )}
          <span className="text-xs font-bold text-ink/40">
            {roundIndex + 1} / {TOTAL_ROUNDS}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 rounded-3xl bg-white/80 py-3 shadow-sm">
        <Avatar3D equippedKeys={equippedKeys} size={64} mood={avatarMood} />
        <p className="text-sm font-semibold text-ink/60">
          {phase === "watching" ? "Watch closely..." : phase === "input" ? "Your turn — tap it back!" : " "}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {pads.map((pad, i) => (
          <motion.button
            key={pad.word}
            type="button"
            disabled={phase !== "input"}
            onClick={() => tapPad(i)}
            animate={highlightIndex === i ? { scale: 1.08 } : { scale: 1 }}
            transition={{ duration: 0.15 }}
            className={`rounded-2xl border-2 py-8 text-5xl transition-colors ${
              highlightIndex === i ? "border-gold bg-gold/20" : "border-ink/10 bg-white/90"
            }`}
          >
            {pad.emoji}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {phase === "result" && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center text-sm font-bold ${lastCorrect ? "text-teal" : "text-coral"}`}
          >
            {lastCorrect ? "Great memory!" : "Not quite! Watch closely next time."}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
