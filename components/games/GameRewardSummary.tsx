"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChestIcon, CoinIcon, StarIcon } from "@/components/icons";
import { playChime } from "@/lib/sound";

export interface GameRewardResult {
  rewarded: boolean;
  xpAwarded: number;
  coinsAwarded: number;
  streakMultiplier: number;
  spinBonusCoins: number;
}

/** Shared post-round reward strip for the mini-game arcade (WordScramble,
 * WordCatch, MemoryMatch): XP/coins, a streak-multiplier callout, and a
 * "surprise chest" reveal for the small bonus roll — reused instead of each
 * game re-implementing its own version. */
export function GameRewardSummary({ result }: { result: GameRewardResult }) {
  const [chestOpen, setChestOpen] = useState(false);

  useEffect(() => {
    if (!result.rewarded || result.spinBonusCoins <= 0) return;
    const timer = setTimeout(() => {
      setChestOpen(true);
      playChime();
    }, 500);
    return () => clearTimeout(timer);
  }, [result.rewarded, result.spinBonusCoins]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-4 rounded-2xl bg-white/80 px-5 py-3 shadow-sm">
        <span className="flex items-center gap-1 font-bold text-gold-dark">
          <StarIcon size={18} /> +{result.xpAwarded} XP
        </span>
        <span className="flex items-center gap-1 font-bold text-gold-dark">
          <CoinIcon size={18} /> +{result.coinsAwarded}
        </span>
      </div>

      {result.rewarded && result.streakMultiplier > 1 && (
        <p className="text-xs font-bold text-coral">
          🔥 {Math.round((result.streakMultiplier - 1) * 100)}% streak bonus applied!
        </p>
      )}

      {result.rewarded && result.spinBonusCoins > 0 && (
        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            animate={chestOpen ? {} : { rotate: [0, -6, 6, -6, 6, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 0.5, repeat: chestOpen ? 0 : Infinity }}
          >
            <ChestIcon size={56} open={chestOpen} />
          </motion.div>
          <p className="text-xs font-bold text-ink/60">
            {chestOpen ? `Surprise chest: +${result.spinBonusCoins} coins!` : "Opening your bonus chest..."}
          </p>
        </motion.div>
      )}

      {!result.rewarded && (
        <p className="text-xs text-ink/50">Practice round — come back tomorrow for more rewarded rounds!</p>
      )}
    </div>
  );
}
