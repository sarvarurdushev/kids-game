"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CoinIcon } from "@/components/icons";
import { playCoin } from "@/lib/sound";

export function UnlockGameButton({ gameKey, coinCost, affordable }: { gameKey: string; coinCost: number; affordable: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/games/${gameKey}/unlock`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't unlock that game");
        return;
      }
      playCoin();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="secondary"
        onClick={handleUnlock}
        disabled={loading || !affordable}
        className="!px-4 !py-2 !text-sm whitespace-nowrap"
      >
        {loading ? (
          "..."
        ) : (
          <span className="flex items-center gap-1.5">
            <CoinIcon size={16} /> {coinCost}
          </span>
        )}
      </Button>
      {error && <p className="text-xs font-semibold text-coral">{error}</p>}
    </div>
  );
}
