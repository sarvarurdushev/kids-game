import { RARITY_COLOR_VAR } from "@/lib/visuals";
import { CardFrame } from "./CardFrame";
import type { Rarity } from "@/lib/reward-engine/types";

interface CardTileProps {
  emoji: string;
  name: string;
  rarity: Rarity;
  owned?: boolean;
  quantity?: number;
  isNew?: boolean;
}

export function CardTile({
  emoji,
  name,
  rarity,
  owned = true,
  quantity,
  isNew,
}: CardTileProps) {
  const color = RARITY_COLOR_VAR[rarity];

  return (
    <CardFrame rarity={rarity} dimmed={!owned} className="flex flex-col items-center gap-1.5 p-3 pt-4">
      {isNew && (
        <span className="absolute -top-1 -right-2 z-10 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold text-white shadow">
          NEW
        </span>
      )}
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full text-4xl sm:h-24 sm:w-24 sm:text-5xl"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 16%, white)` }}
      >
        {emoji}
      </div>
      <p className="font-display text-sm font-semibold">{name}</p>
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase"
        style={{ backgroundColor: color }}
      >
        {rarity}
      </span>
      {quantity !== undefined && quantity > 1 && (
        <span className="absolute -right-2 -bottom-2 rounded-full bg-ink px-2 py-0.5 text-xs font-bold text-white">
          x{quantity}
        </span>
      )}
    </CardFrame>
  );
}
