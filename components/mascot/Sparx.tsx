"use client";

import { motion } from "motion/react";

export type SparxExpression = "idle" | "cheer" | "wink" | "sleepy";

interface SparxProps {
  expression?: SparxExpression;
  size?: number;
  className?: string;
  bounce?: boolean;
}

const RAY_COUNT = 8;
const RAYS = Array.from({ length: RAY_COUNT }, (_, i) => ({
  angle: (i * 360) / RAY_COUNT,
  length: i % 2 === 0 ? 40 : 28,
}));

const SPARKLES = [
  { x: 34, y: 40, size: 8, delay: 0 },
  { x: 168, y: 52, size: 6, delay: 0.3 },
  { x: 150, y: 150, size: 7, delay: 0.6 },
  { x: 28, y: 140, size: 5, delay: 0.9 },
];

function Sparkle({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, delay, ease: "easeInOut" }}
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      <path
        d={`M ${x} ${y - size} L ${x + size * 0.28} ${y - size * 0.28} L ${x + size} ${y} L ${x + size * 0.28} ${y + size * 0.28} L ${x} ${y + size} L ${x - size * 0.28} ${y + size * 0.28} L ${x - size} ${y} L ${x - size * 0.28} ${y - size * 0.28} Z`}
        fill="var(--color-gk-gold)"
      />
    </motion.g>
  );
}

function Eyes({ expression }: { expression: SparxExpression }) {
  const openEye = (cx: number) => (
    <g key={cx}>
      <ellipse cx={cx} cy={92} rx={9} ry={11} fill="#2d2a26" />
      <circle cx={cx - 2.5} cy={87} r={2.2} fill="#fff" />
    </g>
  );
  const closedHappyEye = (cx: number) => (
    <path
      key={cx}
      d={`M ${cx - 9} 94 Q ${cx} 82 ${cx + 9} 94`}
      stroke="#2d2a26"
      strokeWidth={3.4}
      strokeLinecap="round"
      fill="none"
    />
  );
  const closedSleepyEye = (cx: number) => (
    <path
      key={cx}
      d={`M ${cx - 9} 90 Q ${cx} 98 ${cx + 9} 92`}
      stroke="#2d2a26"
      strokeWidth={3.2}
      strokeLinecap="round"
      fill="none"
    />
  );

  if (expression === "cheer") return <>{[80, 120].map(closedHappyEye)}</>;
  if (expression === "sleepy") return <>{[80, 120].map(closedSleepyEye)}</>;
  if (expression === "wink")
    return (
      <>
        {openEye(80)}
        {closedHappyEye(120)}
      </>
    );
  return <>{[80, 120].map(openEye)}</>;
}

function Mouth({ expression }: { expression: SparxExpression }) {
  if (expression === "cheer") {
    return <ellipse cx={100} cy={116} rx={13} ry={10} fill="#a8471f" />;
  }
  if (expression === "sleepy") {
    return (
      <path d="M 92 118 Q 100 122 108 118" stroke="#2d2a26" strokeWidth={3} strokeLinecap="round" fill="none" />
    );
  }
  return (
    <path
      d="M 86 112 Q 100 126 114 112"
      stroke="#2d2a26"
      strokeWidth={3.4}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function Arm({ side, raised }: { side: "left" | "right"; raised: boolean }) {
  const mirror = side === "right";
  const d = raised
    ? "M 58 102 Q 40 70 28 50"
    : "M 58 108 Q 44 122 38 148";
  return (
    <g transform={mirror ? "translate(200,0) scale(-1,1)" : undefined}>
      <path d={d} stroke="var(--color-gk-gold-dark)" strokeWidth={9} strokeLinecap="round" fill="none" />
    </g>
  );
}

export function Sparx({ expression = "idle", size = 120, className = "", bounce = false }: SparxProps) {
  const leftRaised = expression === "cheer";
  const rightRaised = expression === "cheer" || expression === "wink";

  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Sparx the mascot, ${expression}`}
      animate={
        bounce
          ? { y: [0, -14, 0], rotate: [0, -4, 4, 0] }
          : { y: [0, -6, 0], rotate: [-1.5, 1.5, -1.5] }
      }
      transition={
        bounce
          ? { duration: 0.6, ease: "easeOut" }
          : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <defs>
        <radialGradient id="sparx-body" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="45%" stopColor="var(--color-gk-gold)" />
          <stop offset="100%" stopColor="var(--color-gk-gold-dark)" />
        </radialGradient>
        <filter id="sparx-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {expression === "cheer" && SPARKLES.map((s, i) => <Sparkle key={i} {...s} />)}

      <ellipse cx={100} cy={178} rx={38} ry={7} fill="#2d2a26" opacity={0.1} />

      <g filter="url(#sparx-glow)">
        {RAYS.map(({ angle, length }) => (
          <g key={angle} transform={`rotate(${angle} 100 100)`}>
            <ellipse
              cx={100}
              cy={100 - 52 - length / 2}
              rx={13}
              ry={length / 2}
              fill="var(--color-gk-gold)"
              opacity={0.9}
            />
          </g>
        ))}
        <circle cx={100} cy={100} r={52} fill="url(#sparx-body)" />
      </g>

      <Arm side="left" raised={leftRaised} />
      <Arm side="right" raised={rightRaised} />

      <ellipse cx={78} cy={106} rx={7} ry={4.5} fill="var(--color-gk-coral)" opacity={0.35} />
      <ellipse cx={122} cy={106} rx={7} ry={4.5} fill="var(--color-gk-coral)" opacity={0.35} />

      <Eyes expression={expression} />
      <Mouth expression={expression} />

      {expression === "sleepy" && (
        <motion.text
          x={132}
          y={54}
          fontSize={16}
          fontWeight={700}
          fill="var(--color-gk-gold-dark)"
          initial={{ opacity: 0, y: 54 }}
          animate={{ opacity: [0, 1, 0], y: 34 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        >
          z
        </motion.text>
      )}
    </motion.svg>
  );
}
