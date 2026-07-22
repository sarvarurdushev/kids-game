"use client";

import { useState } from "react";
import { CardTile } from "./CardTile";
import { CreatureArt } from "@/components/creatures/CreatureArt";
import { ItemPreviewModal } from "@/components/ui/ItemPreviewModal";
import { RARITY_COLOR_VAR } from "@/lib/visuals";
import type { Rarity } from "@/lib/reward-engine/types";

interface CollectionCharacter {
  id: string;
  key: string;
  name: string;
  rarity: Rarity;
  owned: boolean;
  quantity: number;
}

// Subway-Surfers-style preview: tapping any card — owned or not — reveals its
// real art and name in a modal, even though the grid tile itself still shows
// the "???" mystery-card look for anything not yet collected.
export function CollectionGrid({ characters }: { characters: CollectionCharacter[] }) {
  const [previewCharacter, setPreviewCharacter] = useState<CollectionCharacter | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {characters.map((c) => (
          <button key={c.id} type="button" onClick={() => setPreviewCharacter(c)} className="text-left">
            <CardTile characterKey={c.key} name={c.name} rarity={c.rarity} owned={c.owned} quantity={c.quantity} />
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
              className="flex h-36 w-36 items-center justify-center rounded-full"
              style={{ backgroundColor: `color-mix(in srgb, ${RARITY_COLOR_VAR[previewCharacter.rarity]} 16%, white)` }}
            >
              <CreatureArt characterKey={previewCharacter.key} rarity={previewCharacter.rarity} size={120} />
            </div>
          )
        }
      />
    </>
  );
}
