"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { WordEntry } from "@/lib/games/wordBank";
import { useTranslation } from "@/components/i18n/LanguageProvider";

type Phase = "prompt" | "revealed" | "complete";

/** Flashcard review flow over the due-words queue handed down from the
 * server component. No scoring/XP/coins here — this only feeds the
 * word_reviews log that quests read from; the Leitner box math itself lives
 * server-side in lib/student/wordBook.ts. */
export function WordBookReview({ queue, dueCount }: { queue: WordEntry[]; dueCount: number }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("prompt");
  const [reviewedCount, setReviewedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (queue.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="text-4xl" aria-hidden>
          🎉
        </span>
        <p className="font-display text-lg font-bold">{t("wordbook.allCaughtUp")}</p>
        <p className="text-sm text-ink/60">{t("wordbook.comeBackLater")}</p>
      </Card>
    );
  }

  if (phase === "complete") {
    return (
      <div className="flex flex-col gap-3">
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="text-4xl" aria-hidden>
            🌟
          </span>
          <p className="font-display text-lg font-bold">{t("wordbook.reviewedCount", { count: reviewedCount })}</p>
          <Link href="/word-book" className="text-sm font-semibold text-teal underline-offset-2 hover:underline">
            {t("wordbook.backToWordBook")}
          </Link>
        </Card>
        {error && <p className="text-center text-sm font-semibold text-coral">{error}</p>}
      </div>
    );
  }

  const word = queue[index];

  // Fired without awaiting (nothing in this flow depends on a
  // router.refresh() the way RoomCustomizer's purchases do), but a failure
  // still surfaces as a visible inline error instead of being swallowed —
  // the card advances either way, it just doesn't hide that the review may
  // not have been saved.
  function submitReview(knewIt: boolean) {
    setError(null);
    fetch("/api/word-book/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: word.word, knewIt }),
    })
      .then((res) => {
        if (!res.ok) setError(t("wordbook.saveError"));
      })
      .catch(() => setError(t("wordbook.saveError")));

    setReviewedCount((c) => c + 1);
    if (index + 1 >= queue.length) {
      setPhase("complete");
    } else {
      setIndex((i) => i + 1);
      setPhase("prompt");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-xs font-bold text-ink/40">
        {index + 1} / {queue.length}
        {dueCount > queue.length ? ` · ${t("wordbook.dueInTotal", { count: dueCount })}` : ""}
      </p>

      <Card className="flex flex-col items-center gap-5 py-10 text-center">
        <span className="text-7xl" aria-hidden>
          {word.emoji}
        </span>
        {phase === "prompt" ? (
          <Button onClick={() => setPhase("revealed")}>{t("wordbook.reveal")}</Button>
        ) : (
          <>
            <p className="font-display text-2xl font-bold capitalize text-ink">{word.word}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="ghost" onClick={() => submitReview(false)}>
                {t("wordbook.stillLearning")}
              </Button>
              <Button variant="secondary" onClick={() => submitReview(true)}>
                {t("wordbook.iKnewIt")}
              </Button>
            </div>
          </>
        )}
      </Card>

      {error && <p className="text-center text-sm font-semibold text-coral">{error}</p>}
    </div>
  );
}
