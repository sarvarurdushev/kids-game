"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarRenderer } from "./AvatarRenderer";
import { Avatar3D } from "@/components/three/Avatar3D";
import { Button } from "@/components/ui/Button";
import { ItemPreviewModal } from "@/components/ui/ItemPreviewModal";
import { playCoin, playPop } from "@/lib/sound";
import { CoinIcon } from "@/components/icons";

type Slot = "species" | "hair" | "eyes" | "clothes" | "hat" | "accessory" | "background";

export interface AvatarItem {
  id: string;
  slot: Slot;
  key: string;
  name: string;
  rarity: string;
  coinPrice: number | null;
  state: "owned" | "purchasable" | "locked";
  reason: string | null;
  affordable: boolean;
  equipped: boolean;
}

// 3D rendering only exists for the species+hat slots today (AnimalCharacter3D);
// the rest (hair/eyes/clothes/accessory/background) only render in the 2D
// AvatarCharacter SVG, so the preview modal picks whichever one applies.
const RENDERS_IN_3D = new Set<Slot>(["species", "hat"]);

const SLOTS: Slot[] = ["species", "hair", "eyes", "clothes", "hat", "accessory", "background"];
const SLOT_LABELS: Record<Slot, string> = {
  species: "Animal",
  hair: "Fur",
  eyes: "Eyes",
  clothes: "Clothes",
  hat: "Hat",
  accessory: "Accessory",
  background: "Background",
};

export function AvatarCustomizer({
  items,
  coinsBalance,
}: {
  items: AvatarItem[];
  coinsBalance: number;
}) {
  const router = useRouter();
  const [activeSlot, setActiveSlot] = useState<Slot>("species");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<AvatarItem | null>(null);

  const equippedKeys = Object.fromEntries(
    SLOTS.map((slot) => [slot, items.find((i) => i.slot === slot && i.equipped)?.key])
  );

  async function equip(item: AvatarItem) {
    setBusyId(item.id);
    setError(null);
    try {
      const res = await fetch("/api/avatar/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarItemId: item.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't equip that");
        return;
      }
      playPop();
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function purchase(item: AvatarItem) {
    setBusyId(item.id);
    setError(null);
    try {
      const res = await fetch("/api/avatar/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarItemId: item.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't buy that");
        return;
      }
      playCoin();
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  const slotItems = items.filter((i) => i.slot === activeSlot);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2">
        <Avatar3D equippedKeys={equippedKeys} size={160} />
        <p className="flex items-center gap-1 text-sm font-semibold text-ink/60">
          <CoinIcon size={16} /> {coinsBalance} coins
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {SLOTS.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => setActiveSlot(slot)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              activeSlot === slot ? "bg-gold text-ink" : "bg-white text-ink/60"
            }`}
          >
            {SLOT_LABELS[slot]}
          </button>
        ))}
      </div>

      {error && <p className="text-center text-sm font-semibold text-coral">{error}</p>}

      <div className="grid grid-cols-3 gap-3">
        {slotItems.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col items-center gap-2 rounded-2xl p-3 text-center ${
              item.equipped ? "bg-gold/20 ring-2 ring-gold" : "bg-white"
            }`}
          >
            <button type="button" onClick={() => setPreviewItem(item)} className="flex flex-col items-center gap-2">
              <div className={item.state === "locked" ? "opacity-40 grayscale" : ""}>
                <AvatarRenderer equippedKeys={{ [item.slot]: item.key }} size={56} />
              </div>
              <p className="text-xs font-semibold">{item.name}</p>
            </button>
            {item.state === "owned" && !item.equipped && (
              <Button
                variant="ghost"
                className="!px-3 !py-1 !text-xs"
                onClick={() => equip(item)}
                disabled={busyId === item.id}
              >
                Wear
              </Button>
            )}
            {item.state === "owned" && item.equipped && (
              <span className="text-xs font-bold text-gold-dark">Equipped</span>
            )}
            {item.state === "purchasable" && (
              <Button
                variant="secondary"
                className="!flex !items-center !gap-1 !px-3 !py-1 !text-xs"
                onClick={() => purchase(item)}
                disabled={busyId === item.id || !item.affordable}
              >
                {item.affordable ? (
                  <>
                    <CoinIcon size={13} /> {item.coinPrice}
                  </>
                ) : (
                  "Not enough coins"
                )}
              </Button>
            )}
            {item.state === "locked" && <p className="text-[10px] text-ink/40">{item.reason}</p>}
          </div>
        ))}
      </div>

      <ItemPreviewModal
        open={previewItem !== null}
        onClose={() => setPreviewItem(null)}
        name={previewItem?.name ?? ""}
        rarity={previewItem?.rarity}
        reason={previewItem?.state === "locked" ? previewItem.reason : null}
        preview={
          previewItem &&
          (RENDERS_IN_3D.has(previewItem.slot) ? (
            <Avatar3D equippedKeys={{ ...equippedKeys, [previewItem.slot]: previewItem.key }} size={180} />
          ) : (
            <AvatarRenderer equippedKeys={{ ...equippedKeys, [previewItem.slot]: previewItem.key }} size={140} />
          ))
        }
        action={
          previewItem &&
          (previewItem.state === "owned" && !previewItem.equipped ? (
            <Button
              onClick={() => {
                void equip(previewItem);
                setPreviewItem(null);
              }}
              disabled={busyId === previewItem.id}
            >
              Wear
            </Button>
          ) : previewItem.state === "owned" && previewItem.equipped ? (
            <span className="text-xs font-bold text-gold-dark">Equipped</span>
          ) : previewItem.state === "purchasable" ? (
            <Button
              variant="secondary"
              className="!flex !items-center !gap-1"
              onClick={() => {
                void purchase(previewItem);
                setPreviewItem(null);
              }}
              disabled={busyId === previewItem.id || !previewItem.affordable}
            >
              {previewItem.affordable ? (
                <>
                  <CoinIcon size={14} /> {previewItem.coinPrice}
                </>
              ) : (
                "Not enough coins"
              )}
            </Button>
          ) : null)
        }
      />
    </div>
  );
}
