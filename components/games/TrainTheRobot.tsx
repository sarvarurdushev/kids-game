"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Avatar3D } from "@/components/three/Avatar3D";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";
import { Button } from "@/components/ui/Button";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { CoinIcon, StarIcon } from "@/components/icons";
import { playCorrect, playWrong, playGameOver, playPop } from "@/lib/sound";
import {
  shuffle,
  sortCategoryPairsForTrack,
  type AgeTrack,
  type SortCategoryPair,
  type SortItem,
} from "@/lib/ai-lab/curriculum";

const ROUNDS_BY_TRACK: Record<AgeTrack, { total: number; teach: number }> = {
  little_sparks: { total: 8, teach: 5 },
  explorers: { total: 10, teach: 6 },
};
const RESULT_PAUSE_MS = 1400;
const SPARX_CORRECT_CHANCE = 0.75;

type Phase = "ready" | "playing" | "submitting" | "gameover";
type Mode = "teach" | "guess";

interface Round {
  item: SortItem;
  mode: Mode;
  sparxGuess?: "a" | "b";
}

interface CompleteResponse {
  rewarded: boolean;
  xpAwarded: number;
  coinsAwarded: number;
  levelsCrossed: number[];
  playsRemainingToday: number;
}

function pickPair(track: AgeTrack): SortCategoryPair {
  const pairs = sortCategoryPairsForTrack(track);
  return shuffle(pairs)[0];
}

function buildRounds(pair: SortCategoryPair, total: number, teachCount: number): Round[] {
  const pool = shuffle(pair.items);
  const rounds: Round[] = [];
  for (let i = 0; i < total; i++) {
    const item = pool[i % pool.length];
    if (i < teachCount) {
      rounds.push({ item, mode: "teach" });
    } else {
      const correct = Math.random() < SPARX_CORRECT_CHANCE;
      const sparxGuess = correct ? item.bucket : item.bucket === "a" ? "b" : "a";
      rounds.push({ item, mode: "guess", sparxGuess });
    }
  }
  return rounds;
}

export function TrainTheRobot({
  equippedKeys,
  track,
}: {
  equippedKeys: AvatarEquippedKeys;
  track: AgeTrack;
}) {
  const { total: TOTAL_ROUNDS, teach: TEACH_ROUNDS } = ROUNDS_BY_TRACK[track];

  const [phase, setPhase] = useState<Phase>("ready");
  const [pair, setPair] = useState<SortCategoryPair | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ good: boolean; text: string } | null>(null);
  const [result, setResult] = useState<CompleteResponse | null>(null);

  const lockRef = useRef(false);

  function startGame() {
    const nextPair = pickPair(track);
    setPair(nextPair);
    setRounds(buildRounds(nextPair, TOTAL_ROUNDS, TEACH_ROUNDS));
    setRoundIndex(0);
    setCorrectCount(0);
    setStreak(0);
    setFeedback(null);
    setResult(null);
    lockRef.current = false;
    setPhase("playing");
  }

  function bucketLabel(pairData: SortCategoryPair, bucket: "a" | "b") {
    return bucket === "a" ? pairData.labelA : pairData.labelB;
  }

  function withArticle(label: string) {
    return `a${/^[aeiou]/i.test(label) ? "n" : ""} ${label}`;
  }

  function advance(nextCorrectCount: number) {
    const next = roundIndex + 1;
    setTimeout(() => {
      if (next >= TOTAL_ROUNDS) {
        void endGame(nextCorrectCount);
      } else {
        setRoundIndex(next);
        setFeedback(null);
        lockRef.current = false;
      }
    }, RESULT_PAUSE_MS);
  }

  function answerTeach(bucket: "a" | "b") {
    if (phase !== "playing" || !pair || lockRef.current) return;
    lockRef.current = true;
    const round = rounds[roundIndex];
    const correct = bucket === round.item.bucket;
    const nextCorrectCount = correctCount + (correct ? 1 : 0);
    setCorrectCount(nextCorrectCount);
    setStreak(correct ? streak + 1 : 0);
    playPop();
    if (correct) playCorrect();
    else playWrong();
    setFeedback({
      good: correct,
      text: correct
        ? `Yes! A ${round.item.word} is ${withArticle(bucketLabel(pair, round.item.bucket))}.`
        : `Not quite — a ${round.item.word} is ${withArticle(bucketLabel(pair, round.item.bucket))}, not ${withArticle(bucketLabel(pair, bucket))}.`,
    });
    advance(nextCorrectCount);
  }

  function answerGuess(verdict: "right" | "wrong") {
    if (phase !== "playing" || !pair || lockRef.current) return;
    lockRef.current = true;
    const round = rounds[roundIndex];
    const sparxWasRight = round.sparxGuess === round.item.bucket;
    const kidCorrect = (verdict === "right") === sparxWasRight;
    const nextCorrectCount = correctCount + (kidCorrect ? 1 : 0);
    setCorrectCount(nextCorrectCount);
    setStreak(kidCorrect ? streak + 1 : 0);
    playPop();
    if (kidCorrect) playCorrect();
    else playWrong();
    setFeedback({
      good: kidCorrect,
      text: sparxWasRight
        ? `Sparx was right! A ${round.item.word} is ${withArticle(bucketLabel(pair, round.item.bucket))}.`
        : `Good catch! A ${round.item.word} is ${withArticle(bucketLabel(pair, round.item.bucket))}, not ${withArticle(bucketLabel(pair, round.sparxGuess!))}. Sparx needs more practice.`,
    });
    advance(nextCorrectCount);
  }

  async function endGame(finalCorrect: number) {
    setPhase("submitting");
    playGameOver();
    try {
      const res = await fetch("/api/games/train_the_robot/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: finalCorrect * 15,
          correctCount: finalCorrect,
          totalCount: TOTAL_ROUNDS,
        }),
      });
      setResult(res.ok ? await res.json() : null);
    } catch {
      setResult(null);
    } finally {
      setPhase("gameover");
    }
  }

  const avatarMood = feedback ? (feedback.good ? "happy" : "sad") : "neutral";

  if (phase === "ready") {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <Avatar3D equippedKeys={equippedKeys} size={130} mood="happy" />
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-dark">Train the Robot</h1>
          <p className="mt-1 text-sm text-ink/60">
            Sort pictures into two groups to teach Sparx, then check Sparx&apos;s own guesses!
          </p>
        </div>
        <Button onClick={startGame}>Start Game</Button>
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
          You got <span className="font-bold text-ink">{correctCount}</span> of{" "}
          <span className="font-bold text-ink">{TOTAL_ROUNDS}</span> right!
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
          <Link href="/ai-lab">
            <Button variant="ghost">Back to AI Lab</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!pair || rounds.length === 0) return null;
  const round = rounds[roundIndex];
  const locked = feedback !== null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link href="/ai-lab" className="text-sm font-semibold text-ink/50">
          ← Exit
        </Link>
        <div className="flex items-center gap-2">
          {streak >= 3 && (
            <span className="rounded-full bg-coral/15 px-2 py-0.5 text-xs font-bold text-coral">🔥 x{streak}</span>
          )}
          <span className="text-sm font-bold text-ink/60">
            {roundIndex + 1}/{TOTAL_ROUNDS}
          </span>
        </div>
      </div>

      <p className="text-center text-xs font-bold tracking-wide text-teal uppercase">
        {round.mode === "teach" ? "Teach Sparx" : "Check Sparx's guess"}
      </p>

      <div className="flex flex-col items-center gap-2 rounded-3xl bg-white/80 py-5 shadow-sm">
        <Avatar3D equippedKeys={equippedKeys} size={64} mood={avatarMood} />
        <div className="flex items-center gap-2">
          <div className="text-6xl">{round.item.emoji}</div>
          <SpeakButton text={round.item.word} />
        </div>
        <p className="text-lg font-bold capitalize text-ink">{round.item.word}</p>

        {round.mode === "guess" && round.sparxGuess && (
          <div className="mt-1 rounded-2xl bg-teal/10 px-4 py-2 text-center text-sm font-semibold text-teal">
            Sparx thinks: {round.sparxGuess === "a" ? pair.emojiA : pair.emojiB}{" "}
            {bucketLabel(pair, round.sparxGuess)}
          </div>
        )}
      </div>

      {round.mode === "teach" ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={locked}
            onClick={() => answerTeach("a")}
            className="flex flex-col items-center gap-1 rounded-2xl bg-gold/15 py-4 font-display font-bold text-ink shadow-sm transition-transform active:scale-95 disabled:opacity-50"
          >
            <span className="text-3xl">{pair.emojiA}</span>
            {pair.labelA}
          </button>
          <button
            type="button"
            disabled={locked}
            onClick={() => answerTeach("b")}
            className="flex flex-col items-center gap-1 rounded-2xl bg-coral/15 py-4 font-display font-bold text-ink shadow-sm transition-transform active:scale-95 disabled:opacity-50"
          >
            <span className="text-3xl">{pair.emojiB}</span>
            {pair.labelB}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={locked}
            onClick={() => answerGuess("right")}
            className="flex flex-col items-center gap-1 rounded-2xl bg-teal/15 py-4 font-display font-bold text-ink shadow-sm transition-transform active:scale-95 disabled:opacity-50"
          >
            <span className="text-3xl">✅</span>
            Sparx is right
          </button>
          <button
            type="button"
            disabled={locked}
            onClick={() => answerGuess("wrong")}
            className="flex flex-col items-center gap-1 rounded-2xl bg-coral/15 py-4 font-display font-bold text-ink shadow-sm transition-transform active:scale-95 disabled:opacity-50"
          >
            <span className="text-3xl">❌</span>
            Sparx is wrong
          </button>
        </div>
      )}

      <AnimatePresence>
        {feedback && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center text-sm font-bold ${feedback.good ? "text-teal" : "text-coral"}`}
          >
            {feedback.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
