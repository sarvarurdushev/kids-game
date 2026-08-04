"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoomScene } from "./RoomScene";
import { RoomScene3D } from "@/components/three/RoomScene3D";
import type { AvatarEquippedKeys } from "@/components/avatar/AvatarCharacter";
import { Button } from "@/components/ui/Button";
import { ItemPreviewModal } from "@/components/ui/ItemPreviewModal";
import { ThumbnailImage } from "@/components/ui/ThumbnailImage";
import { playCoin, playPop } from "@/lib/sound";
import { CoinIcon } from "@/components/icons";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

type RoomSlot = "wallpaper" | "floor" | "furniture" | "furniture_small" | "furniture_wall";

export interface RoomItem {
  id: string;
  slot: RoomSlot;
  key: string;
  name: string;
  rarity: string;
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
  equipped: boolean;
}

export interface RoomSetItem {
  id: string;
  key: string;
  name: string;
  coinPrice: number;
  wallpaperKey: string | null;
  floorKey: string | null;
  furnitureKey: string | null;
  furnitureSmallKey: string | null;
  furnitureWallKey: string | null;
  owned: boolean;
  affordable: boolean;
}

const SLOTS: RoomSlot[] = ["wallpaper", "floor", "furniture", "furniture_small", "furniture_wall"];
const SLOT_LABEL_KEYS: Record<RoomSlot, TranslationKey> = {
  wallpaper: "room.wallpaper",
  floor: "room.floor",
  furniture: "room.bigFurniture",
  furniture_small: "room.smallFurniture",
  furniture_wall: "room.wallDecor",
};

// furniture/furniture_small are multi-select (up to ROOM_PLACEMENT_CAP slots
// each — lib/student/roomPlacements.ts, kept in sync by hand here since this
// is a client component and that module is server-only) with their own
// Place/Remove actions; every other slot keeps the original single-select
// Use/In-use pattern.
const PLACEMENT_SLOTS = new Set<RoomSlot>(["furniture", "furniture_small"]);
const ROOM_PLACEMENT_CAP: Partial<Record<RoomSlot, number>> = {
  furniture: 4,
  furniture_small: 3,
};

// Grid tiles for these slots use pre-rendered static thumbnails
// (scripts/render-thumbnails.ts) instead of a live RoomScene SVG.
// furniture/furniture_small/furniture_wall are real GLB pieces; wallpaper/
// floor are procedural plane geometry (no GLB) but render-thumbnails.ts
// still pre-renders them via a vanilla-three.js recipe mirroring
// RoomScene3D.tsx's WALLPAPERS/FLOORS, so they get static PNGs too.
const THUMBNAIL_SLOTS = new Set<RoomSlot>([
  "furniture",
  "furniture_small",
  "furniture_wall",
  "wallpaper",
  "floor",
]);

// Every furniture-ish slot shares one output folder (public/thumbnails/furniture/);
// wallpaper/floor each get their own folder — see scripts/render-thumbnails.ts's
// OUT_FURNITURE/OUT_WALLPAPER/OUT_FLOOR.
const THUMBNAIL_FOLDER: Partial<Record<RoomSlot, string>> = {
  furniture: "furniture",
  furniture_small: "furniture",
  furniture_wall: "furniture",
  wallpaper: "wallpaper",
  floor: "floor",
};

export function RoomCustomizer({
  items,
  roomSets,
  coinsBalance,
  equippedKeys,
}: {
  items: RoomItem[];
  roomSets: RoomSetItem[];
  coinsBalance: number;
  equippedKeys: AvatarEquippedKeys;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeSlot, setActiveSlot] = useState<RoomSlot>("wallpaper");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<RoomItem | null>(null);
  const [busySetId, setBusySetId] = useState<string | null>(null);

  async function purchaseSet(set: RoomSetItem) {
    setBusySetId(set.id);
    setError(null);
    try {
      const res = await fetch("/api/room/purchase-set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomSetId: set.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? t("room.errorBuySet"));
        return;
      }
      playCoin();
      router.refresh();
    } finally {
      setBusySetId(null);
    }
  }

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
        setError(data.error ?? t("common.errorEquip"));
        return;
      }
      playPop();
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function place(item: RoomItem) {
    setBusyId(item.id);
    setError(null);
    try {
      const res = await fetch("/api/room/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarItemId: item.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? t("common.errorPlace"));
        return;
      }
      playPop();
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: RoomItem) {
    setBusyId(item.id);
    setError(null);
    try {
      const res = await fetch("/api/room/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarItemId: item.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? t("common.errorRemove"));
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
        setError(data.error ?? t("common.errorBuy"));
        return;
      }
      playCoin();
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  const slotItems = items.filter((i) => i.slot === activeSlot);
  // Owned-and-currently-placed count for the active tab, when it's one of
  // the two multi-select slots — item.equipped for furniture/furniture_small
  // already means "currently placed" (lib/student/avatar.ts's getAvatarItems),
  // so counting owned+equipped items in this slot is exactly the placement
  // count, no separate round trip needed.
  const placedCount = PLACEMENT_SLOTS.has(activeSlot)
    ? items.filter((i) => i.slot === activeSlot && i.equipped).length
    : null;
  const activeCap = ROOM_PLACEMENT_CAP[activeSlot] ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2">
        <RoomScene3D equippedKeys={equippedKeys} className="w-full" />
        <p className="flex items-center gap-1 text-sm font-semibold text-ink/60">
          <CoinIcon size={16} /> {coinsBalance} {t("home.coins")}
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
            {t(SLOT_LABEL_KEYS[slot])}
          </button>
        ))}
      </div>

      {placedCount !== null && (
        <p className="text-center text-xs font-semibold text-ink/50">
          {t("room.placedCount", { count: placedCount, cap: activeCap })}
        </p>
      )}

      {error && <p className="text-center text-sm font-semibold text-coral">{error}</p>}

      {roomSets.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-semibold">{t("room.roomSets")}</h2>
          <p className="text-xs text-ink/50">{t("room.roomSetsHint")}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {roomSets.map((set) => (
              <div key={set.id} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center">
                <div className="w-full overflow-hidden rounded-xl">
                  <RoomScene3D
                    equippedKeys={{
                      wallpaper: set.wallpaperKey ?? undefined,
                      floor: set.floorKey ?? undefined,
                      furniture: set.furnitureKey ? [set.furnitureKey] : undefined,
                      furniture_small: set.furnitureSmallKey ? [set.furnitureSmallKey] : undefined,
                      furniture_wall: set.furnitureWallKey ?? undefined,
                    }}
                    className="w-full"
                  />
                </div>
                <p className="font-display text-sm font-semibold">{set.name}</p>
                {set.owned ? (
                  <span className="text-xs font-bold text-gold-dark">{t("common.owned")}</span>
                ) : (
                  <Button
                    variant="secondary"
                    className="!flex !items-center !gap-1 !px-3 !py-1.5 !text-xs"
                    onClick={() => purchaseSet(set)}
                    disabled={busySetId === set.id || !set.affordable}
                  >
                    {set.affordable ? (
                      <>
                        <CoinIcon size={13} /> {set.coinPrice}
                      </>
                    ) : (
                      t("common.notEnoughCoins")
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {slotItems.map((item) => (
          <div
            key={item.id}
            className={`relative flex flex-col items-center gap-2 rounded-2xl p-2 text-center ${
              item.equipped ? "bg-gold/20 ring-2 ring-gold" : "bg-white"
            }`}
          >
            {item.featured && item.state === "purchasable" && (
              <span className="absolute -top-1 -right-2 z-10 rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold text-white shadow">
                {t("common.featuredDiscount")}
              </span>
            )}
            <button type="button" onClick={() => setPreviewItem(item)} className="flex w-full flex-col items-center gap-2">
              <div className={`w-full overflow-hidden rounded-xl ${item.state === "locked" ? "opacity-40 grayscale" : ""}`}>
                {THUMBNAIL_SLOTS.has(item.slot) ? (
                  <ThumbnailImage
                    src={`/thumbnails/${THUMBNAIL_FOLDER[item.slot]}/${item.key}.png`}
                    alt={item.name}
                    className="aspect-[3/2] w-full rounded-xl bg-white"
                  />
                ) : (
                  <RoomScene equippedKeys={{ [item.slot]: item.key }} avatarSize={70} className="w-full" />
                )}
              </div>
              <p className="text-xs font-semibold">{item.name}</p>
            </button>
            {item.state === "owned" && !PLACEMENT_SLOTS.has(item.slot) && !item.equipped && (
              <Button
                variant="ghost"
                className="!px-3 !py-1 !text-xs"
                onClick={() => equip(item)}
                disabled={busyId === item.id}
              >
                {t("common.use")}
              </Button>
            )}
            {item.state === "owned" && !PLACEMENT_SLOTS.has(item.slot) && item.equipped && (
              <span className="text-xs font-bold text-gold-dark">{t("common.inUse")}</span>
            )}
            {item.state === "owned" && PLACEMENT_SLOTS.has(item.slot) && item.equipped && (
              <Button
                variant="ghost"
                className="!px-3 !py-1 !text-xs"
                onClick={() => remove(item)}
                disabled={busyId === item.id}
              >
                {t("common.remove")}
              </Button>
            )}
            {item.state === "owned" && PLACEMENT_SLOTS.has(item.slot) && !item.equipped && (
              <Button
                variant="ghost"
                className="!px-3 !py-1 !text-xs"
                onClick={() => place(item)}
                disabled={busyId === item.id || (placedCount ?? 0) >= activeCap}
                title={
                  (placedCount ?? 0) >= activeCap
                    ? t("room.roomFullHint", { cap: activeCap })
                    : undefined
                }
              >
                {(placedCount ?? 0) >= activeCap ? t("common.roomFull") : t("common.place")}
              </Button>
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
                    <CoinIcon size={13} />
                    {item.featured && <span className="text-ink/50 line-through">{item.coinPrice}</span>}
                    {item.effectivePrice}
                  </>
                ) : (
                  t("common.notEnoughCoins")
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
            <RoomScene3D equippedKeys={previewEquippedKeys(equippedKeys, previewItem)} className="w-full" />
          )
        }
        action={
          previewItem &&
          (previewItem.state === "purchasable" ? (
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
                t("common.notEnoughCoins")
              )}
            </Button>
          ) : previewItem.state !== "owned" ? null : PLACEMENT_SLOTS.has(previewItem.slot) ? (
            previewItem.equipped ? (
              <Button
                variant="secondary"
                onClick={() => {
                  void remove(previewItem);
                  setPreviewItem(null);
                }}
                disabled={busyId === previewItem.id}
              >
                {t("common.remove")}
              </Button>
            ) : (
              <Button
                onClick={() => {
                  void place(previewItem);
                  setPreviewItem(null);
                }}
                disabled={busyId === previewItem.id || (placedCount ?? 0) >= activeCap}
              >
                {(placedCount ?? 0) >= activeCap ? t("common.roomFull") : t("common.place")}
              </Button>
            )
          ) : previewItem.equipped ? (
            <span className="text-xs font-bold text-gold-dark">{t("common.inUse")}</span>
          ) : (
            <Button
              onClick={() => {
                void equip(previewItem);
                setPreviewItem(null);
              }}
              disabled={busyId === previewItem.id}
            >
              {t("common.use")}
            </Button>
          ))
        }
      />
    </div>
  );
}

// Builds the preview modal's equippedKeys: the current full room, with the
// previewed item swapped into its slot — a single string for the
// single-select slots, wrapped in a one-item array for the two multi-select
// furniture slots (AvatarEquippedKeys.furniture/furniture_small are arrays).
function previewEquippedKeys(base: AvatarEquippedKeys, item: RoomItem): AvatarEquippedKeys {
  if (item.slot === "furniture" || item.slot === "furniture_small") {
    return { ...base, [item.slot]: [item.key] };
  }
  return { ...base, [item.slot]: item.key };
}
