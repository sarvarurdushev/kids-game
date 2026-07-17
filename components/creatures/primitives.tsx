"use client";

import { useId } from "react";
import { motion } from "motion/react";
import type { Rarity } from "@/lib/reward-engine/types";

export function useSvgId(prefix: string): string {
  const id = useId();
  return `${prefix}${id.replace(/[^a-zA-Z0-9]/g, "")}`;
}

interface PaletteGradientProps {
  id: string;
  light: string;
  mid: string;
  dark: string;
  cx?: string;
  cy?: string;
}

export function PaletteGradient({ id, light, mid, dark, cx = "38%", cy = "30%" }: PaletteGradientProps) {
  return (
    <radialGradient id={id} cx={cx} cy={cy} r="75%">
      <stop offset="0%" stopColor={light} />
      <stop offset="55%" stopColor={mid} />
      <stop offset="100%" stopColor={dark} />
    </radialGradient>
  );
}

export function GroundShadow({ cy = 178, rx = 40 }: { cy?: number; rx?: number }) {
  return <ellipse cx={100} cy={cy} rx={rx} ry={7} fill="#2d2a26" opacity={0.12} />;
}

export function RarityAura({ rarity, cx = 100, cy = 100, r = 68 }: { rarity: Rarity; cx?: number; cy?: number; r?: number }) {
  if (rarity === "common" || rarity === "rare") return null;
  const color = rarity === "legendary" ? "var(--color-rarity-legendary)" : "var(--color-rarity-epic)";
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      fill={color}
      opacity={0.16}
      animate={{ r: [r, r + 7, r], opacity: [0.12, 0.22, 0.12] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const SPARKLE_SPOTS = [
  { x: 32, y: 44, size: 7 },
  { x: 166, y: 50, size: 6 },
  { x: 158, y: 148, size: 6 },
  { x: 30, y: 140, size: 5 },
];

export function LegendarySparkles() {
  return (
    <>
      {SPARKLE_SPOTS.map((s, i) => (
        <motion.path
          key={i}
          d={`M ${s.x} ${s.y - s.size} L ${s.x + s.size * 0.28} ${s.y - s.size * 0.28} L ${s.x + s.size} ${s.y} L ${s.x + s.size * 0.28} ${s.y + s.size * 0.28} L ${s.x} ${s.y + s.size} L ${s.x - s.size * 0.28} ${s.y + s.size * 0.28} L ${s.x - s.size} ${s.y} L ${s.x - s.size * 0.28} ${s.y - s.size * 0.28} Z`}
          fill="var(--color-rarity-legendary)"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4] }}
          transition={{ duration: 1.7, repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }}
          style={{ transformOrigin: `${s.x}px ${s.y}px` }}
        />
      ))}
    </>
  );
}

type EyeVariant = "open" | "closed" | "big" | "led";

export function Face({
  cx1 = 82,
  cx2 = 118,
  cy = 92,
  eyeSize = 8,
  variant = "open",
  mouthCx = 100,
  mouthCy = 112,
  mouthWidth = 13,
  blushCy,
  showBlush = true,
  showMouth = true,
}: {
  cx1?: number;
  cx2?: number;
  cy?: number;
  eyeSize?: number;
  variant?: EyeVariant;
  mouthCx?: number;
  mouthCy?: number;
  mouthWidth?: number;
  blushCy?: number;
  showBlush?: boolean;
  showMouth?: boolean;
}) {
  const blushY = blushCy ?? cy + 16;

  return (
    <>
      {showBlush && (
        <>
          <ellipse cx={cx1 - 4} cy={blushY} rx={7} ry={4.5} fill="var(--color-gk-coral)" opacity={0.32} />
          <ellipse cx={cx2 + 4} cy={blushY} rx={7} ry={4.5} fill="var(--color-gk-coral)" opacity={0.32} />
        </>
      )}

      {variant === "closed" && (
        <>
          <path d={`M ${cx1 - 8} ${cy + 2} Q ${cx1} ${cy - 8} ${cx1 + 8} ${cy + 2}`} stroke="#2d2a26" strokeWidth={3} strokeLinecap="round" fill="none" />
          <path d={`M ${cx2 - 8} ${cy + 2} Q ${cx2} ${cy - 8} ${cx2 + 8} ${cy + 2}`} stroke="#2d2a26" strokeWidth={3} strokeLinecap="round" fill="none" />
        </>
      )}

      {variant === "led" && (
        <>
          <rect x={cx1 - 7} y={cy - 5} width={14} height={10} rx={3} fill="#7fe8ff" />
          <rect x={cx2 - 7} y={cy - 5} width={14} height={10} rx={3} fill="#7fe8ff" />
        </>
      )}

      {(variant === "open" || variant === "big") && (
        <>
          <circle cx={cx1} cy={cy} r={variant === "big" ? eyeSize * 1.4 : eyeSize} fill="#2d2a26" />
          <circle cx={cx1 - eyeSize * 0.32} cy={cy - eyeSize * 0.42} r={eyeSize * 0.26} fill="#fff" />
          <circle cx={cx2} cy={cy} r={variant === "big" ? eyeSize * 1.4 : eyeSize} fill="#2d2a26" />
          <circle cx={cx2 - eyeSize * 0.32} cy={cy - eyeSize * 0.42} r={eyeSize * 0.26} fill="#fff" />
        </>
      )}

      {showMouth && (
        <path
          d={`M ${mouthCx - mouthWidth} ${mouthCy} Q ${mouthCx} ${mouthCy + 13} ${mouthCx + mouthWidth} ${mouthCy}`}
          stroke="#2d2a26"
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      )}
    </>
  );
}

export function ToothyMouth({ cx = 100, cy = 116, width = 15 }: { cx?: number; cy?: number; width?: number }) {
  return (
    <>
      <path d={`M ${cx - width} ${cy - 2} Q ${cx} ${cy + 12} ${cx + width} ${cy - 2}`} fill="#7a3a24" />
      <path
        d={`M ${cx - width} ${cy - 2} Q ${cx} ${cy + 12} ${cx + width} ${cy - 2}`}
        stroke="#2d2a26"
        strokeWidth={2.6}
        fill="none"
      />
      {[-1, 0, 1].map((i) => (
        <path
          key={i}
          d={`M ${cx + i * 8 - 3} ${cy - 1} L ${cx + i * 8} ${cy + 5} L ${cx + i * 8 + 3} ${cy - 1} Z`}
          fill="#fff"
        />
      ))}
    </>
  );
}

/** A soft curved wing (fairy/dragon/pterodactyl share this shape at different sizes/colors). */
export function Wing({
  side,
  color,
  width = 46,
  height = 62,
  originX = 60,
  originY = 90,
  opacity = 1,
}: {
  side: "left" | "right";
  color: string;
  width?: number;
  height?: number;
  originX?: number;
  originY?: number;
  opacity?: number;
}) {
  const mirror = side === "right";
  const d = `M 0 0 Q ${-width} ${-height * 0.5} ${-width * 0.2} ${-height} Q ${width * 0.15} ${-height * 0.6} 0 0 Z`;
  return (
    <g transform={mirror ? `translate(200,0) scale(-1,1)` : undefined}>
      <path
        transform={`translate(${originX} ${originY})`}
        d={d}
        fill={color}
        opacity={opacity}
        stroke="#2d2a2633"
        strokeWidth={1.5}
      />
    </g>
  );
}

export function StubLeg({ side, color }: { side: "left" | "right"; color: string }) {
  const mirror = side === "right";
  return (
    <g transform={mirror ? "translate(200,0) scale(-1,1)" : undefined}>
      <ellipse cx={70} cy={162} rx={11} ry={9} fill={color} />
    </g>
  );
}

export function StubArm({ side, color, raised = false }: { side: "left" | "right"; color: string; raised?: boolean }) {
  const mirror = side === "right";
  const d = raised ? "M 55 100 Q 36 78 26 62" : "M 55 105 Q 42 118 36 138";
  return (
    <g transform={mirror ? "translate(200,0) scale(-1,1)" : undefined}>
      <path d={d} stroke={color} strokeWidth={9} strokeLinecap="round" fill="none" />
    </g>
  );
}
