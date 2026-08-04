"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChestIcon, CoinIcon } from "@/components/icons";
import { Sparx } from "@/components/mascot/Sparx";
import { ConfettiOverlay } from "@/components/feedback/ConfettiOverlay";
import { playChime } from "@/lib/sound";
import { useTranslation } from "@/components/i18n/LanguageProvider";

interface DailyClaimButtonProps {
  claimedToday: boolean;
  nextReward: { xpReward: number; coinReward: number; packTypeId: string | null } | null;
}

// How long the celebration stays on screen regardless of how fast the
// server round-trip and subsequent router.refresh() land — without this,
// a fast refresh flips `claimedToday` to true before the child ever sees
// the reward they just earned.
const CELEBRATION_MS = 2600;

export function DailyClaimButton({ claimedToday, nextReward }: DailyClaimButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [claiming, setClaiming] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [result, setResult] = useState<{ xpAwarded: number; coinsAwarded: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClaim() {
    if (claiming) return;
    setClaiming(true);
    setError(null);
    try {
      const res = await fetch("/api/daily-claim/claim", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? t("home.claimError"));
        return;
      }
      setResult({ xpAwarded: data.xpAwarded, coinsAwarded: data.coinsAwarded });
      setCelebrating(true);
      playChime();
      router.refresh();
      setTimeout(() => setCelebrating(false), CELEBRATION_MS);
    } finally {
      setClaiming(false);
    }
  }

  if (celebrating && result) {
    return (
      <div className="gk-pop-in relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gold p-5 shadow-md">
        <ConfettiOverlay show />
        <ChestIcon size={72} open />
        <div className="flex-1">
          <p className="font-display text-lg font-bold text-ink">{t("games.niceWork")}</p>
          <p className="flex items-center gap-1 font-semibold text-ink/80">
            +{result.xpAwarded} XP, +{result.coinsAwarded} <CoinIcon size={16} />
          </p>
        </div>
        <Sparx expression="cheer" bounce size={64} />
      </div>
    );
  }

  if (claimedToday) {
    return (
      <div className="flex items-center gap-4 rounded-3xl bg-white/70 p-5">
        <ChestIcon size={64} className="opacity-40 grayscale" />
        <p className="font-display font-semibold text-ink/50">{t("home.seeYouTomorrow")}</p>
      </div>
    );
  }

  return (
    <div>
      {error && <p className="mb-2 text-center text-sm font-semibold text-coral">{error}</p>}
      <button
        type="button"
        onClick={handleClaim}
        disabled={claiming}
        className="flex w-full items-center gap-4 rounded-3xl bg-gradient-to-br from-gold to-gold-dark p-5 text-left shadow-lg shadow-gold/30 transition-transform active:scale-[0.96] disabled:opacity-70"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChestIcon size={64} />
        </motion.div>
        <div className="flex-1">
          <p className="font-display text-lg font-bold text-ink">
            {claiming ? t("packs.opening") : t("home.claimTodayReward")}
          </p>
          {nextReward && !claiming && (
            <p className="text-sm font-semibold text-ink/70">
              {t("home.rewardLine", { xp: nextReward.xpReward, coins: nextReward.coinReward })}
              {nextReward.packTypeId ? t("home.freePackSuffix") : ""}
            </p>
          )}
        </div>
      </button>
    </div>
  );
}
