"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { RoomScene } from "./RoomScene";
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

export function PokeableRoom({ equippedKeys }: { equippedKeys: AvatarEquippedKeys }) {
  const [mood, setMood] = useState<AvatarMood>("neutral");
  const [message, setMessage] = useState<string | null>(null);
  const lockRef = useRef(false);

  function poke() {
    if (lockRef.current) return;
    lockRef.current = true;
    playGiggle();
    setMood("happy");
    setMessage(REACTIONS[Math.floor(Math.random() * REACTIONS.length)]);
    setTimeout(() => {
      setMood("neutral");
      setMessage(null);
      lockRef.current = false;
    }, REACTION_MS);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <RoomScene equippedKeys={equippedKeys} mood={mood} onTapAvatar={poke} animated />
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
      <Link
        href="/room"
        className="self-end text-xs font-semibold text-teal underline-offset-2 hover:underline"
      >
        Decorate room →
      </Link>
    </div>
  );
}
