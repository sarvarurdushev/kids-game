"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardFrame } from "./CardFrame";
import { AvatarRenderer } from "@/components/avatar/AvatarRenderer";
import { Button } from "@/components/ui/Button";
import { ItemPreviewModal } from "@/components/ui/ItemPreviewModal";
import { playCoin } from "@/lib/sound";
import { CoinIcon } from "@/components/icons";
import { RARITY_COLOR_VAR } from "@/lib/visuals";
import type { Rarity } from "@/lib/reward-engine/types";

export interface StyleItem {
  id: string;
  slot: "hair" | "eyes" | "clothes" | "accessory" | "background" | "hat";
  key: string;
  name: string;
  rarity: Rarity;
  coinPrice: number | null;
  // `coinPrice` stays the original price (so the UI can strike it through);
  // `effectivePrice` is what purchase actually charges — discounted when
  // `featured`, matching `coinPrice` otherwise. The server prices every
  // purchase itself, so this is display-only.
  featured: boolean;
  effectivePrice: number | null;
  state: "owned" | "purchasable" | "locked";
  reason: string | null;
  affordable: boolean;
}

/** Former avatar "wear it" slots (hair/eyes/clothes) reframed as a
 * card-collection-style browse — own it or don't, no equip step — since they
 * never actually showed up on the 3D avatar everyone sees and pretending
 * they were 3D-equippable cosmetics was the confusing part, not the content
 * itself. Mirrors CollectionGrid's look (CardFrame, rarity color, tap for a
 * bigger preview) with a buy button standing in for "collect this one." */
export function StyleCollectionGrid({ items }: { items: StyleItem[] }) {
  const router = useRouter();
  const [previewItem, setPreviewItem] = useState<StyleItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function purchase(item: StyleItem) {
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

  return (
    <>
      {error && <p className="text-center text-sm font-semibold text-coral">{error}</p>}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <button key={item.id} type="button" onClick={() => setPreviewItem(item)} className="text-left">
            <CardFrame rarity={item.rarity} dimmed={item.state !== "owned"} className="flex flex-col items-center gap-1.5 p-3 pt-4">
              {/* Positioned inside the card bounds rather than hanging off the
                  corner: CardFrame is overflow-hidden (it clips its holo
                  shimmer sweep), so a negative offset gets sliced off
                  mid-word. top-2.5 clears the frame's h-2 rarity bar. */}
              {item.featured && item.state === "purchasable" && (
                <span className="absolute top-2.5 right-1.5 z-10 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold text-white shadow">
                  ★ 25% OFF
                </span>
              )}
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full">
                <AvatarRenderer equippedKeys={{ [item.slot]: item.key }} size={72} />
              </div>
              <p className="font-display text-sm font-semibold">{item.name}</p>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase"
                style={{ backgroundColor: RARITY_COLOR_VAR[item.rarity] }}
              >
                {item.rarity}
              </span>
            </CardFrame>
          </button>
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
            <div className="h-40 w-40 sm:h-56 sm:w-56">
              <AvatarRenderer equippedKeys={{ [previewItem.slot]: previewItem.key }} size={220} className="h-full w-full" />
            </div>
          )
        }
        action={
          previewItem &&
          (previewItem.state === "owned" ? (
            <span className="text-xs font-bold text-gold-dark">Collected</span>
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
                  <CoinIcon size={14} />
                  {previewItem.featured && (
                    <span className="text-ink/50 line-through">{previewItem.coinPrice}</span>
                  )}
                  {previewItem.effectivePrice}
                </>
              ) : (
                "Not enough coins"
              )}
            </Button>
          ) : null)
        }
      />
    </>
  );
}
