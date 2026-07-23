"use client";

import { useState } from "react";
import { CardTile } from "./CardTile";
import { ItemPreviewModal } from "@/components/ui/ItemPreviewModal";
import { RARITY_COLOR_VAR } from "@/lib/visuals";
import type { Rarity } from "@/lib/reward-engine/types";

interface CollectionCharacter {
  id: string;
  key: string;
  name: string;
  rarity: Rarity;
  imageUrl: string | null;
  owned: boolean;
  quantity: number;
}

// Subway-Surfers-style preview: tapping any card — owned or not — reveals a
// bigger view. The grid tile itself already shows the real art and name
// (dimmed when not yet owned) rather than hiding identity behind "???".
export function CollectionGrid({ characters }: { characters: CollectionCharacter[] }) {
  const [previewCharacter, setPreviewCharacter] = useState<CollectionCharacter | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {characters.map((c) => (
          <button key={c.id} type="button" onClick={() => setPreviewCharacter(c)} className="text-left">
            <CardTile emoji={c.imageUrl ?? "❔"} name={c.name} rarity={c.rarity} owned={c.owned} quantity={c.quantity} />
          </button>
        ))}
      </div>

      <ItemPreviewModal
        open={previewCharacter !== null}
        onClose={() => setPreviewCharacter(null)}
        name={previewCharacter?.name ?? ""}
        rarity={previewCharacter?.rarity}
        reason={previewCharacter && !previewCharacter.owned ? "Open packs to collect this card!" : null}
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
      />
    </>
  );
}
