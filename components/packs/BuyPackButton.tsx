"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function BuyPackButton({
  packTypeId,
  affordable,
}: {
  packTypeId: string;
  affordable: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/packs/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packTypeId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't buy that pack");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-1">
      <Button
        variant="secondary"
        onClick={handleBuy}
        disabled={loading || !affordable}
        className="w-full"
      >
        {loading ? "..." : affordable ? "Buy" : "Not enough coins"}
      </Button>
      {error && <p className="text-xs font-semibold text-coral">{error}</p>}
    </div>
  );
}
