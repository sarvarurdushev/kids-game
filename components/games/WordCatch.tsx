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
import { WordCatchScene3D, type BlockTint } from "./WordCatchScene3D";
import { GameRewardSummary } from "./GameRewardSummary";
import { useTranslation } from "@/components/i18n/LanguageProvider";

const TOTAL_ROUNDS = 10;
const LIVES_START = 3;
const INITIAL_FALL_MS = 3200;
const MIN_FALL_MS = 1900;
const FALL_STEP_MS = 140;
const RESULT_PAUSE_MS = 900;

type Phase = "ready" | "playing" | "result" | "submitting" | "gameover";
type Outcome = "correct" | "wrong" | "miss" | null;

interface RoundData {
  target: WordEntry;
  bubbles: WordEntry[];
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

function fallDurationFor(roundIndex: number): number {
  return Math.max(MIN_FALL_MS, INITIAL_FALL_MS - roundIndex * FALL_STEP_MS);
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
  const distractorPool = sameCategory.length >= 2 ? sameCategory : pool.filter((w) => w.word !== target.word);
  const distractors = randomWords(2, distractorPool, target);

  return { target, bubbles: shuffle([target, ...distractors]) };
}

// Mutable game state lives in refs, not just React state — the round timer
// and tap handler both need to read/advance it synchronously, and a value
// threaded through nested setTimeout closures goes stale the moment two
// timers overlap (a miss timer for round N firing after round N-1's result
// pause already changed lives). Refs sidestep that: every read is current
// regardless of which render's closure is executing. State setters mirror
// the refs afterward purely to trigger a re-render.
export function WordCatch({ equippedKeys }: { equippedKeys: AvatarEquippedKeys }) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>("ready");
  const [roundIndex, setRoundIndexState] = useState(0);
  const [round, setRound] = useState<RoundData | null>(null);
  const [lives, setLives] = useState(LIVES_START);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [tappedWord, setTappedWord] = useState<string | null>(null);
  const [result, setResult] = useState<CompleteResponse | null>(null);
  const [finalRoundsPlayed, setFinalRoundsPlayed] = useState(0);

  const livesRef = useRef(LIVES_START);
  const correctRef = useRef(0);
  const roundIndexRef = useRef(0);
  const roundRef = useRef<RoundData | null>(null);
  const resolvedRef = useRef(false);
  const usedWordsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startRound(index: number) {
    resolvedRef.current = false;
    roundIndexRef.current = index;
    setRoundIndexState(index);
    setTappedWord(null);
    setOutcome(null);
    const data = buildRound(index, usedWordsRef.current);
    usedWordsRef.current.add(data.target.word);
    roundRef.current = data;
    setRound(data);
    setPhase("playing");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => resolve(null), fallDurationFor(index));
  }

  function resolve(tapped: string | null) {
    if (resolvedRef.current || !roundRef.current) return;
    resolvedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);

    const isCorrect = tapped === roundRef.current.target.word;

    if (isCorrect) {
      playCorrect();
      correctRef.current += 1;
      setCorrectCount(correctRef.current);
      setStreak((s) => s + 1);
      setOutcome("correct");
    } else {
      playWrong();
      livesRef.current -= 1;
      setLives(livesRef.current);
      setStreak(0);
      setOutcome(tapped === null ? "miss" : "wrong");
    }
    setTappedWord(tapped);
    setPhase("result");

    setTimeout(() => {
      const roundsPlayed = roundIndexRef.current + 1;
      if (livesRef.current <= 0 || roundsPlayed >= TOTAL_ROUNDS) {
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
      const res = await fetch("/api/games/word_catch/complete", {
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
    livesRef.current = LIVES_START;
    correctRef.current = 0;
    setLives(LIVES_START);
    setCorrectCount(0);
    setStreak(0);
    setResult(null);
    startRound(0);
  }

  const avatarMood = outcome === "correct" ? "happy" : outcome === "wrong" || outcome === "miss" ? "sad" : "neutral";

  if (phase === "ready") {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <Avatar3D equippedKeys={equippedKeys} size={130} mood="happy" />
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-dark">{t("game.wordCatch.name")}</h1>
          <p className="mt-1 text-sm text-ink/60">{t("game.wordCatch.instructions")}</p>
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
          {t("game.wordCatch.result", { correct: correctCount, total: finalRoundsPlayed })}
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
          <div className="flex gap-0.5">
            {Array.from({ length: LIVES_START }).map((_, i) => (
              <span key={i} className={i < lives ? "text-coral" : "text-ink/15"}>
                ♥
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 rounded-3xl bg-white/80 py-4 shadow-sm">
        <Avatar3D equippedKeys={equippedKeys} size={72} mood={avatarMood} />
        <div className="text-5xl">{round.target.emoji}</div>
        <p className="text-sm font-semibold text-ink/60">{t("games.whatIsThis")}</p>
      </div>

      <WordCatchScene3D
        roundKey={roundIndex}
        isPlaying={phase === "playing"}
        fallDurationMs={fallDurationFor(roundIndex)}
        onTap={(word) => resolve(word)}
        bubbles={round.bubbles.map((bubble) => {
          const isTapped = phase === "result" && tappedWord === bubble.word;
          const isTargetReveal = phase === "result" && bubble.word === round.target.word;
          let tint: BlockTint = "neutral";
          if (isTapped && outcome === "correct") tint = "correct";
          else if (isTapped && outcome === "wrong") tint = "wrong";
          else if (isTargetReveal && outcome === "miss") tint = "correct";
          return { word: bubble.word, tint };
        })}
      />

      <AnimatePresence>
        {phase === "result" && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center text-sm font-bold ${outcome === "correct" ? "text-teal" : "text-coral"}`}
          >
            {outcome === "correct" ? t("games.greatJob") : outcome === "miss" ? t("games.tooSlow") : t("games.notQuite")}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
