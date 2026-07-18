"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Avatar3D } from "@/components/three/Avatar3D";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";
import { Button } from "@/components/ui/Button";
import { CoinIcon, StarIcon } from "@/components/icons";
import { playCorrect, playWrong, playGameOver, playTick, playPop } from "@/lib/sound";
import { shuffle, wordsUpToDifficulty, type WordEntry } from "@/lib/games/wordBank";
import { WordScrambleScene3D } from "./WordScrambleScene3D";

const TOTAL_ROUNDS = 8;
const TIME_BASE_MS = 5000;
const TIME_PER_LETTER_MS = 1500;
const TICK_MS = 100;
const RESULT_PAUSE_MS = 1000;
const WRONG_ATTEMPT_PAUSE_MS = 500;

type Phase = "ready" | "playing" | "result" | "submitting" | "gameover";
type Outcome = "correct" | "timeout" | null;

interface Tile {
  id: string;
  char: string;
}

interface RoundData {
  target: WordEntry;
  tiles: Tile[];
}

interface CompleteResponse {
  rewarded: boolean;
  xpAwarded: number;
  coinsAwarded: number;
  levelsCrossed: number[];
  playsRemainingToday: number;
}

function timeForWord(word: string): number {
  return TIME_BASE_MS + word.length * TIME_PER_LETTER_MS;
}

function maxDifficultyFor(roundIndex: number): 1 | 2 | 3 {
  if (roundIndex < 3) return 1;
  if (roundIndex < 6) return 2;
  return 3;
}

function buildRound(roundIndex: number, usedWords: Set<string>): RoundData {
  const pool = wordsUpToDifficulty(maxDifficultyFor(roundIndex));
  const fresh = pool.filter((w) => !usedWords.has(w.word));
  const candidates = fresh.length > 0 ? fresh : pool;
  const target = shuffle(candidates)[0];
  const tiles = shuffle(
    target.word.split("").map((char, i) => ({ id: `${char}-${i}-${Math.random().toString(36).slice(2, 6)}`, char }))
  );
  return { target, tiles };
}

export function WordScramble({ equippedKeys }: { equippedKeys: AvatarEquippedKeys }) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [roundIndex, setRoundIndexState] = useState(0);
  const [round, setRound] = useState<RoundData | null>(null);
  const [placedIds, setPlacedIds] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [shake, setShake] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [totalTimeMs, setTotalTimeMs] = useState(1);
  const [result, setResult] = useState<CompleteResponse | null>(null);

  const roundIndexRef = useRef(0);
  const correctRef = useRef(0);
  const resolvedRef = useRef(false);
  const checkingRef = useRef(false);
  const usedWordsRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(0);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  function startRound(index: number) {
    resolvedRef.current = false;
    checkingRef.current = false;
    roundIndexRef.current = index;
    setRoundIndexState(index);
    setOutcome(null);
    setPlacedIds([]);

    const data = buildRound(index, usedWordsRef.current);
    usedWordsRef.current.add(data.target.word);
    setRound(data);

    const duration = timeForWord(data.target.word);
    remainingRef.current = duration;
    setTimeLeftMs(duration);
    setTotalTimeMs(duration);
    setPhase("playing");

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      remainingRef.current -= TICK_MS;
      if (remainingRef.current <= 0) {
        setTimeLeftMs(0);
        resolve(false);
      } else {
        setTimeLeftMs(remainingRef.current);
        if (remainingRef.current <= 3000 && remainingRef.current % 1000 < TICK_MS) playTick();
      }
    }, TICK_MS);
  }

  function resolve(success: boolean) {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (success) {
      playCorrect();
      correctRef.current += 1;
      setCorrectCount(correctRef.current);
      setStreak((s) => s + 1);
      setOutcome("correct");
    } else {
      playWrong();
      setStreak(0);
      setOutcome("timeout");
    }
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

  function tapTile(tile: Tile) {
    if (phase !== "playing" || checkingRef.current || placedIds.includes(tile.id) || !round) return;
    playPop();
    const next = [...placedIds, tile.id];
    setPlacedIds(next);

    if (next.length === round.target.word.length) {
      const tileById = new Map(round.tiles.map((t) => [t.id, t.char]));
      const attempt = next.map((id) => tileById.get(id)).join("");
      if (attempt === round.target.word) {
        resolve(true);
      } else {
        checkingRef.current = true;
        setShake(true);
        setTimeout(() => {
          setPlacedIds([]);
          setShake(false);
          checkingRef.current = false;
        }, WRONG_ATTEMPT_PAUSE_MS);
      }
    }
  }

  function backspace() {
    if (phase !== "playing" || checkingRef.current) return;
    setPlacedIds((ids) => ids.slice(0, -1));
  }

  async function endGame(finalCorrect: number, roundsPlayed: number) {
    setPhase("submitting");
    playGameOver();
    try {
      const res = await fetch("/api/games/word_scramble/complete", {
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

  function playAgain() {
    usedWordsRef.current = new Set();
    correctRef.current = 0;
    setCorrectCount(0);
    setStreak(0);
    setResult(null);
    startRound(0);
  }

  const avatarMood = outcome === "correct" ? "happy" : outcome === "timeout" ? "sad" : "neutral";

  if (phase === "ready") {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <Avatar3D equippedKeys={equippedKeys} size={130} mood="happy" />
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-dark">Word Scramble</h1>
          <p className="mt-1 text-sm text-ink/60">
            Tap the letters in order to spell the word before time runs out!
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
          mood={correctCount >= TOTAL_ROUNDS * 0.6 ? "happy" : "neutral"}
        />
        <h1 className="font-display text-2xl font-bold text-gold-dark">All done!</h1>
        <p className="text-ink/70">
          You spelled <span className="font-bold text-ink">{correctCount}</span> of{" "}
          <span className="font-bold text-ink">{TOTAL_ROUNDS}</span> words correctly!
        </p>
        {result && (
          <div className="flex items-center gap-4 rounded-2xl bg-white/80 px-5 py-3 shadow-sm">
            <span className="flex items-center gap-1 font-bold text-gold-dark">
              <StarIcon size={18} /> +{result.xpAwarded} XP
            </span>
            <span className="flex items-center gap-1 font-bold text-gold-dark">
              <CoinIcon size={18} /> +{result.coinsAwarded}
            </span>
          </div>
        )}
        {result && !result.rewarded && (
          <p className="text-xs text-ink/50">Practice round — come back tomorrow for more rewarded rounds!</p>
        )}
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

  const tileById = new Map(round.tiles.map((t) => [t.id, t]));
  const timePct = Math.max(0, Math.min(100, (timeLeftMs / totalTimeMs) * 100));

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
          <span className="text-sm font-bold text-ink/60">
            Word {roundIndex + 1}/{TOTAL_ROUNDS}
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
        <Avatar3D equippedKeys={equippedKeys} size={64} mood={avatarMood} />
        <div className="text-5xl">{round.target.emoji}</div>
      </div>

      <motion.div
        animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
        className="flex min-h-14 flex-wrap justify-center gap-2"
      >
        {placedIds.length === 0 && phase === "playing" && (
          <span className="py-3 text-sm text-ink/30">Tap letters below</span>
        )}
        {placedIds.map((id) => (
          <div
            key={id}
            className="flex h-12 w-10 items-center justify-center rounded-xl border-2 border-gold bg-gold/10 text-lg font-bold uppercase text-ink"
          >
            {tileById.get(id)?.char}
          </div>
        ))}
      </motion.div>

      <WordScrambleScene3D
        tiles={round.tiles.map((tile) => ({
          id: tile.id,
          char: tile.char,
          used: placedIds.includes(tile.id),
        }))}
        onTap={(id) => {
          const tile = round.tiles.find((t) => t.id === id);
          if (tile) tapTile(tile);
        }}
      />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={backspace}
          disabled={placedIds.length === 0 || phase !== "playing"}
          className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-ink/60 shadow-sm disabled:opacity-40"
        >
          ⌫ Undo
        </button>
      </div>

      <AnimatePresence>
        {phase === "result" && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center text-sm font-bold ${outcome === "correct" ? "text-teal" : "text-coral"}`}
          >
            {outcome === "correct" ? "Great job!" : `Time's up! It was "${round.target.word}"`}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
