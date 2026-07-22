"use client";

import type { ReactNode } from "react";
import { Modal } from "./Modal";
import { RARITY_COLOR_VAR } from "@/lib/visuals";

interface ItemPreviewModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  rarity?: string | null;
  preview: ReactNode;
  reason?: string | null;
  action?: ReactNode;
}

/** Subway-Surfers-style "tap a locked thing to see what it looks like"
 * preview — a full-color look at an item regardless of ownership, reused by
 * the avatar/room customizers and the card collection. Ownership stays
 * enforced wherever equip/purchase actually happens; this is preview-only. */
export function ItemPreviewModal({ open, onClose, name, rarity, preview, reason, action }: ItemPreviewModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="relative flex flex-col items-center gap-3 text-center">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/10 text-sm font-bold text-ink/60"
        >
          ✕
        </button>
        <div className="flex items-center justify-center py-2">{preview}</div>
        <h2 className="font-display text-xl font-bold">{name}</h2>
        {rarity && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase"
            style={{ backgroundColor: RARITY_COLOR_VAR[rarity] }}
          >
            {rarity}
          </span>
        )}
        {reason && <p className="text-sm text-ink/50">{reason}</p>}
        {action}
      </div>
    </Modal>
  );
}
