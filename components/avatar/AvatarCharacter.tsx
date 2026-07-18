"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useSvgId } from "@/components/creatures/primitives";

export type AvatarSlot = "hair" | "eyes" | "clothes" | "hat" | "accessory" | "background";
export type AvatarMood = "neutral" | "happy" | "sad";

const SKIN = "#f2c49b";
const INK = "#2d2a26";

function Mouth({ mood }: { mood: AvatarMood }) {
  if (mood === "happy") {
    return (
      <path
        d="M 82 108 Q 100 130 118 108 Q 100 122 82 108 Z"
        fill="#a8402c"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
    );
  }
  if (mood === "sad") {
    return (
      <path
        d="M 84 116 Q 100 104 116 116"
        stroke={INK}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  return (
    <path
      d="M 85 107 Q 100 118 115 107"
      stroke={INK}
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function Brows({ mood }: { mood: AvatarMood }) {
  if (mood === "sad") {
    return (
      <>
        <path d="M 72 68 Q 82 74 92 70" stroke={INK} strokeWidth={2.5} strokeLinecap="round" fill="none" />
        <path d="M 128 68 Q 118 74 108 70" stroke={INK} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      </>
    );
  }
  return null;
}

const EYES: Record<string, (mood: AvatarMood) => ReactNode> = {
  eyes_round: () => (
    <>
      <circle cx={84} cy={86} r={7} fill={INK} />
      <circle cx={81.5} cy={83} r={2} fill="#fff" />
      <circle cx={116} cy={86} r={7} fill={INK} />
      <circle cx={113.5} cy={83} r={2} fill="#fff" />
    </>
  ),
  eyes_sparkle: () => (
    <>
      <circle cx={84} cy={86} r={9} fill={INK} />
      <circle cx={81} cy={82} r={2.6} fill="#fff" />
      <circle cx={87} cy={90} r={1.4} fill="#fff" />
      <circle cx={116} cy={86} r={9} fill={INK} />
      <circle cx={113} cy={82} r={2.6} fill="#fff" />
      <circle cx={119} cy={90} r={1.4} fill="#fff" />
    </>
  ),
  eyes_star: () => {
    const star = (cx: number, cy: number) =>
      `M ${cx} ${cy - 8} L ${cx + 2.4} ${cy - 2.4} L ${cx + 8} ${cy} L ${cx + 2.4} ${cy + 2.4} L ${cx} ${cy + 8} L ${cx - 2.4} ${cy + 2.4} L ${cx - 8} ${cy} L ${cx - 2.4} ${cy - 2.4} Z`;
    return (
      <>
        <circle cx={84} cy={86} r={8} fill="#fff" stroke={INK} strokeWidth={1.5} />
        <path d={star(84, 86)} fill="#ffb703" />
        <circle cx={116} cy={86} r={8} fill="#fff" stroke={INK} strokeWidth={1.5} />
        <path d={star(116, 86)} fill="#ffb703" />
      </>
    );
  },
};

const HAIR: Record<string, () => ReactNode> = {
  hair_brown: () => (
    <>
      <path
        d="M 56 84 Q 50 32 100 30 Q 150 32 144 84 Q 144 58 100 54 Q 56 58 56 84 Z"
        fill="#6b4226"
      />
      <path d="M 58 76 Q 100 58 142 76 L 142 66 Q 100 50 58 66 Z" fill="#5a3620" />
    </>
  ),
  hair_curly: () => (
    <>
      {[
        [68, 48, 18],
        [100, 34, 22],
        [132, 48, 18],
        [54, 68, 15],
        [146, 68, 15],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#3d2a1a" />
      ))}
    </>
  ),
  hair_spiky: () => (
    <>
      {[
        [58, 46, 16],
        [78, 68, 14],
        [100, 100, 15],
        [122, 132, 14],
        [142, 154, 16],
      ].map(([bx, tx, ty], i) => (
        <path key={i} d={`M ${bx} 66 L ${tx} ${ty} L ${bx + 16} 66 Z`} fill="#4a3628" />
      ))}
      <path d="M 56 82 Q 52 60 100 56 Q 148 60 144 82 Q 144 68 100 64 Q 56 68 56 82 Z" fill="#4a3628" />
    </>
  ),
};

const CLOTHES: Record<string, () => ReactNode> = {
  clothes_tshirt: () => (
    <>
      <path d="M 40 200 Q 42 138 100 130 Q 158 138 160 200 Z" fill="#4fb3d9" />
      <path d="M 84 132 Q 100 148 116 132 Q 100 140 84 132 Z" fill="#3a92b3" />
    </>
  ),
  clothes_hoodie: () => (
    <>
      <path d="M 40 200 Q 42 136 100 128 Q 158 136 160 200 Z" fill="#33475b" />
      <path d="M 74 138 Q 100 126 126 138 L 122 150 Q 100 140 78 150 Z" fill="#25333f" />
      <rect x={90} y={165} width={20} height={18} rx={4} fill="#25333f" />
      <line x1={92} y1={140} x2={88} y2={158} stroke="#e8e3d8" strokeWidth={2} strokeLinecap="round" />
      <line x1={108} y1={140} x2={112} y2={158} stroke="#e8e3d8" strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  clothes_dress: () => (
    <>
      <path d="M 34 200 Q 38 140 100 130 Q 162 140 166 200 Z" fill="#d46fb8" />
      <path d="M 84 132 Q 100 144 116 132 Q 100 138 84 132 Z" fill="#b6549a" />
      <circle cx={100} cy={140} r={4.5} fill="#fff" opacity={0.85} />
    </>
  ),
  clothes_superhero: () => (
    <>
      <path d="M 44 196 Q 20 150 46 132 Q 40 168 56 192 Z" fill="#2b5fb0" opacity={0.9} />
      <path d="M 156 196 Q 180 150 154 132 Q 160 168 144 192 Z" fill="#2b5fb0" opacity={0.9} />
      <path d="M 40 200 Q 42 138 100 130 Q 158 138 160 200 Z" fill="#e74c3c" />
      <path
        d="M 100 148 L 104 158 L 114 158 L 106 164 L 109 174 L 100 168 L 91 174 L 94 164 L 86 158 L 96 158 Z"
        fill="#ffd23f"
      />
    </>
  ),
};

const HATS: Record<string, () => ReactNode> = {
  hat_cap: () => (
    <>
      <path d="M 58 56 Q 60 20 100 18 Q 140 20 142 56 Q 100 44 58 56 Z" fill="var(--color-teal)" />
      <ellipse cx={132} cy={54} rx={26} ry={8} fill="var(--color-teal)" transform="rotate(-8 132 54)" />
    </>
  ),
  hat_wizard: () => (
    <>
      <ellipse cx={100} cy={44} rx={44} ry={10} fill="#6a3fb5" />
      <path d="M 68 44 L 100 -6 L 132 44 Z" fill="#7c4fc9" />
      <path d="M 84 44 L 100 12 L 116 44 Z" fill="#6a3fb5" opacity={0.6} />
      <path
        d="M 100 -6 L 102.4 -1.4 L 107.6 -1.4 L 103.6 1.4 L 105 6 L 100 3 L 95 6 L 96.4 1.4 L 92.4 -1.4 L 97.6 -1.4 Z"
        fill="#ffd23f"
      />
    </>
  ),
  hat_crown: () => (
    <>
      <path
        d="M 62 52 L 68 26 L 84 42 L 100 20 L 116 42 L 132 26 L 138 52 Z"
        fill="#ffd23f"
        stroke="#e0a800"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle cx={100} cy={38} r={4} fill="#e63946" />
      <circle cx={80} cy={44} r={3} fill="#2b5fb0" />
      <circle cx={120} cy={44} r={3} fill="#2b5fb0" />
    </>
  ),
  hat_party: () => (
    <>
      <path d="M 78 52 L 100 6 L 122 52 Z" fill="#ff6f91" />
      <path d="M 82 44 L 100 30 L 118 44 Z" fill="#ffd23f" opacity={0.7} />
      <circle cx={100} cy={4} r={7} fill="#fff" />
      {[[86, 40], [110, 30], [96, 22]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={2.4} fill="#fff" />
      ))}
    </>
  ),
};

const ACCESSORIES: Record<string, () => ReactNode> = {
  accessory_glasses: () => (
    <>
      <circle cx={84} cy={86} r={11} fill="#bfe8ff" fillOpacity={0.35} stroke={INK} strokeWidth={2.2} />
      <circle cx={116} cy={86} r={11} fill="#bfe8ff" fillOpacity={0.35} stroke={INK} strokeWidth={2.2} />
      <line x1={95} y1={86} x2={105} y2={86} stroke={INK} strokeWidth={2.2} />
      <line x1={73} y1={84} x2={64} y2={80} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
      <line x1={127} y1={84} x2={136} y2={80} stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
    </>
  ),
  accessory_bowtie: () => (
    <>
      <path d="M 86 132 L 100 138 L 86 144 Z" fill="#e63946" />
      <path d="M 114 132 L 100 138 L 114 144 Z" fill="#e63946" />
      <circle cx={100} cy={138} r={4} fill="#c1121f" />
    </>
  ),
  accessory_scarf: () => (
    <>
      <path d="M 78 128 Q 100 144 122 128 Q 122 138 100 148 Q 78 138 78 128 Z" fill="#e63946" />
      <path d="M 96 144 Q 92 168 88 180 L 100 182 Q 100 160 104 144 Z" fill="#c1121f" />
    </>
  ),
  accessory_medal: () => (
    <>
      <path d="M 90 132 L 100 168 L 110 132 Z" fill="#2b5fb0" opacity={0.85} />
      <circle cx={100} cy={176} r={13} fill="#ffd23f" stroke="#e0a800" strokeWidth={2} />
      <circle cx={100} cy={176} r={6} fill="#e0a800" />
    </>
  ),
};

const BACKGROUNDS: Record<string, () => ReactNode> = {
  background_sunny: () => (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#ffe8a3" />
      <circle cx={200} cy={0} r={70} fill="#ffd23f" opacity={0.8} />
      {[0, 45, 90, 135].map((deg) => (
        <rect
          key={deg}
          x={196}
          y={-40}
          width={8}
          height={40}
          fill="#ffd23f"
          opacity={0.5}
          transform={`rotate(${deg} 200 0)`}
        />
      ))}
    </>
  ),
  background_stars: () => (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#22336b" />
      <circle cx={158} cy={38} r={16} fill="#ffe8a3" opacity={0.9} />
      <circle cx={150} cy={34} r={16} fill="#22336b" />
      {[
        [30, 30], [60, 60], [170, 90], [40, 150], [140, 160], [20, 100], [180, 40],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 2 === 0 ? 2.4 : 1.6} fill="#fff" opacity={0.9} />
      ))}
    </>
  ),
  background_rainbow: () => (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#eaf6ff" />
      {["#e63946", "#ffd23f", "#4fb3d9", "#7fbf6a"].map((color, i) => (
        <path
          key={color}
          d={`M ${-20 - i * 16} 210 A ${120 + i * 16} ${120 + i * 16} 0 0 1 ${220 + i * 16} 210`}
          fill="none"
          stroke={color}
          strokeWidth={14}
        />
      ))}
    </>
  ),
  background_forest: () => (
    <>
      <rect x={0} y={0} width={200} height={200} fill="#cdeac0" />
      {[[24, 60], [70, 46], [130, 50], [176, 62]].map(([cx, h], i) => (
        <path key={i} d={`M ${cx} 200 L ${cx - h * 0.4} 200 L ${cx} ${200 - h} L ${cx + h * 0.4} 200 Z`} fill="#4c7d3f" opacity={0.8} />
      ))}
    </>
  ),
};

export interface AvatarEquippedKeys {
  hair?: string;
  eyes?: string;
  clothes?: string;
  hat?: string;
  accessory?: string;
  background?: string;
  // Room-decoration slots ride along on the same type as the character
  // slots above — both come from one getEquippedKeys() DB round trip, and
  // AvatarCharacter simply ignores whichever fields it doesn't render.
  wallpaper?: string;
  floor?: string;
  furniture?: string;
}

interface AvatarCharacterProps {
  equippedKeys: AvatarEquippedKeys;
  mood?: AvatarMood;
  size?: number;
  className?: string;
  animated?: boolean;
}

const DEFAULTS: Required<Pick<AvatarEquippedKeys, "hair" | "eyes" | "clothes" | "background">> = {
  hair: "hair_brown",
  eyes: "eyes_round",
  clothes: "clothes_tshirt",
  background: "background_sunny",
};

export function AvatarCharacter({
  equippedKeys,
  mood = "neutral",
  size = 96,
  className = "",
  animated = false,
}: AvatarCharacterProps) {
  const clipId = useSvgId("avatar-clip");

  const hairKey = equippedKeys.hair ?? DEFAULTS.hair;
  const eyesKey = equippedKeys.eyes ?? DEFAULTS.eyes;
  const clothesKey = equippedKeys.clothes ?? DEFAULTS.clothes;
  const backgroundKey = equippedKeys.background ?? DEFAULTS.background;
  const hatKey = equippedKeys.hat;
  const accessoryKey = equippedKeys.accessory;

  const renderHair = HAIR[hairKey] ?? HAIR[DEFAULTS.hair];
  const renderEyes = EYES[eyesKey] ?? EYES[DEFAULTS.eyes];
  const renderClothes = CLOTHES[clothesKey] ?? CLOTHES[DEFAULTS.clothes];
  const renderBackground = BACKGROUNDS[backgroundKey] ?? BACKGROUNDS[DEFAULTS.background];
  const renderHat = hatKey ? HATS[hatKey] : null;
  const renderAccessory = accessoryKey ? ACCESSORIES[accessoryKey] : null;

  const Wrapper = animated ? motion.g : "g";
  const wrapperProps = animated
    ? {
        animate:
          mood === "happy"
            ? { y: [0, -4, 0], rotate: [-1.5, 1.5, -1.5] }
            : mood === "sad"
              ? { y: [0, 1, 0], rotate: [1, -1, 1] }
              : { y: 0, rotate: 0 },
        transition: {
          duration: mood === "neutral" ? 0.3 : 1.4,
          repeat: mood === "neutral" ? 0 : Infinity,
          ease: "easeInOut" as const,
        },
      }
    : {};

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
      <defs>
        <clipPath id={clipId}>
          <circle cx={100} cy={100} r={98} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {renderBackground()}
        <Wrapper {...wrapperProps}>
          {renderClothes()}
          <ellipse cx={100} cy={124} rx={15} ry={13} fill={SKIN} />
          <circle cx={100} cy={88} r={42} fill={SKIN} />
          {renderHair()}
          {renderEyes(mood)}
          <Brows mood={mood} />
          <Mouth mood={mood} />
          {renderAccessory?.()}
          {renderHat?.()}
        </Wrapper>
      </g>
      <circle cx={100} cy={100} r={97} fill="none" stroke="#00000014" strokeWidth={3} />
    </svg>
  );
}
