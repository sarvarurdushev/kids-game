"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CoinIcon } from "@/components/icons";
import { playCoin } from "@/lib/sound";

export interface QuestListItem {
  key: string;
  label: string;
  emoji: string;
  target: number;
  progress: number;
  complete: boolean;
  claimed: boolean;
  rewardCoins: number;
  rewardGoldStars: number;
}

function QuestRow({
  quest,
  busy,
  onClaim,
}: {
  quest: QuestListItem;
  busy: boolean;
  onClaim: (key: string) => void;
}) {
  return (
    <Card className={`flex items-center gap-3 !p-4 ${quest.claimed ? "opacity-60" : ""}`}>
      <span className="text-3xl" aria-hidden>
        {quest.emoji}
      </span>
      <div className="flex-1">
        <p className="font-display font-semibold">{quest.label}</p>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex-1">
            <ProgressBar value={quest.progress} max={quest.target} />
          </div>
          <span className="text-xs font-bold text-ink/50">
            {quest.progress}/{quest.target}
          </span>
        </div>
        <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-ink/50">
          <span className="flex items-center gap-1">
            <CoinIcon size={13} /> {quest.rewardCoins}
          </span>
          {quest.rewardGoldStars > 0 && <span>⭐ {quest.rewardGoldStars}</span>}
        </p>
      </div>
      {quest.claimed ? (
        <span className="shrink-0 text-xs font-bold text-gold-dark">Claimed ✓</span>
      ) : quest.complete ? (
        <Button
          variant="secondary"
          className="!shrink-0 !px-4 !py-2 !text-sm animate-pulse ring-2 ring-gold"
          onClick={() => onClaim(quest.key)}
          disabled={busy}
        >
          Claim!
        </Button>
      ) : null}
    </Card>
  );
}

export function QuestList({ daily, weekly }: { daily: QuestListItem[]; weekly: QuestListItem[] }) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function claim(questKey: string) {
    setBusyKey(questKey);
    setError(null);
    try {
      const res = await fetch("/api/quests/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questKey }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't claim that yet");
        return;
      }
      playCoin();
      router.refresh();
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {error && <p className="text-center text-sm font-semibold text-coral">{error}</p>}

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-semibold">Today</h2>
        {daily.map((q) => (
          <QuestRow key={q.key} quest={q} busy={busyKey === q.key} onClaim={claim} />
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-lg font-semibold">This week</h2>
        {weekly.map((q) => (
          <QuestRow key={q.key} quest={q} busy={busyKey === q.key} onClaim={claim} />
        ))}
      </section>
    </div>
  );
}
