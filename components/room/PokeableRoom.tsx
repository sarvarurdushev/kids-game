"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { RoomScene3D } from "@/components/three/RoomScene3D";
import type { AvatarEquippedKeys, AvatarMood } from "@/components/avatar/AvatarCharacter";
import { playGiggle } from "@/lib/sound";

const REACTIONS = [
  "Hehe, that tickles!",
  "Wheee!",
  "You found me!",
  "Giggle giggle!",
  "Again, again!",
  "Hi there!",
];

const REACTION_MS = 1400;

interface PokeableRoomProps {
  equippedKeys: AvatarEquippedKeys;
  /** The pet's resting mood between pokes, derived from its persisted care
   * level (lib/reward-engine/pet.ts) — a neglected pet looks a little
   * droopy by default, not just during the poke reaction. */
  baseMood?: AvatarMood;
  happiness?: number;
}

export function PokeableRoom({ equippedKeys, baseMood = "neutral", happiness }: PokeableRoomProps) {
  const router = useRouter();
  const [mood, setMood] = useState<AvatarMood>(baseMood);
  const [message, setMessage] = useState<string | null>(null);
  const lockRef = useRef(false);

  // baseMood can change after a poke's own router.refresh() lands (fresh
  // happiness from the server) — pick that up whenever we're not mid-poke.
  useEffect(() => {
    if (!lockRef.current) setMood(baseMood);
  }, [baseMood]);

  function poke() {
    if (lockRef.current) return;
    lockRef.current = true;
    playGiggle();
    setMood("happy");
    setMessage(REACTIONS[Math.floor(Math.random() * REACTIONS.length)]);
    // A poke doubles as "petting" the animal — the same tap that plays the
    // giggle reaction also feeds the care loop, so there's no separate
    // "feed" button to teach. Fire-and-forget: the visual reaction doesn't
    // wait on it, router.refresh() just needs to happen before the next
    // server render picks up the new happiness/mood.
    fetch("/api/pet/interact", { method: "POST" }).then(() => router.refresh());
    setTimeout(() => {
      setMood(baseMood);
      setMessage(null);
      lockRef.current = false;
    }, REACTION_MS);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <RoomScene3D equippedKeys={equippedKeys} mood={mood} onTapAvatar={poke} />
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.8 }}
              className="absolute top-3 left-1/2 -translate-x-1/2 rounded-2xl bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-md"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between">
        {happiness !== undefined && (
          <span className="flex items-center gap-1 text-xs font-semibold text-ink/50">
            <span aria-hidden>❤️</span> {happiness}% happy — tap to play!
          </span>
        )}
        <Link
          href="/room"
          className="self-end text-xs font-semibold text-teal underline-offset-2 hover:underline"
        >
          Decorate room →
        </Link>
      </div>
    </div>
  );
}
