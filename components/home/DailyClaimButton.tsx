"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfettiOverlay } from "@/components/feedback/ConfettiOverlay";

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
  const [claiming, setClaiming] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [result, setResult] = useState<{ xpAwarded: number; coinsAwarded: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClaim() {
    setClaiming(true);
    setError(null);
    try {
      const res = await fetch("/api/daily-claim/claim", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Couldn't claim right now — try again!");
        return;
      }
      setResult({ xpAwarded: data.xpAwarded, coinsAwarded: data.coinsAwarded });
      setCelebrating(true);
      router.refresh();
      setTimeout(() => setCelebrating(false), CELEBRATION_MS);
    } finally {
      setClaiming(false);
    }
  }

  if (celebrating && result) {
    return (
      <>
        <ConfettiOverlay show />
        <div className="gk-pop-in rounded-2xl bg-gold p-5 text-center shadow-md">
          <p className="font-display text-lg font-bold text-ink">🎉 Nice work!</p>
          <p className="font-semibold text-ink/80">
            +{result.xpAwarded} XP, +{result.coinsAwarded} coins!
          </p>
        </div>
      </>
    );
  }

  if (claimedToday) {
    return (
      <div className="rounded-2xl bg-white/70 p-4 text-center font-display font-semibold text-ink/50">
        See you tomorrow for another reward!
      </div>
    );
  }

  return (
    <>
      {error && <p className="mb-2 text-center text-sm font-semibold text-coral">{error}</p>}
      <Button onClick={handleClaim} disabled={claiming} className="w-full">
        {claiming
          ? "Opening..."
          : `🎁 Claim today's reward${nextReward ? ` (+${nextReward.xpReward} XP)` : ""}`}
      </Button>
    </>
  );
}
