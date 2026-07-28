"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { RoomScene3D } from "@/components/three/RoomScene3D";
import type { AvatarEquippedKeys, AvatarMood } from "@/components/avatar/AvatarCharacter";
import { playCoin, playGiggle } from "@/lib/sound";

const REACTIONS = [
  "Hehe, that tickles!",
  "Wheee!",
  "You found me!",
  "Giggle giggle!",
  "Again, again!",
  "Hi there!",
];

const FEED_REACTIONS = ["Yum yum!", "Delicious!", "More please!", "Tasty!"];

const REACTION_MS = 1400;
const FEED_COST = 15;

interface PokeableRoomProps {
  equippedKeys: AvatarEquippedKeys;
  /** The pet's resting mood between pokes, derived from its persisted care
   * level (lib/reward-engine/pet.ts) — a neglected pet looks a little
   * droopy by default, not just during the poke reaction. */
  baseMood?: AvatarMood;
  happiness?: number;
  coinsBalance?: number;
}

export function PokeableRoom({ equippedKeys, baseMood = "neutral", happiness, coinsBalance = 0 }: PokeableRoomProps) {
  const router = useRouter();
  const [mood, setMood] = useState<AvatarMood>(baseMood);
  const [message, setMessage] = useState<string | null>(null);
  const [feedBusy, setFeedBusy] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const lockRef = useRef(false);

  // baseMood can change after a poke's own router.refresh() lands (fresh
  // happiness from the server) — pick that up whenever we're not mid-poke.
  useEffect(() => {
    if (!lockRef.current) setMood(baseMood);
  }, [baseMood]);

  // Shared happy-mood + message flourish for both the free poke and the paid
  // feed — same visual reaction, different trigger.
  function flourish(text: string) {
    lockRef.current = true;
    setMood("happy");
    setMessage(text);
    setTimeout(() => {
      setMood(baseMood);
      setMessage(null);
      lockRef.current = false;
    }, REACTION_MS);
  }

  function poke() {
    if (lockRef.current) return;
    playGiggle();
    flourish(REACTIONS[Math.floor(Math.random() * REACTIONS.length)]);
    // A poke doubles as "petting" the animal — the same tap that plays the
    // giggle reaction also feeds the care loop, so there's no separate
    // "feed" button to teach. Fire-and-forget: the visual reaction doesn't
    // wait on it, router.refresh() just needs to happen before the next
    // server render picks up the new happiness/mood.
    fetch("/api/pet/interact", { method: "POST" }).then(() => router.refresh());
  }

  async function feed() {
    if (lockRef.current || feedBusy) return;
    setFeedBusy(true);
    setFeedError(null);
    try {
      const res = await fetch("/api/pet/feed", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFeedError(data.error ?? "Couldn't feed your pet");
        return;
      }
      playCoin();
      flourish(FEED_REACTIONS[Math.floor(Math.random() * FEED_REACTIONS.length)]);
      router.refresh();
    } finally {
      setFeedBusy(false);
    }
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
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            {happiness !== undefined && (
              <span className="flex items-center gap-1 text-xs font-semibold text-ink/50">
                <span aria-hidden>❤️</span> {happiness}% happy — tap to play!
              </span>
            )}
            {(happiness ?? 0) < 100 && (
              <button
                type="button"
                onClick={feed}
                disabled={feedBusy || coinsBalance < FEED_COST || (happiness ?? 0) >= 100}
                className="rounded-full bg-teal px-2 py-0.5 text-[11px] font-bold text-white shadow-sm disabled:opacity-40"
              >
                🍎 Feed ({FEED_COST})
              </button>
            )}
          </div>
          {feedError && <p className="text-[11px] font-semibold text-coral">{feedError}</p>}
        </div>
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
