"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { CardTile } from "@/components/cards/CardTile";
import { Button } from "@/components/ui/Button";

interface RevealedCard {
  characterId: string;
  characterKey: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  isNew: boolean;
}

type Phase = "loading" | "shaking" | "revealing" | "error";

export function PackOpenFlow({ grantId }: { grantId: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [cards, setCards] = useState<RevealedCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function open() {
      try {
        const res = await fetch(`/api/packs/${grantId}/open`, { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "That pack couldn't be opened");
          setPhase("error");
          return;
        }
        setCards(data.cards);
        setPhase("shaking");
        setTimeout(() => {
          if (!cancelled) setPhase("revealing");
        }, 900);
      } catch {
        if (!cancelled) {
          setError("Something went wrong. Try again!");
          setPhase("error");
        }
      }
    }

    open();
    return () => {
      cancelled = true;
    };
  }, [grantId]);

  useEffect(() => {
    if (phase !== "revealing" || revealedCount >= cards.length) return;
    const timer = setTimeout(() => setRevealedCount((c) => c + 1), 500);
    return () => clearTimeout(timer);
  }, [phase, revealedCount, cards.length]);

  const allRevealed = phase === "revealing" && revealedCount >= cards.length;

  if (phase === "loading") {
    return <p className="text-center font-display text-lg">Getting your pack ready...</p>;
  }

  if (phase === "error") {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-center font-semibold text-coral">{error}</p>
        <Link href="/packs">
          <Button variant="ghost">Back to packs</Button>
        </Link>
      </div>
    );
  }

  if (phase === "shaking") {
    return (
      <div className="flex flex-col items-center gap-4">
        <motion.span
          className="text-8xl"
          animate={{ rotate: [0, -8, 8, -8, 8, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          🎁
        </motion.span>
        <p className="font-display text-lg">Opening...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="grid grid-cols-3 gap-3">
        <AnimatePresence>
          {cards.slice(0, revealedCount).map((card, i) => (
            <motion.div
              key={card.characterId + i}
              initial={{ scale: 0, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <CardTile
                characterKey={card.characterKey}
                name={card.name}
                rarity={card.rarity}
                isNew={card.isNew}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {allRevealed && (
        <Link href="/packs">
          <Button>Back to packs</Button>
        </Link>
      )}
    </div>
  );
}
