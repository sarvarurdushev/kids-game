"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoomScene } from "./RoomScene";
import { RoomScene3D } from "@/components/three/RoomScene3D";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";
import { Button } from "@/components/ui/Button";
import { ItemPreviewModal } from "@/components/ui/ItemPreviewModal";
import { playCoin, playPop } from "@/lib/sound";
import { CoinIcon } from "@/components/icons";

type RoomSlot = "wallpaper" | "floor" | "furniture";

export interface RoomItem {
  id: string;
  slot: RoomSlot;
  key: string;
  name: string;
  rarity: string;
  coinPrice: number | null;
  state: "owned" | "purchasable" | "locked";
  reason: string | null;
  affordable: boolean;
  equipped: boolean;
}

const SLOTS: RoomSlot[] = ["wallpaper", "floor", "furniture"];
const SLOT_LABELS: Record<RoomSlot, string> = {
  wallpaper: "Wallpaper",
  floor: "Floor",
  furniture: "Furniture",
};

export function RoomCustomizer({
  items,
  coinsBalance,
  equippedKeys,
}: {
  items: RoomItem[];
  coinsBalance: number;
  equippedKeys: AvatarEquippedKeys;
}) {
  const router = useRouter();
  const [activeSlot, setActiveSlot] = useState<RoomSlot>("wallpaper");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<RoomItem | null>(null);

  async function equip(item: RoomItem) {
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

  async function purchase(item: RoomItem) {
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
        <RoomScene3D equippedKeys={equippedKeys} className="w-full" />
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

      <div className="grid grid-cols-2 gap-3">
        {slotItems.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col items-center gap-2 rounded-2xl p-2 text-center ${
              item.equipped ? "bg-gold/20 ring-2 ring-gold" : "bg-white"
            }`}
          >
            <button type="button" onClick={() => setPreviewItem(item)} className="flex w-full flex-col items-center gap-2">
              <div className={`w-full overflow-hidden rounded-xl ${item.state === "locked" ? "opacity-40 grayscale" : ""}`}>
                <RoomScene equippedKeys={{ [item.slot]: item.key }} avatarSize={70} className="w-full" />
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
                Use
              </Button>
            )}
            {item.state === "owned" && item.equipped && (
              <span className="text-xs font-bold text-gold-dark">In use</span>
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
          previewItem && (
            <RoomScene3D
              equippedKeys={{ ...equippedKeys, [previewItem.slot]: previewItem.key }}
              className="w-full"
            />
          )
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
              Use
            </Button>
          ) : previewItem.state === "owned" && previewItem.equipped ? (
            <span className="text-xs font-bold text-gold-dark">In use</span>
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
