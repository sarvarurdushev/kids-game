"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardTile } from "./CardTile";
import { ItemPreviewModal } from "@/components/ui/ItemPreviewModal";
import { Button } from "@/components/ui/Button";
import { RARITY_COLOR_VAR } from "@/lib/visuals";
import { playCoin } from "@/lib/sound";
import type { Rarity } from "@/lib/reward-engine/types";
import { useTranslation } from "@/components/i18n/LanguageProvider";

interface CollectionCharacter {
  id: string;
  key: string;
  name: string;
  rarity: Rarity;
  imageUrl: string | null;
  owned: boolean;
  quantity: number;
  redeemCost: number;
}

// Subway-Surfers-style preview: tapping any card — owned or not — reveals a
// bigger view. The grid tile itself already shows the real art and name
// (dimmed when not yet owned) rather than hiding identity behind "???".
export function CollectionGrid({
  characters,
  cardShards,
}: {
  characters: CollectionCharacter[];
  cardShards: number;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [previewCharacter, setPreviewCharacter] = useState<CollectionCharacter | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function redeem(characterId: string) {
    setBusyId(characterId);
    setError(null);
    try {
      const res = await fetch("/api/collection/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? t("collection.redeemError"));
        return;
      }
      playCoin();
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      {error && <p className="text-center text-sm font-semibold text-coral">{error}</p>}

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {characters.map((c) => (
          <button key={c.id} type="button" onClick={() => setPreviewCharacter(c)} className="text-left">
            <CardTile
              emoji={c.imageUrl ?? "❔"}
              name={c.name}
              rarity={c.rarity}
              owned={c.owned}
              quantity={c.quantity}
              redeemCost={c.owned ? undefined : c.redeemCost}
            />
          </button>
        ))}
      </div>

      <ItemPreviewModal
        open={previewCharacter !== null}
        onClose={() => setPreviewCharacter(null)}
        name={previewCharacter?.name ?? ""}
        rarity={previewCharacter?.rarity}
        reason={previewCharacter && !previewCharacter.owned ? t("collection.openPacksHint") : null}
        preview={
          previewCharacter && (
            <div
              className="flex h-40 w-40 items-center justify-center rounded-full text-8xl sm:h-56 sm:w-56 sm:text-9xl"
              style={{ backgroundColor: `color-mix(in srgb, ${RARITY_COLOR_VAR[previewCharacter.rarity]} 16%, white)` }}
            >
              {previewCharacter.imageUrl ?? "❔"}
            </div>
          )
        }
        action={
          previewCharacter && !previewCharacter.owned ? (
            <Button
              variant="secondary"
              className="!flex !items-center !gap-1"
              onClick={() => {
                void redeem(previewCharacter.id);
                setPreviewCharacter(null);
              }}
              disabled={busyId === previewCharacter.id || cardShards < previewCharacter.redeemCost}
            >
              {cardShards < previewCharacter.redeemCost
                ? t("collection.needMoreShards", { count: previewCharacter.redeemCost - cardShards })
                : t("collection.redeemForShards", { count: previewCharacter.redeemCost })}
            </Button>
          ) : null
        }
      />
    </>
  );
}
