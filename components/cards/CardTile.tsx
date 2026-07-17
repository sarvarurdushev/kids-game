import { RARITY_COLOR_VAR, emojiForCharacter } from "@/lib/visuals";

interface CardTileProps {
  characterKey: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  owned?: boolean;
  quantity?: number;
  isNew?: boolean;
}

export function CardTile({
  characterKey,
  name,
  rarity,
  owned = true,
  quantity,
  isNew,
}: CardTileProps) {
  const color = RARITY_COLOR_VAR[rarity];
  return (
    <div
      className={`relative flex flex-col items-center gap-2 rounded-2xl border-4 p-3 text-center ${
        owned ? "bg-white" : "bg-ink/5 grayscale"
      }`}
      style={{ borderColor: color }}
    >
      {isNew && (
        <span className="absolute -top-2 -right-2 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold text-white shadow">
          NEW
        </span>
      )}
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full text-4xl"
        style={{ backgroundColor: owned ? `color-mix(in srgb, ${color} 20%, white)` : undefined }}
      >
        {owned ? emojiForCharacter(characterKey) : "🔒"}
      </div>
      <p className="font-display text-sm font-semibold">{owned ? name : "???"}</p>
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
    </div>
  );
}
