"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import type { Rarity } from "@/lib/reward-engine/types";
import { RARITY_COLOR_VAR } from "@/lib/visuals";

interface CardFrameProps {
  rarity: Rarity;
  children: ReactNode;
  className?: string;
  dimmed?: boolean;
}

/** The shared "trading card" shell — rarity-colored frame + a holo shimmer
 * sweep for epic/legendary — reused by the collection grid and the pack
 * reveal sequence so a card looks the same wherever it appears. */
export function CardFrame({ rarity, children, className = "", dimmed = false }: CardFrameProps) {
  const color = RARITY_COLOR_VAR[rarity];
  const holo = rarity === "epic" || rarity === "legendary";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-[3px] bg-white shadow-md ${
        dimmed ? "grayscale opacity-70" : ""
      } ${className}`}
      style={{ borderColor: color }}
    >
      <div
        className="absolute inset-x-0 top-0 h-2"
        style={{ background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 40%, white))` }}
      />
      {holo && !dimmed && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.75) 42%, transparent 60%)",
            backgroundSize: "220% 220%",
          }}
          animate={{ backgroundPosition: ["-40% -40%", "140% 140%"] }}
          transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
        />
      )}
      {children}
    </div>
  );
}
