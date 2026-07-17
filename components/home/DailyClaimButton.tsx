"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfettiOverlay } from "@/components/feedback/ConfettiOverlay";

interface DailyClaimButtonProps {
  claimedToday: boolean;
  nextReward: { xpReward: number; coinReward: number; packTypeId: string | null } | null;
}

export function DailyClaimButton({ claimedToday, nextReward }: DailyClaimButtonProps) {
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [result, setResult] = useState<{ xpAwarded: number; coinsAwarded: number } | null>(null);

  async function handleClaim() {
    setClaiming(true);
    try {
      const res = await fetch("/api/daily-claim/claim", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResult({ xpAwarded: data.xpAwarded, coinsAwarded: data.coinsAwarded });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1800);
        router.refresh();
      }
    } finally {
      setClaiming(false);
    }
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
      <ConfettiOverlay show={showConfetti} />
      <Button onClick={handleClaim} disabled={claiming} className="w-full">
        {claiming
          ? "Opening..."
          : `🎁 Claim today's reward${nextReward ? ` (+${nextReward.xpReward} XP)` : ""}`}
      </Button>
      {result && (
        <p className="mt-2 text-center text-sm font-semibold text-teal">
          +{result.xpAwarded} XP, +{result.coinsAwarded} coins!
        </p>
      )}
    </>
  );
}
