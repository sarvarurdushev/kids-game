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
  /** Shards a duplicate pull of this card just awarded — pack-reveal only,
   * mutually exclusive with `isNew` (a card is either new or a duplicate). */
  shardsAwarded?: number;
  /** Shard cost to redeem this still-missing card directly — collection-grid
   * only, mutually exclusive with the owned quantity badge. */
  redeemCost?: number;
}

export function CardTile({
  emoji,
  name,
  rarity,
  owned = true,
  quantity,
  isNew,
  shardsAwarded,
  redeemCost,
}: CardTileProps) {
  const color = RARITY_COLOR_VAR[rarity];

  return (
    <CardFrame rarity={rarity} dimmed={!owned} className="flex flex-col items-center gap-1.5 p-3 pt-4">
      {isNew && (
        <span className="absolute -top-1 -right-2 z-10 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold text-white shadow">
          NEW
        </span>
      )}
      {!isNew && shardsAwarded !== undefined && shardsAwarded > 0 && (
        <span className="absolute -top-1 -right-2 z-10 rounded-full bg-teal px-2 py-0.5 text-[10px] font-bold text-white shadow">
          ✨+{shardsAwarded}
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
      {!owned && redeemCost !== undefined && (
        <span className="absolute -right-2 -bottom-2 rounded-full bg-teal px-2 py-0.5 text-xs font-bold text-white">
          ✨{redeemCost}
        </span>
      )}
    </CardFrame>
  );
}
