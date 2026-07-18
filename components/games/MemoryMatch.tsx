"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Avatar3D } from "@/components/three/Avatar3D";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";
import { Button } from "@/components/ui/Button";
import { CoinIcon, StarIcon } from "@/components/icons";
import { playCorrect, playWrong, playGameOver, playPop } from "@/lib/sound";
import { shuffle, wordsUpToDifficulty, type WordEntry } from "@/lib/games/wordBank";
import { MemoryMatchScene3D } from "./MemoryMatchScene3D";

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
        <Avatar3D equippedKeys={equippedKeys} size={130} mood="happy" />
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
        <Avatar3D equippedKeys={equippedKeys} size={120} mood="happy" />
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
        <Avatar3D equippedKeys={equippedKeys} size={64} mood={avatarMood} />
      </div>

      <MemoryMatchScene3D
        cards={deck.map((card) => ({
          id: card.id,
          kind: card.kind,
          value: card.value,
          isFlipped: flippedIds.includes(card.id) || matchedPairIds.has(card.pairId),
          isMatched: matchedPairIds.has(card.pairId),
        }))}
        onTap={(id) => {
          const card = deck.find((c) => c.id === id);
          if (card) onCardTap(card);
        }}
      />

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
