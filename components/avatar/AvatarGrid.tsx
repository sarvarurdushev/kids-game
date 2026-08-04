"use client";

import { AvatarRenderer } from "./AvatarRenderer";
import type { AvatarEquippedKeys } from "./AvatarCharacter";
import { useTranslation } from "@/components/i18n/LanguageProvider";

interface FamilyMember {
  id: string;
  displayName: string;
  equippedKeys: AvatarEquippedKeys;
}

interface AvatarGridProps {
  members: FamilyMember[];
  onSelect: (id: string) => void;
  onAddAnother: () => void;
}

export function AvatarGrid({ members, onSelect, onAddAnother }: AvatarGridProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {members.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onSelect(m.id)}
          className="flex flex-col items-center gap-2 rounded-2xl bg-white/80 p-4 shadow-md transition-transform active:scale-95"
        >
          <AvatarRenderer equippedKeys={m.equippedKeys} size={72} />
          <span className="font-display font-semibold">{m.displayName}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={onAddAnother}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/20 p-4 text-ink/50 transition-transform active:scale-95"
      >
        <span className="text-4xl">➕</span>
        <span className="font-display text-sm font-semibold">{t("auth.addKid")}</span>
      </button>
    </div>
  );
}
