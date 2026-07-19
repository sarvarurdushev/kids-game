"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { CardFrame } from "@/components/cards/CardFrame";
import { AvatarRenderer } from "@/components/avatar/AvatarRenderer";
import { Button } from "@/components/ui/Button";
import { ChestIcon } from "@/components/icons";
import { Sparx } from "@/components/mascot/Sparx";
import { playCardFlip, playFanfare, playWhoosh } from "@/lib/sound";
import { RARITY_COLOR_VAR } from "@/lib/visuals";
import type { Rarity } from "@/lib/reward-engine/types";

interface RevealedItem {
  key: string;
  name: string;
  rarity: Rarity;
  isNew: boolean;
  bundledItems: { key: string; slot: string; name: string }[];
}

type Phase = "loading" | "shaking" | "burst" | "revealed" | "error";

export function CharacterCaseOpenFlow({ grantId }: { grantId: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [item, setItem] = useState<RevealedItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Same non-idempotent-mutation guard as PackOpenFlow: this must fire
  // exactly once per grantId, surviving React Strict Mode's dev-only
  // mount/cleanup/remount without either double-POSTing or getting stuck
  // loading forever.
  const requestedGrantIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (requestedGrantIdRef.current === grantId) return;
    requestedGrantIdRef.current = grantId;

    async function open() {
      try {
        const res = await fetch(`/api/avatar-cases/${grantId}/open`, { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "That case couldn't be opened");
          setPhase("error");
          return;
        }
        setItem(data.item);
        setPhase("shaking");
        setTimeout(() => {
          setPhase("burst");
          playWhoosh();
        }, 1100);
        setTimeout(() => {
          setPhase("revealed");
          playCardFlip();
        }, 1500);
      } catch {
        setError("Something went wrong. Try again!");
        setPhase("error");
      }
    }

    open();
  }, [grantId]);

  const showMascotCheer = phase === "revealed" && item && (item.rarity === "epic" || item.rarity === "legendary");
  const hasPlayedFanfareRef = useRef(false);

  useEffect(() => {
    if (showMascotCheer && !hasPlayedFanfareRef.current) {
      hasPlayedFanfareRef.current = true;
      playFanfare();
    }
  }, [showMascotCheer]);

  if (phase === "loading") {
    return <p className="text-center font-display text-lg">Getting your case ready...</p>;
  }

  if (phase === "error") {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-center font-semibold text-coral">{error}</p>
        <Link href="/cases">
          <Button variant="ghost">Back to cases</Button>
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
          <ChestIcon size={140} open={phase === "burst"} />
        </motion.div>
        {phase === "shaking" && <p className="font-display text-lg">Opening...</p>}
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        initial={{ scale: 0, rotate: -15, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <CardFrame rarity={item.rarity} className="relative flex flex-col items-center gap-2 p-5 pt-6">
          {item.isNew && (
            <span className="absolute -top-1 -right-2 z-10 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold text-white shadow">
              NEW
            </span>
          )}
          <AvatarRenderer
            equippedKeys={{
              species: item.key,
              ...Object.fromEntries(item.bundledItems.map((b) => [b.slot, b.key])),
            }}
            size={120}
          />
          <p className="font-display text-lg font-semibold">{item.name}</p>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase"
            style={{ backgroundColor: RARITY_COLOR_VAR[item.rarity] }}
          >
            {item.rarity}
          </span>
          {item.bundledItems.length > 0 && (
            <p className="text-center text-xs font-semibold text-ink/60">
              Comes with {item.bundledItems.map((b) => b.name).join(", ")}!
            </p>
          )}
        </CardFrame>
      </motion.div>

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

      <div className="flex gap-3">
        <Link href="/avatar">
          <Button>Wear it</Button>
        </Link>
        <Link href="/cases">
          <Button variant="ghost">Back to cases</Button>
        </Link>
      </div>
    </div>
  );
}
