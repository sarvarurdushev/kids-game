"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { CardTile } from "@/components/cards/CardTile";
import { Button } from "@/components/ui/Button";
import { BoosterPackIcon } from "@/components/icons";
import { Sparx } from "@/components/mascot/Sparx";
import { playCardFlip, playFanfare, playWhoosh } from "@/lib/sound";
import type { Rarity } from "@/lib/reward-engine/types";

interface RevealedCard {
  characterId: string;
  characterKey: string;
  name: string;
  rarity: Rarity;
  imageUrl: string | null;
  isNew: boolean;
  shardsAwarded: number;
}

type Phase = "loading" | "shaking" | "burst" | "revealing" | "error";

const BEST_RARITY_RANK: Record<Rarity, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };

export function PackOpenFlow({ grantId }: { grantId: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [cards, setCards] = useState<RevealedCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Opening a pack is a real, non-idempotent mutation, not a cancellable
  // fetch-for-display, so it must fire exactly once per grantId — no more
  // (a duplicate POST) and no less (a `cancelled` flag that outlives React
  // Strict Mode's dev-only mount/cleanup/remount cycle would discard the
  // first, successful response and leave the UI stuck loading forever).
  // Tracking the grantId itself survives that cycle while still allowing a
  // genuinely new grantId (a different pack opened in the same mounted
  // route) to fire its own request.
  const requestedGrantIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (requestedGrantIdRef.current === grantId) return;
    requestedGrantIdRef.current = grantId;

    async function open() {
      try {
        const res = await fetch(`/api/packs/${grantId}/open`, { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "That pack couldn't be opened");
          setPhase("error");
          return;
        }
        setCards(data.cards);
        setPhase("shaking");
        setTimeout(() => {
          setPhase("burst");
          playWhoosh();
        }, 1100);
        setTimeout(() => {
          setPhase("revealing");
        }, 1500);
      } catch {
        setError("Something went wrong. Try again!");
        setPhase("error");
      }
    }

    open();
  }, [grantId]);

  useEffect(() => {
    if (phase !== "revealing" || revealedCount >= cards.length) return;
    const timer = setTimeout(() => {
      setRevealedCount((c) => c + 1);
      playCardFlip();
    }, 550);
    return () => clearTimeout(timer);
  }, [phase, revealedCount, cards.length]);

  const allRevealed = phase === "revealing" && revealedCount >= cards.length;
  const bestRarity = cards.reduce<Rarity>(
    (best, c) => (BEST_RARITY_RANK[c.rarity] > BEST_RARITY_RANK[best] ? c.rarity : best),
    "common"
  );
  const showMascotCheer = allRevealed && (bestRarity === "epic" || bestRarity === "legendary");
  const hasPlayedFanfareRef = useRef(false);

  useEffect(() => {
    if (showMascotCheer && !hasPlayedFanfareRef.current) {
      hasPlayedFanfareRef.current = true;
      playFanfare();
    }
  }, [showMascotCheer]);

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

  if (phase === "shaking" || phase === "burst") {
    return (
      <div className="relative flex flex-col items-center gap-4">
        {phase === "burst" && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full bg-gold"
            initial={{ opacity: 0.9, scale: 0.2 }}
            animate={{ opacity: 0, scale: 4 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}
        <motion.div
          animate={
            phase === "shaking"
              ? { rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.04, 1] }
              : { scale: [1, 1.4, 0], opacity: [1, 1, 0] }
          }
          transition={
            phase === "shaking"
              ? { duration: 0.55, repeat: Infinity }
              : { duration: 0.45, ease: "easeIn" }
          }
        >
          <BoosterPackIcon size={140} />
        </motion.div>
        {phase === "shaking" && <p className="font-display text-lg">Opening...</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <AnimatePresence>
          {cards.slice(0, revealedCount).map((card, i) => (
            <motion.div
              key={card.characterId + i}
              initial={{ scale: 0, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <CardTile
                emoji={card.imageUrl ?? "❔"}
                name={card.name}
                rarity={card.rarity}
                isNew={card.isNew}
                shardsAwarded={card.shardsAwarded}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {showMascotCheer && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="flex flex-col items-center gap-1"
        >
          <Sparx expression="cheer" bounce size={72} />
          <p className="font-display text-sm font-bold text-gold-dark">Amazing pull!</p>
        </motion.div>
      )}

      {allRevealed && (
        <Link href="/packs">
          <Button>Back to packs</Button>
        </Link>
      )}
    </div>
  );
}
