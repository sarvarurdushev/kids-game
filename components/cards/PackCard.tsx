"use client";

import { BoosterPackIcon } from "@/components/icons";
import { useTranslation } from "@/components/i18n/LanguageProvider";

interface PackCardProps {
  name: string;
  cardsPerPack?: number;
  color?: string;
}

export function PackCard({ name, cardsPerPack, color }: PackCardProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <BoosterPackIcon size={72} color={color} />
      <p className="font-display font-semibold">{name}</p>
      {cardsPerPack !== undefined && (
        <p className="text-sm text-ink/60">{t("packs.cardsCount", { count: cardsPerPack })}</p>
      )}
    </div>
  );
}
