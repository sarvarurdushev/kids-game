"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Avatar3D } from "@/components/three/Avatar3D";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";
import { Button } from "@/components/ui/Button";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { CoinIcon, StarIcon } from "@/components/icons";
import { playCorrect, playWrong, playGameOver, playTick, playPop } from "@/lib/sound";
import {
  connectorFor,
  sequenceRoutinesForTrack,
  shuffle,
  type AgeTrack,
  type SequenceRoutine,
} from "@/lib/ai-lab/curriculum";
import { speak } from "@/lib/speech";

const TOTAL_ROUNDS = 5;
const TICK_MS = 100;
const RESULT_PAUSE_MS = 1600;
const SHAKE_PAUSE_MS = 550;
const TIME_BASE_MS = 6000;
const TIME_PER_STEP_MS = 3500;

type Phase = "ready" | "playing" | "submitting" | "gameover";
type Outcome = "correct" | "timeout" | null;

interface Tile {
  id: string;
  stepIndex: number;
  text: string;
  emoji: string;
}

interface CompleteResponse {
  rewarded: boolean;
  xpAwarded: number;
  coinsAwarded: number;
  levelsCrossed: number[];
  playsRemainingToday: number;
}

function buildRound(routine: SequenceRoutine): Tile[] {
  return shuffle(
    routine.steps.map((step, i) => ({
      id: `${routine.key}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      stepIndex: i,
      text: step.text,
      emoji: step.emoji,
    }))
  );
}

export function SequenceBuilder({
  equippedKeys,
  track,
}: {
  equippedKeys: AvatarEquippedKeys;
  track: AgeTrack;
}) {
  const timed = track === "explorers";
  const routinePool = sequenceRoutinesForTrack(track);

  const [phase, setPhase] = useState<Phase>("ready");
  const [roundIndex, setRoundIndexState] = useState(0);
  const [routine, setRoutine] = useState<SequenceRoutine | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
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
  const usedRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingRef = useRef(0);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    []
  );

  function pickRoutine(): SequenceRoutine {
    const fresh = routinePool.filter((r) => !usedRef.current.has(r.key));
    const candidates = fresh.length > 0 ? fresh : routinePool;
    return shuffle(candidates)[0];
  }

  function startRound(index: number) {
    resolvedRef.current = false;
    checkingRef.current = false;
    roundIndexRef.current = index;
    setRoundIndexState(index);
    setOutcome(null);
    setPlacedIds([]);

    const nextRoutine = pickRoutine();
    usedRef.current.add(nextRoutine.key);
    setRoutine(nextRoutine);
    setTiles(buildRound(nextRoutine));

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timed) {
      const duration = TIME_BASE_MS + nextRoutine.steps.length * TIME_PER_STEP_MS;
      remainingRef.current = duration;
      setTimeLeftMs(duration);
      setTotalTimeMs(duration);
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
    setPhase("playing");
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
    if (phase !== "playing" || checkingRef.current || resolvedRef.current || placedIds.includes(tile.id) || !routine)
      return;
    playPop();
    const next = [...placedIds, tile.id];
    setPlacedIds(next);

    if (next.length === routine.steps.length) {
      const tileById = new Map(tiles.map((t) => [t.id, t]));
      const order = next.map((id) => tileById.get(id)!.stepIndex);
      const correct = order.every((stepIndex, i) => stepIndex === i);
      if (correct) {
        resolve(true);
      } else {
        checkingRef.current = true;
        setShake(true);
        setTimeout(() => {
          setPlacedIds([]);
          setShake(false);
          checkingRef.current = false;
        }, SHAKE_PAUSE_MS);
      }
    }
  }

  function backspace() {
    if (phase !== "playing" || checkingRef.current || resolvedRef.current) return;
    setPlacedIds((ids) => ids.slice(0, -1));
  }

  async function endGame(finalCorrect: number, roundsPlayed: number) {
    setPhase("submitting");
    playGameOver();
    try {
      const res = await fetch("/api/games/sequence_builder/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: finalCorrect * 20, correctCount: finalCorrect, totalCount: roundsPlayed }),
      });
      setResult(res.ok ? await res.json() : null);
    } catch {
      setResult(null);
    } finally {
      setPhase("gameover");
    }
  }

  function playAgain() {
    usedRef.current = new Set();
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
          <h1 className="font-display text-2xl font-bold text-gold-dark">Sequence Builder</h1>
          <p className="mt-1 text-sm text-ink/60">
            Tap the steps in the right order — first, next, then, last!
          </p>
        </div>
        <Button onClick={() => startRound(0)}>Start Game</Button>
        <Link href="/ai-lab" className="text-sm font-semibold text-teal underline-offset-2 hover:underline">
          Back to AI Lab
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
          You ordered <span className="font-bold text-ink">{correctCount}</span> of{" "}
          <span className="font-bold text-ink">{TOTAL_ROUNDS}</span> routines correctly!
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
          <Link href="/ai-lab">
            <Button variant="ghost">Back to AI Lab</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!routine) return null;
  const tileById = new Map(tiles.map((t) => [t.id, t]));
  const timePct = timed ? Math.max(0, Math.min(100, (timeLeftMs / totalTimeMs) * 100)) : 100;
  const stepCount = routine.steps.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link href="/ai-lab" className="text-sm font-semibold text-ink/50">
          ← Exit
        </Link>
        <div className="flex items-center gap-2">
          {streak >= 2 && (
            <span className="rounded-full bg-coral/15 px-2 py-0.5 text-xs font-bold text-coral">🔥 x{streak}</span>
          )}
          <span className="text-sm font-bold text-ink/60">
            Round {roundIndex + 1}/{TOTAL_ROUNDS}
          </span>
        </div>
      </div>

      {timed && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: timePct < 30 ? "var(--color-gk-coral)" : "var(--color-teal)" }}
            animate={{ width: `${timePct}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>
      )}

      <div className="flex flex-col items-center gap-1 rounded-3xl bg-white/80 py-3 shadow-sm">
        <Avatar3D equippedKeys={equippedKeys} size={56} mood={avatarMood} />
        <p className="font-display text-base font-bold text-ink">{routine.title}</p>
      </div>

      <motion.div
        animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(stepCount, 4)}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: stepCount }).map((_, i) => {
          const id = placedIds[i];
          const tile = id ? tileById.get(id) : undefined;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-16 w-full items-center justify-center rounded-xl border-2 text-2xl ${
                  tile ? "border-gold bg-gold/10" : "border-dashed border-ink/20 text-ink/20"
                }`}
              >
                {tile ? tile.emoji : "?"}
              </div>
              <span className="text-[10px] font-bold tracking-wide text-ink/50 uppercase">
                {connectorFor(i, stepCount)}
              </span>
            </div>
          );
        })}
      </motion.div>

      <button
        type="button"
        onClick={() =>
          speak(
            routine.steps
              .map((step, i) => `${connectorFor(i, stepCount)}, ${step.text}.`)
              .join(" ")
          )
        }
        className="mx-auto flex items-center gap-1 text-xs font-semibold text-teal underline-offset-2 hover:underline"
      >
        🔊 Read the routine
      </button>

      <div className="grid grid-cols-2 gap-2">
        {tiles
          .filter((t) => !placedIds.includes(t.id))
          .map((tile) => (
            <div key={tile.id} className="flex items-center gap-1 rounded-2xl bg-white pl-3 pr-1.5 py-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => tapTile(tile)}
                disabled={shake || outcome !== null}
                className="flex flex-1 items-center gap-2 py-1.5 text-left transition-transform active:scale-95 disabled:opacity-50"
              >
                <span className="text-2xl">{tile.emoji}</span>
                <span className="flex-1 text-sm font-semibold text-ink">{tile.text}</span>
              </button>
              <SpeakButton text={tile.text} className="h-7 w-7 text-sm" />
            </div>
          ))}
      </div>

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
        {outcome && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center text-sm font-bold ${outcome === "correct" ? "text-teal" : "text-coral"}`}
          >
            {outcome === "correct" ? "Great job — that's the right order!" : "Time's up! Let's see the right order next time."}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
