"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AvatarRenderer } from "./AvatarRenderer";
import { Avatar3D } from "@/components/three/Avatar3D";
import { Button } from "@/components/ui/Button";
import { ItemPreviewModal } from "@/components/ui/ItemPreviewModal";
import { playCoin, playPop, playFanfare } from "@/lib/sound";
import { CoinIcon } from "@/components/icons";

const DANCE_DURATION_MS = 4000;

// Every other slot (hair/eyes/clothes, then accessory/background) used to
// live here too, but none of them ever showed up on the real 3D model
// everyone actually sees - only species+hat do (AnimalCharacter3D) -
// switching tabs kept feeling broken ("some work some don't"). They now all
// live in the Styles collection (components/cards/StyleCollectionGrid.tsx)
// as ownable cards instead of pretending to be 3D-equippable cosmetics.
// What's left here is genuinely just "the 3D avatar," so there's no more
// 2D-vs-3D preview branching to speak of.
type Slot = "species" | "hat";

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

const SLOTS: Slot[] = ["species", "hat"];
const SLOT_LABELS: Record<Slot, string> = {
  species: "Animal",
  hat: "Hat",
};

export function AvatarCustomizer({
  items,
  coinsBalance,
  danceUnlocked,
  danceCost,
}: {
  items: AvatarItem[];
  coinsBalance: number;
  danceUnlocked: boolean;
  danceCost: number;
}) {
  const router = useRouter();
  const [activeSlot, setActiveSlot] = useState<Slot>("species");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<AvatarItem | null>(null);
  const [dancing, setDancing] = useState(false);
  const [unlockingDance, setUnlockingDance] = useState(false);

  function danceNow() {
    if (dancing) return;
    playFanfare();
    setDancing(true);
    setTimeout(() => setDancing(false), DANCE_DURATION_MS);
  }

  async function purchaseDance() {
    setUnlockingDance(true);
    setError(null);
    try {
      const res = await fetch("/api/avatar/unlock-dance", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't unlock that");
        return;
      }
      playCoin();
      router.refresh();
    } finally {
      setUnlockingDance(false);
    }
  }

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
        <div className="w-48 sm:w-72 lg:w-96">
          <Avatar3D equippedKeys={equippedKeys} size={420} dancing={dancing} responsive />
        </div>
        <p className="flex items-center gap-1 text-sm font-semibold text-ink/60">
          <CoinIcon size={16} /> {coinsBalance} coins
        </p>
        {danceUnlocked ? (
          <Button variant="secondary" onClick={danceNow} disabled={dancing} className="!px-4 !py-1.5 !text-sm">
            {dancing ? "Dancing! 🎉" : "Dance!"}
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={purchaseDance}
            disabled={unlockingDance || coinsBalance < danceCost}
            className={`!flex !items-center !gap-1 !px-4 !py-1.5 !text-sm ${
              coinsBalance >= danceCost ? "animate-pulse ring-2 ring-gold" : ""
            }`}
          >
            🎉 Unlock Dance Party — <CoinIcon size={14} /> {danceCost}
          </Button>
        )}
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

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
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
          previewItem && (
            <div className="w-40 sm:w-56 lg:w-64">
              <Avatar3D
                equippedKeys={{ ...equippedKeys, [previewItem.slot]: previewItem.key }}
                size={280}
                responsive
              />
            </div>
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
