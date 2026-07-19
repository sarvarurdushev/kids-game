"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useSvgId } from "@/components/creatures/primitives";

export type AvatarSlot = "hair" | "eyes" | "clothes" | "hat" | "accessory" | "background";
export type AvatarMood = "neutral" | "happy" | "sad";

const INK = "#2d2a26";

function Mouth({ mood }: { mood: AvatarMood }) {
  if (mood === "happy") {
    return (
      <path
        d="M 86 108 Q 100 122 114 108"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  if (mood === "sad") {
    return (
      <path
        d="M 88 114 Q 100 106 112 114"
        stroke={INK}
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  return (
    <path
      d="M 90 108 Q 100 114 110 108"
      stroke={INK}
      strokeWidth={2.5}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function FaceDetails({ noseColor = "#f4869a" }: { noseColor?: string }) {
  return (
    <>
      <path d="M 100 96 L 94 103 L 106 103 Z" fill={noseColor} />
      {[-1, 1].map((side) =>
        [0, 1].map((i) => (
          <line
            key={`${side}-${i}`}
            x1={100 + side * 14}
            y1={103 + i * 3}
            x2={100 + side * 34}
            y2={100 + i * 6}
            stroke="#fff"
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        ))
      )}
    </>
  );
}

const EYE_COLORS: Record<string, string> = {
  eyes_round: "#4a7a3f",
  eyes_sparkle: "#2f6fa8",
  eyes_star: "#ffb703",
};

const EYES: Record<string, () => ReactNode> = {
  eyes_round: () => (
    <>
      {[84, 116].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={86} r={9} fill="#fff" />
          <circle cx={cx} cy={87} r={5.5} fill={EYE_COLORS.eyes_round} />
          <circle cx={cx} cy={87} r={2.6} fill={INK} />
          <circle cx={cx - 2} cy={84} r={1.8} fill="#fff" />
        </g>
      ))}
    </>
  ),
  eyes_sparkle: () => (
    <>
      {[84, 116].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={86} r={10} fill="#fff" />
          <circle cx={cx} cy={87} r={6.2} fill={EYE_COLORS.eyes_sparkle} />
          <circle cx={cx} cy={87} r={2.8} fill={INK} />
          <circle cx={cx - 2.4} cy={83.5} r={2.1} fill="#fff" />
          <circle cx={cx + 2.6} cy={90} r={1.1} fill="#fff" />
        </g>
      ))}
    </>
  ),
  eyes_star: () => {
    const star = (cx: number, cy: number) =>
      `M ${cx} ${cy - 7} L ${cx + 2.1} ${cy - 2.1} L ${cx + 7} ${cy} L ${cx + 2.1} ${cy + 2.1} L ${cx} ${cy + 7} L ${cx - 2.1} ${cy + 2.1} L ${cx - 7} ${cy} L ${cx - 2.1} ${cy - 2.1} Z`;
    return (
      <>
        {[84, 116].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={86} r={9.5} fill="#fff" stroke={INK} strokeWidth={1.2} />
            <path d={star(cx, 87)} fill={EYE_COLORS.eyes_star} />
          </g>
        ))}
      </>
    );
  },
};

// Ear silhouette varies by species (dog/rabbit/fox/bear get their own
// shape); the two colors passed in still come from whichever "fur" is
// equipped, so a dog can be drawn in any fur color/pattern, just with
// dog-shaped ears. Drawn behind the head circle (painted afterwards in
// AvatarCharacter), so only each shape's tip needs to clear the head disk —
// bases don't need to line up precisely.
const SPECIES_EARS: Record<string, (furColor: string, innerColor: string) => ReactNode> = {
  species_cat: (furColor, innerColor) => (
    <>
      <path d="M 60 60 L 46 18 L 82 48 Z" fill={furColor} />
      <path d="M 65 54 L 55 28 L 76 46 Z" fill={innerColor} />
      <path d="M 140 60 L 154 18 L 118 48 Z" fill={furColor} />
      <path d="M 135 54 L 145 28 L 124 46 Z" fill={innerColor} />
    </>
  ),
  species_dog: (furColor, innerColor) => (
    <>
      <path d="M 56 58 Q 34 78 42 112 Q 54 122 66 104 Q 70 80 64 60 Z" fill={furColor} />
      <path d="M 58 68 Q 46 82 50 104 Q 57 110 62 98 Q 64 82 60 70 Z" fill={innerColor} />
      <path d="M 144 58 Q 166 78 158 112 Q 146 122 134 104 Q 130 80 136 60 Z" fill={furColor} />
      <path d="M 142 68 Q 154 82 150 104 Q 143 110 138 98 Q 136 82 140 70 Z" fill={innerColor} />
    </>
  ),
  species_rabbit: (furColor, innerColor) => (
    <>
      <path d="M 74 66 Q 64 34 78 8 Q 92 34 84 66 Z" fill={furColor} />
      <path d="M 77 62 Q 71 36 79 16 Q 87 36 82 62 Z" fill={innerColor} />
      <path d="M 126 66 Q 136 34 122 8 Q 108 34 116 66 Z" fill={furColor} />
      <path d="M 123 62 Q 129 36 121 16 Q 113 36 118 62 Z" fill={innerColor} />
    </>
  ),
  species_fox: (furColor, innerColor) => (
    <>
      <path d="M 56 62 L 38 30 L 80 46 Z" fill={furColor} />
      <path d="M 54 56 L 44 36 L 74 46 Z" fill={innerColor} />
      <path d="M 44 36 L 38 30 L 50 40 Z" fill={INK} opacity={0.7} />
      <path d="M 144 62 L 162 30 L 120 46 Z" fill={furColor} />
      <path d="M 146 56 L 156 36 L 126 46 Z" fill={innerColor} />
      <path d="M 156 36 L 162 30 L 150 40 Z" fill={INK} opacity={0.7} />
    </>
  ),
  species_bear: (furColor, innerColor) => (
    <>
      <circle cx={58} cy={52} r={16} fill={furColor} />
      <circle cx={60} cy={54} r={9} fill={innerColor} />
      <circle cx={142} cy={52} r={16} fill={furColor} />
      <circle cx={140} cy={54} r={9} fill={innerColor} />
    </>
  ),
};

const SPECIES_NOSE: Record<string, string> = {
  species_cat: "#f4869a",
  species_dog: "#3d3530",
  species_rabbit: "#f4869a",
  species_fox: "#2d2a26",
  species_bear: "#3d3530",
};

// "Fur" (the old human-hair slot, reused as-is so no schema/economy change was
// needed) — matches the 3D character's coat colors/patterns so the shop
// thumbnails and login picker don't show a different-looking character than
// the live 3D view.
const FUR: Record<string, { color: string; render: (species: string) => ReactNode }> = {
  hair_brown: {
    color: "#e8935a",
    render: (species) => (
      <>
        {(SPECIES_EARS[species] ?? SPECIES_EARS.species_cat)("#e8935a", "#f4b8c4")}
        {[[78, 56], [100, 50], [122, 56]].map(([x, y], i) => (
          <path key={i} d={`M ${x - 8} ${y} Q ${x} ${y - 6} ${x + 8} ${y}`} stroke="#c46a34" strokeWidth={3} fill="none" strokeLinecap="round" />
        ))}
      </>
    ),
  },
  hair_curly: {
    color: "#cdc6d8",
    render: (species) => (
      <>
        {(SPECIES_EARS[species] ?? SPECIES_EARS.species_cat)("#cdc6d8", "#f4b8c4")}
        {[[62, 66, 12], [138, 66, 12], [100, 44, 14], [78, 48, 10], [122, 48, 10]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="#cdc6d8" />
        ))}
      </>
    ),
  },
  hair_spiky: {
    color: "#33302e",
    render: (species) => (
      <>
        {(SPECIES_EARS[species] ?? SPECIES_EARS.species_cat)("#33302e", "#4a4644")}
        <ellipse cx={100} cy={108} rx={26} ry={20} fill="#f5efe4" />
      </>
    ),
  },
};

const CLOTHES: Record<string, () => ReactNode> = {
  clothes_tshirt: () => (
    <>
      <path d="M 44 200 Q 46 144 100 138 Q 154 144 156 200 Z" fill="#4fb3d9" />
      <path d="M 86 140 Q 100 154 114 140 Q 100 148 86 140 Z" fill="#3a92b3" />
    </>
  ),
  clothes_hoodie: () => (
    <>
      <path d="M 44 200 Q 46 142 100 136 Q 154 142 156 200 Z" fill="#33475b" />
      <path d="M 78 146 Q 100 134 122 146 L 118 158 Q 100 148 82 158 Z" fill="#25333f" />
      <rect x={90} y={170} width={20} height={16} rx={4} fill="#25333f" />
    </>
  ),
  clothes_dress: () => (
    <>
      <path d="M 38 200 Q 42 146 100 138 Q 158 146 162 200 Z" fill="#d46fb8" />
      <path d="M 86 140 Q 100 152 114 140 Q 100 146 86 140 Z" fill="#b6549a" />
      <circle cx={100} cy={148} r={4} fill="#fff" opacity={0.85} />
    </>
  ),
  clothes_superhero: () => (
    <>
      <path d="M 48 196 Q 26 156 50 140 Q 44 172 58 192 Z" fill="#2b5fb0" opacity={0.9} />
      <path d="M 152 196 Q 174 156 150 140 Q 156 172 142 192 Z" fill="#2b5fb0" opacity={0.9} />
      <path d="M 44 200 Q 46 144 100 138 Q 154 144 156 200 Z" fill="#e74c3c" />
      <path
        d="M 100 154 L 104 163 L 113 163 L 106 169 L 109 178 L 100 172 L 91 178 L 94 169 L 87 163 L 96 163 Z"
        fill="#ffd23f"
      />
    </>
  ),
};

const HATS: Record<string, () => ReactNode> = {
  hat_cap: () => (
    <>
      <path d="M 60 54 Q 62 22 100 20 Q 138 22 140 54 Q 100 42 60 54 Z" fill="var(--color-teal)" />
      <ellipse cx={130} cy={52} rx={24} ry={7} fill="var(--color-teal)" transform="rotate(-8 130 52)" />
    </>
  ),
  hat_wizard: () => (
    <>
      <ellipse cx={100} cy={40} rx={40} ry={9} fill="#6a3fb5" />
      <path d="M 70 40 L 100 -8 L 130 40 Z" fill="#7c4fc9" />
      <path
        d="M 100 -8 L 102.3 -3.6 L 107.2 -3.6 L 103.4 -1 L 104.8 3.4 L 100 0.6 L 95.2 3.4 L 96.6 -1 L 92.8 -3.6 L 97.7 -3.6 Z"
        fill="#ffd23f"
      />
    </>
  ),
  hat_crown: () => (
    <>
      <path
        d="M 64 50 L 70 26 L 85 41 L 100 20 L 115 41 L 130 26 L 136 50 Z"
        fill="#ffd23f"
        stroke="#e0a800"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle cx={100} cy={36} r={3.6} fill="#e63946" />
    </>
  ),
  hat_party: () => (
    <>
      <path d="M 80 50 L 100 8 L 120 50 Z" fill="#ff6f91" />
      <circle cx={100} cy={6} r={6.5} fill="#fff" />
      {[[88, 40], [110, 32], [98, 24]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={2.2} fill="#fff" />
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
    </>
  ),
  accessory_bowtie: () => (
    <>
      <path d="M 86 140 L 100 146 L 86 152 Z" fill="#e63946" />
      <path d="M 114 140 L 100 146 L 114 152 Z" fill="#e63946" />
      <circle cx={100} cy={146} r={4} fill="#c1121f" />
    </>
  ),
  accessory_scarf: () => (
    <>
      <path d="M 78 136 Q 100 150 122 136 Q 122 146 100 154 Q 78 146 78 136 Z" fill="#e63946" />
    </>
  ),
  accessory_medal: () => (
    <>
      <path d="M 92 140 L 100 172 L 108 140 Z" fill="#2b5fb0" opacity={0.85} />
      <circle cx={100} cy={178} r={12} fill="#ffd23f" stroke="#e0a800" strokeWidth={2} />
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
  // Only "species_cat" has a real renderer today. The other species are
  // seeded with active:false (scripts/seed.ts) so they can't be owned or
  // equipped yet — this field exists so the type is ready for them once
  // their rendering is built.
  species?: string;
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

  const speciesKey = equippedKeys.species ?? "species_cat";
  const furKey = equippedKeys.hair ?? DEFAULTS.hair;
  const eyesKey = equippedKeys.eyes ?? DEFAULTS.eyes;
  const clothesKey = equippedKeys.clothes ?? DEFAULTS.clothes;
  const backgroundKey = equippedKeys.background ?? DEFAULTS.background;
  const hatKey = equippedKeys.hat;
  const accessoryKey = equippedKeys.accessory;

  const noseColor = SPECIES_NOSE[speciesKey] ?? SPECIES_NOSE.species_cat;
  const fur = FUR[furKey] ?? FUR[DEFAULTS.hair];
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
          <ellipse cx={100} cy={126} rx={16} ry={13} fill={fur.color} />
          {fur.render(speciesKey)}
          <circle cx={100} cy={88} r={40} fill={fur.color} />
          {renderEyes()}
          <FaceDetails noseColor={noseColor} />
          <Mouth mood={mood} />
          {renderAccessory?.()}
          {renderHat?.()}
        </Wrapper>
      </g>
      <circle cx={100} cy={100} r={97} fill="none" stroke="#00000014" strokeWidth={3} />
    </svg>
  );
}
