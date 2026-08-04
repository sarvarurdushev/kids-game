"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { emojiForUniverse } from "@/lib/visuals";
import { StyleCollectionGrid, type StyleItem } from "@/components/cards/StyleCollectionGrid";
import { useTranslation } from "@/components/i18n/LanguageProvider";

export interface UniverseProgress {
  universe: {
    id: string;
    key: string;
    name: string;
    locked: boolean;
    unlocksInMonthName: string | null;
  };
  progress: { owned: number; total: number };
}

type Tab = "characters" | "styles";

/** Two collections living on one page: character cards (per curriculum
 * universe, gacha-acquired) and the former avatar clothes/hair/eyes items
 * (bought directly) reframed the same way — own it or don't, tap to see it
 * bigger. Both use the same card-grid visual language on purpose. */
export function CollectionTabs({
  collection,
  styleItems,
}: {
  collection: UniverseProgress[];
  styleItems: StyleItem[];
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("characters");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("characters")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
            tab === "characters" ? "bg-gold text-ink" : "bg-white text-ink/60"
          }`}
        >
          {t("collection.characters")}
        </button>
        <button
          type="button"
          onClick={() => setTab("styles")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
            tab === "styles" ? "bg-gold text-ink" : "bg-white text-ink/60"
          }`}
        >
          {t("collection.styles")}
        </button>
      </div>

      {tab === "characters" ? (
        <div className="flex flex-col gap-3">
          {collection.map(({ universe, progress }) => {
            const card = (
              <Card
                className={`flex items-center gap-4 transition-transform ${universe.locked ? "" : "active:scale-[0.98]"}`}
              >
                <span className={`text-4xl ${universe.locked ? "opacity-40 grayscale" : ""}`}>
                  {emojiForUniverse(universe.key)}
                </span>
                <div className="flex-1">
                  <p className="font-display font-semibold">{universe.name}</p>
                  {universe.locked ? (
                    <p className="text-xs font-semibold text-ink/40">
                      {t("collection.unlocksIn", { month: universe.unlocksInMonthName ?? "" })}
                    </p>
                  ) : (
                    <ProgressBar value={progress.owned} max={progress.total} />
                  )}
                </div>
                {!universe.locked && (
                  <span className="text-sm font-bold text-ink/60">
                    {progress.owned}/{progress.total}
                  </span>
                )}
              </Card>
            );
            return universe.locked ? (
              <div key={universe.id}>{card}</div>
            ) : (
              <Link key={universe.id} href={`/collection/${universe.key}`}>
                {card}
              </Link>
            );
          })}
        </div>
      ) : (
        <StyleCollectionGrid items={styleItems} />
      )}
    </div>
  );
}
