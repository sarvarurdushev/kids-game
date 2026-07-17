"use client";

import type { ReactNode } from "react";
import type { Rarity } from "@/lib/reward-engine/types";
import {
  Face,
  GroundShadow,
  LegendarySparkles,
  PaletteGradient,
  RarityAura,
  StubArm,
  StubLeg,
  ToothyMouth,
  Wing,
  useSvgId,
} from "./primitives";

interface Palette {
  light: string;
  mid: string;
  dark: string;
}

interface CreatureDef {
  palette: Palette;
  render: (gradId: string) => ReactNode;
}

const BODY = (gradId: string, r = 55, cx = 100, cy = 100) => (
  <circle cx={cx} cy={cy} r={r} fill={`url(#${gradId})`} />
);

const CREATURES: Record<string, CreatureDef> = {
  // ---------------------------------------------------------------- OCEAN
  dolphin: {
    palette: { light: "#e3f8ff", mid: "#7dd3e8", dark: "#3a9bc4" },
    render: (g) => (
      <>
        <path d="M 100 46 Q 92 32 100 22 Q 108 32 100 46 Z" fill="#3a9bc4" opacity={0.85} />
        {BODY(g)}
        <ellipse cx={100} cy={122} rx={28} ry={19} fill="#f0fbff" opacity={0.85} />
        <StubArm side="left" color="#3a9bc4" />
        <StubArm side="right" color="#3a9bc4" />
        <ellipse cx={100} cy={148} rx={19} ry={13} fill="#f0fbff" />
        <path d="M 88 146 Q 100 156 112 146" stroke="#2d2a26" strokeWidth={3} strokeLinecap="round" fill="none" />
        <Face cy={90} showMouth={false} />
      </>
    ),
  },
  turtle: {
    palette: { light: "#e4f2d8", mid: "#7fbf6a", dark: "#4c7d3f" },
    render: (g) => (
      <>
        <StubLeg side="left" color="#4c7d3f" />
        <StubLeg side="right" color="#4c7d3f" />
        {BODY(g, 56)}
        <path d="M 68 88 L 100 76 L 132 88 L 122 116 L 100 128 L 78 116 Z" fill="none" stroke="#4c7d3f" strokeWidth={2.5} opacity={0.5} />
        <Face cy={100} mouthCy={124} />
      </>
    ),
  },
  octopus: {
    palette: { light: "#efe0fb", mid: "#b98fe0", dark: "#8a5fc2" },
    render: (g) => (
      <>
        {[-36, -18, 18, 36].map((dx, i) => (
          <path
            key={i}
            d={`M ${100 + dx} 140 Q ${100 + dx * 1.4} 165 ${100 + dx * 0.6} 178`}
            stroke="#8a5fc2"
            strokeWidth={12}
            strokeLinecap="round"
            fill="none"
          />
        ))}
        {BODY(g, 52, 100, 92)}
        <Face cy={84} eyeSize={9} mouthCy={108} />
      </>
    ),
  },
  shark: {
    palette: { light: "#eef2f5", mid: "#93a5b8", dark: "#5c6f82" },
    render: (g) => (
      <>
        <path d="M 100 42 Q 88 20 104 12 Q 112 28 100 42 Z" fill="#5c6f82" />
        <path d="M 44 108 Q 20 100 14 116 Q 32 122 48 118 Z" fill="#5c6f82" />
        <path d="M 156 108 Q 180 100 186 116 Q 168 122 152 118 Z" fill="#5c6f82" />
        {BODY(g)}
        <ellipse cx={100} cy={132} rx={24} ry={14} fill="#f5f8fa" opacity={0.85} />
        <Face cy={90} showMouth={false} />
        <ToothyMouth cy={112} width={11} />
      </>
    ),
  },
  whale: {
    palette: { light: "#eaf2fb", mid: "#5f8fc7", dark: "#3c5f8a" },
    render: (g) => (
      <>
        <RarityAura rarity="legendary" />
        <LegendarySparkles />
        <ellipse cx={100} cy={34} rx={5} ry={9} fill="#3c5f8a" />
        <path d="M 92 24 Q 90 12 86 6 M 100 22 Q 100 10 100 2 M 108 24 Q 110 12 114 6" stroke="#9cc3e8" strokeWidth={3} strokeLinecap="round" />
        {BODY(g, 60)}
        <ellipse cx={100} cy={138} rx={30} ry={17} fill="#f2f8ff" opacity={0.85} />
        <StubArm side="left" color="#3c5f8a" />
        <StubArm side="right" color="#3c5f8a" />
        <Face cy={94} eyeSize={9} mouthCy={122} />
      </>
    ),
  },

  // ------------------------------------------------------------- DINOSAUR
  triceratops: {
    palette: { light: "#e5f3df", mid: "#7fbf6a", dark: "#4f8c3f" },
    render: (g) => (
      <>
        <circle cx={100} cy={100} r={64} fill="#dfd3a0" />
        {BODY(g, 55)}
        <path d="M 79 72 Q 62 58 53 32 Q 70 44 85 64 Z" fill="#f0e6c8" stroke="#c9b378" strokeWidth={1} />
        <path d="M 121 72 Q 138 58 147 32 Q 130 44 115 64 Z" fill="#f0e6c8" stroke="#c9b378" strokeWidth={1} />
        <path d="M 94 66 Q 92 52 100 40 Q 108 52 106 66 Z" fill="#f0e6c8" stroke="#c9b378" strokeWidth={1} />
        <StubLeg side="left" color="#4f8c3f" />
        <StubLeg side="right" color="#4f8c3f" />
        <Face cy={96} mouthCy={118} />
      </>
    ),
  },
  stegosaurus: {
    palette: { light: "#e0f3ee", mid: "#6fbfa0", dark: "#3f8c6f" },
    render: (g) => (
      <>
        {[-40, -18, 6, 30].map((dx, i) => (
          <path
            key={i}
            d={`M ${100 + dx} 58 L ${100 + dx - 10} 30 L ${100 + dx + 10} 30 Z`}
            fill={i % 2 === 0 ? "var(--color-gk-coral)" : "#e0704a"}
            opacity={0.85}
          />
        ))}
        {BODY(g)}
        <StubLeg side="left" color="#3f8c6f" />
        <StubLeg side="right" color="#3f8c6f" />
        <Face cy={96} mouthCy={118} />
      </>
    ),
  },
  pterodactyl: {
    palette: { light: "#f6e8d8", mid: "#d99a5b", dark: "#a8672f" },
    render: (g) => (
      <>
        <Wing side="left" color="#a8672f" width={58} height={78} originX={62} originY={90} />
        <Wing side="right" color="#a8672f" width={58} height={78} originX={138} originY={90} />
        <RarityAura rarity="epic" />
        {BODY(g, 48)}
        <path d="M 100 58 Q 96 40 88 32 Q 100 34 106 46 Z" fill="#a8672f" />
        <path d="M 78 96 L 58 100 L 78 106 Z" fill="#8a5323" />
        <Face cy={90} eyeSize={7} mouthCy={106} mouthWidth={9} />
      </>
    ),
  },
  t_rex: {
    palette: { light: "#e3f0dd", mid: "#5a9450", dark: "#396b30" },
    render: (g) => (
      <>
        <RarityAura rarity="legendary" />
        <LegendarySparkles />
        {BODY(g, 58)}
        <StubArm side="left" color="#396b30" raised={false} />
        <StubArm side="right" color="#396b30" raised={false} />
        <StubLeg side="left" color="#396b30" />
        <StubLeg side="right" color="#396b30" />
        <Face cy={92} eyeSize={9} showMouth={false} />
        <ToothyMouth cy={118} width={16} />
      </>
    ),
  },

  // ----------------------------------------------------------------- SPACE
  space_cat: {
    palette: { light: "#f2e8fb", mid: "#c9a8e8", dark: "#9a6fc2" },
    render: (g) => (
      <>
        <path d="M 60 60 L 50 24 L 84 52 Z" fill="#c9a8e8" />
        <path d="M 140 60 L 150 24 L 116 52 Z" fill="#c9a8e8" />
        <path d="M 130 150 Q 168 156 162 126" stroke="#9a6fc2" strokeWidth={8} strokeLinecap="round" fill="none" />
        {BODY(g)}
        {[0, 1].map((i) => (
          <g key={i}>
            <line x1={70 - i * 4} y1={104 + i * 6} x2={38} y2={98 + i * 10} stroke="#9a6fc2" strokeWidth={1.6} />
            <line x1={130 + i * 4} y1={104 + i * 6} x2={162} y2={98 + i * 10} stroke="#9a6fc2" strokeWidth={1.6} />
          </g>
        ))}
        <Face cy={92} mouthCy={114} />
      </>
    ),
  },
  astronaut: {
    palette: { light: "#ffffff", mid: "#f2efe8", dark: "#c7c2b5" },
    render: (g) => (
      <>
        <rect x={70} y={140} width={60} height={34} rx={14} fill="#e3ddcf" />
        <rect x={64} y={144} width={16} height={20} rx={6} fill="#c7c2b5" />
        <rect x={120} y={144} width={16} height={20} rx={6} fill="#c7c2b5" />
        {BODY(g)}
        <circle cx={100} cy={98} r={40} fill="#8fc7e8" opacity={0.55} />
        <path d="M 78 78 L 82 74 M 90 72 L 94 68" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        <Face cy={98} mouthCy={118} />
      </>
    ),
  },
  alien: {
    palette: { light: "#eaf9e6", mid: "#8fd48a", dark: "#5aa855" },
    render: (g) => (
      <>
        <path d="M 82 44 Q 76 20 66 12" stroke="#5aa855" strokeWidth={3} strokeLinecap="round" fill="none" />
        <path d="M 118 44 Q 124 20 134 12" stroke="#5aa855" strokeWidth={3} strokeLinecap="round" fill="none" />
        <circle cx={66} cy={12} r={5} fill="#5aa855" />
        <circle cx={134} cy={12} r={5} fill="#5aa855" />
        <ellipse cx={100} cy={100} rx={48} ry={58} fill={`url(#${g})`} />
        <StubArm side="left" color="#5aa855" />
        <StubArm side="right" color="#5aa855" />
        <Face cy={94} eyeSize={12} variant="big" mouthCy={126} mouthWidth={9} />
      </>
    ),
  },
  rocket_robot: {
    palette: { light: "#eef2f7", mid: "#b8c4d4", dark: "#7d8fa3" },
    render: (g) => (
      <>
        <RarityAura rarity="legendary" />
        <LegendarySparkles />
        <line x1={100} y1={40} x2={100} y2={22} stroke="#7d8fa3" strokeWidth={3} />
        <circle cx={100} cy={18} r={6} fill="var(--color-gk-coral)" />
        <rect x={48} y={48} width={104} height={104} rx={26} fill={`url(#${g})`} />
        <rect x={64} y={130} width={20} height={14} rx={4} fill="#7d8fa3" />
        <rect x={116} y={130} width={20} height={14} rx={4} fill="#7d8fa3" />
        <path d="M 70 158 L 78 176 L 62 176 Z" fill="var(--color-gk-gold)" />
        <path d="M 130 158 L 138 176 L 122 176 Z" fill="var(--color-gk-gold)" />
        <Face cy={92} variant="led" mouthCy={118} mouthWidth={10} />
      </>
    ),
  },

  // ----------------------------------------------------------------- STORY
  fairy: {
    palette: { light: "#fdeaf3", mid: "#f2a6c8", dark: "#d4709f" },
    render: (g) => (
      <>
        <Wing side="left" color="#fbd7e8" width={44} height={56} originX={64} originY={92} opacity={0.75} />
        <Wing side="right" color="#fbd7e8" width={44} height={56} originX={136} originY={92} opacity={0.75} />
        <path d="M 100 30 Q 96 16 100 6" stroke="#d4709f" strokeWidth={3} strokeLinecap="round" fill="none" />
        <path d="M 100 6 L 96 -2 L 104 -2 Z" fill="var(--color-gk-gold)" transform="translate(0,10)" />
        {BODY(g, 46)}
        <path d="M 150 130 L 172 110" stroke="#c98a3f" strokeWidth={4} strokeLinecap="round" />
        <path d="M 172 110 L 178 100 L 182 112 L 172 110 Z" fill="var(--color-gk-gold)" />
        <Face cy={88} mouthCy={106} mouthWidth={10} />
      </>
    ),
  },
  knight: {
    palette: { light: "#eef1f3", mid: "#c7ccd1", dark: "#8f96a0" },
    render: (g) => (
      <>
        <circle cx={58} cy={132} r={13} fill="#c7ccd1" stroke="#8f96a0" strokeWidth={1.5} />
        <circle cx={142} cy={132} r={13} fill="#c7ccd1" stroke="#8f96a0" strokeWidth={1.5} />
        {BODY(g)}
        <path d="M 62 90 Q 60 32 100 26 Q 140 32 138 90 Z" fill="#c7ccd1" stroke="#8f96a0" strokeWidth={2} />
        <path d="M 100 26 Q 96 8 100 -4 Q 106 8 100 26 Z" fill="var(--color-gk-coral)" />
        <rect x={96} y={86} width={8} height={20} rx={2} fill="#8f96a0" />
        <Face cy={98} mouthCy={120} />
      </>
    ),
  },
  wizard: {
    palette: { light: "#e9e0f7", mid: "#8a6fc2", dark: "#5f4390" },
    render: (g) => (
      <>
        <RarityAura rarity="epic" />
        <path d="M 100 8 L 60 68 L 140 68 Z" fill="#5f4390" />
        <path d="M 100 8 L 96 -2 L 104 -2 Z" fill="var(--color-gk-gold)" transform="translate(0,4)" />
        <circle cx={78} cy={40} r={2.4} fill="var(--color-gk-gold)" />
        <circle cx={118} cy={30} r={2} fill="var(--color-gk-gold)" />
        {BODY(g, 55, 100, 104)}
        <path d="M 80 132 Q 100 146 120 132" stroke="#f2efe8" strokeWidth={6} strokeLinecap="round" fill="none" />
        <Face cy={98} mouthCy={120} />
      </>
    ),
  },
  dragon: {
    palette: { light: "#fbe3d8", mid: "#e0704a", dark: "#b8492a" },
    render: (g) => (
      <>
        <RarityAura rarity="legendary" />
        <LegendarySparkles />
        <Wing side="left" color="#c25a36" width={54} height={70} originX={58} originY={92} />
        <Wing side="right" color="#c25a36" width={54} height={70} originX={142} originY={92} />
        <path d="M 82 52 Q 78 34 70 26 M 118 52 Q 122 34 130 26" stroke="#b8492a" strokeWidth={5} strokeLinecap="round" fill="none" />
        {BODY(g)}
        <path d="M 128 148 Q 150 150 156 168 Q 166 162 160 148" fill="#e0704a" />
        <Face cy={94} mouthCy={118} showMouth={false} />
        <ToothyMouth cy={116} width={10} />
      </>
    ),
  },

  // ------------------------------------------------------------- DISCOVERY
  explorer: {
    palette: { light: "#f4ecd6", mid: "#d9c08a", dark: "#b39a5f" },
    render: (g) => (
      <>
        <ellipse cx={100} cy={54} rx={48} ry={14} fill="#b39a5f" />
        <ellipse cx={100} cy={44} rx={28} ry={16} fill="#c9b378" />
        {BODY(g, 52, 100, 104)}
        <circle cx={76} cy={130} r={9} fill="#8a744a" />
        <circle cx={124} cy={130} r={9} fill="#8a744a" />
        <line x1={85} y1={130} x2={115} y2={130} stroke="#8a744a" strokeWidth={3} />
        <Face cy={96} mouthCy={118} />
      </>
    ),
  },
  scientist: {
    palette: { light: "#ffffff", mid: "#f0f0ee", dark: "#c7c4bd" },
    render: (g) => (
      <>
        <ellipse cx={100} cy={48} rx={22} ry={16} fill="#5a4632" />
        {BODY(g, 54, 100, 104)}
        <path d="M 70 100 Q 100 92 130 100" stroke="#2d2a26" strokeWidth={2.4} fill="none" />
        <circle cx={82} cy={100} r={11} fill="none" stroke="#2d2a26" strokeWidth={2.4} />
        <circle cx={118} cy={100} r={11} fill="none" stroke="#2d2a26" strokeWidth={2.4} />
        <rect x={150} y={128} width={12} height={26} rx={3} fill="#8fd4e0" opacity={0.8} />
        <Face cy={100} eyeSize={6} mouthCy={120} />
      </>
    ),
  },
  inventor: {
    palette: { light: "#fbe9d0", mid: "#e8a84f", dark: "#c2831f" },
    render: (g) => (
      <>
        <RarityAura rarity="epic" />
        <circle cx={100} cy={30} r={12} fill="#fff3c4" stroke="var(--color-gk-gold)" strokeWidth={2} />
        <line x1={100} y1={42} x2={100} y2={54} stroke="#c2831f" strokeWidth={3} />
        {BODY(g, 54, 100, 104)}
        <circle cx={82} cy={92} r={10} fill="none" stroke="#5a4632" strokeWidth={3} />
        <circle cx={118} cy={92} r={10} fill="none" stroke="#5a4632" strokeWidth={3} />
        <line x1={92} y1={92} x2={108} y2={92} stroke="#5a4632" strokeWidth={3} />
        <Face cy={100} eyeSize={6} mouthCy={122} />
      </>
    ),
  },
  archaeologist: {
    palette: { light: "#f1e0cf", mid: "#c2916a", dark: "#96694a" },
    render: (g) => (
      <>
        <RarityAura rarity="legendary" />
        <LegendarySparkles />
        <ellipse cx={100} cy={52} rx={46} ry={13} fill="#96694a" />
        <ellipse cx={100} cy={42} rx={26} ry={15} fill="#ad7d59" />
        {BODY(g, 52, 100, 104)}
        <rect x={140} y={116} width={16} height={20} rx={3} fill="#8a5f3f" />
        <line x1={148} y1={108} x2={148} y2={118} stroke="#5a4632" strokeWidth={3} strokeLinecap="round" />
        <Face cy={96} mouthCy={118} />
      </>
    ),
  },
};

export interface CreatureArtProps {
  characterKey: string;
  rarity: Rarity;
  size?: number;
  className?: string;
}

export function CreatureArt({ characterKey, rarity, size = 100, className = "" }: CreatureArtProps) {
  const gradId = useSvgId("creature-grad");
  const def = CREATURES[characterKey];

  if (!def) {
    return (
      <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
        <circle cx={100} cy={100} r={55} fill="var(--color-rarity-common)" opacity={0.5} />
        <text x={100} y={112} textAnchor="middle" fontSize={40}>
          ?
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className}>
      <defs>
        <PaletteGradient id={gradId} light={def.palette.light} mid={def.palette.mid} dark={def.palette.dark} />
      </defs>
      <GroundShadow />
      {(rarity === "epic" || rarity === "legendary") && !NO_DOUBLE_AURA.has(characterKey) && (
        <RarityAura rarity={rarity} />
      )}
      {def.render(gradId)}
    </svg>
  );
}

// A few creatures already draw their own aura inline (so it layers correctly
// behind wings/accessories instead of on top of everything); avoid double-drawing it.
const NO_DOUBLE_AURA = new Set([
  "whale",
  "t_rex",
  "pterodactyl",
  "rocket_robot",
  "wizard",
  "dragon",
  "inventor",
  "archaeologist",
]);
