"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { AvatarRenderer } from "@/components/avatar/AvatarRenderer";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";
import { Button } from "@/components/ui/Button";
import { CoinIcon, StarIcon } from "@/components/icons";
import { playCorrect, playWrong, playGameOver, playPop } from "@/lib/sound";
import { shuffle, wordsUpToDifficulty, type WordEntry } from "@/lib/games/wordBank";

const PAIR_COUNT = 6;
const MISMATCH_PAUSE_MS = 800;
const MAX_SUBMITTED_MOVES = 30;

type Phase = "ready" | "playing" | "submitting" | "gameover";
type Feedback = "match" | "mismatch" | null;

interface MatchCard {
  id: string;
  pairId: string;
  kind: "emoji" | "word";
  value: string;
}

interface CompleteResponse {
  rewarded: boolean;
  xpAwarded: number;
  coinsAwarded: number;
  levelsCrossed: number[];
  playsRemainingToday: number;
}

function buildDeck(): MatchCard[] {
  const words: WordEntry[] = shuffle(wordsUpToDifficulty(2)).slice(0, PAIR_COUNT);
  const cards: MatchCard[] = words.flatMap((w) => [
    { id: `${w.word}-emoji`, pairId: w.word, kind: "emoji" as const, value: w.emoji },
    { id: `${w.word}-word`, pairId: w.word, kind: "word" as const, value: w.word },
  ]);
  return shuffle(cards);
}

export function MemoryMatch({ equippedKeys }: { equippedKeys: AvatarEquippedKeys }) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [deck, setDeck] = useState<MatchCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [result, setResult] = useState<CompleteResponse | null>(null);

  const lockRef = useRef(false);
  const movesRef = useRef(0);

  function startGame() {
    lockRef.current = false;
    movesRef.current = 0;
    setDeck(buildDeck());
    setFlippedIds([]);
    setMatchedPairIds(new Set());
    setMoves(0);
    setStreak(0);
    setFeedback(null);
    setResult(null);
    setPhase("playing");
  }

  function onCardTap(card: MatchCard) {
    if (lockRef.current || matchedPairIds.has(card.pairId) || flippedIds.includes(card.id)) return;
    if (flippedIds.length >= 2) return;

    const next = [...flippedIds, card.id];
    setFlippedIds(next);
    if (next.length === 1) {
      playPop();
      return;
    }

    // second flip of this attempt
    movesRef.current += 1;
    setMoves(movesRef.current);
    const [firstId] = next;
    const first = deck.find((c) => c.id === firstId)!;
    const isMatch = first.pairId === card.pairId;

    if (isMatch) {
      playCorrect();
      setStreak((s) => s + 1);
      setFeedback("match");
      const newMatched = new Set(matchedPairIds);
      newMatched.add(card.pairId);
      setMatchedPairIds(newMatched);
      setFlippedIds([]);
      setTimeout(() => setFeedback(null), 500);
      if (newMatched.size === PAIR_COUNT) {
        void endGame(movesRef.current);
      }
    } else {
      playWrong();
      setStreak(0);
      setFeedback("mismatch");
      lockRef.current = true;
      setTimeout(() => {
        setFlippedIds([]);
        setFeedback(null);
        lockRef.current = false;
      }, MISMATCH_PAUSE_MS);
    }
  }

  async function endGame(totalMoves: number) {
    setPhase("submitting");
    playGameOver();
    try {
      const res = await fetch("/api/games/memory_match/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: PAIR_COUNT * 20 - totalMoves,
          correctCount: PAIR_COUNT,
          totalCount: Math.min(totalMoves, MAX_SUBMITTED_MOVES),
        }),
      });
      setResult(res.ok ? await res.json() : null);
    } catch {
      setResult(null);
    } finally {
      setPhase("gameover");
    }
  }

  const avatarMood = feedback === "match" ? "happy" : feedback === "mismatch" ? "sad" : "neutral";

  if (phase === "ready") {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <AvatarRenderer equippedKeys={equippedKeys} size={110} mood="happy" animated />
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-dark">Memory Match</h1>
          <p className="mt-1 text-sm text-ink/60">
            Flip two cards at a time and find every picture-and-word pair!
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
        <AvatarRenderer equippedKeys={equippedKeys} size={100} mood="happy" animated />
        <h1 className="font-display text-2xl font-bold text-gold-dark">All matched!</h1>
        <p className="text-ink/70">
          You found all {PAIR_COUNT} pairs in <span className="font-bold text-ink">{moves}</span> moves!
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
          <Button onClick={startGame}>Play Again</Button>
          <Link href="/games">
            <Button variant="ghost">Back to Arcade</Button>
          </Link>
        </div>
      </div>
    );
  }

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
          <span className="text-sm font-bold text-ink/60">
            {matchedPairIds.size}/{PAIR_COUNT} pairs · {moves} moves
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        <AvatarRenderer equippedKeys={equippedKeys} size={48} mood={avatarMood} animated />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {deck.map((card) => {
          const isFlipped = flippedIds.includes(card.id) || matchedPairIds.has(card.pairId);
          const isMatched = matchedPairIds.has(card.pairId);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onCardTap(card)}
              className="aspect-square"
              style={{ perspective: 600 }}
              disabled={isMatched}
              data-pair-id={card.pairId}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.35 }}
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-dark text-lg font-bold text-white shadow-sm"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  ?
                </div>
                <div
                  className={`absolute inset-0 flex items-center justify-center rounded-xl border-2 px-1 text-center shadow-sm ${
                    isMatched ? "border-teal bg-teal/15" : "border-ink/10 bg-white"
                  } ${card.kind === "emoji" ? "text-2xl" : "text-xs font-bold text-ink"}`}
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  {card.value}
                </div>
              </motion.div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center text-sm font-bold ${feedback === "match" ? "text-teal" : "text-coral"}`}
          >
            {feedback === "match" ? "Match found!" : "Not a match, try again!"}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
