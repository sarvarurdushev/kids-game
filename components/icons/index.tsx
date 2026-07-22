"use client";

import { motion } from "motion/react";
import { useSvgId } from "@/components/creatures/primitives";

export function CoinIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  const id = useSvgId("coin");
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="55%" stopColor="var(--color-gk-gold)" />
          <stop offset="100%" stopColor="var(--color-gk-gold-dark)" />
        </radialGradient>
      </defs>
      <circle cx={24} cy={24} r={21} fill="var(--color-gk-gold-dark)" />
      <circle cx={24} cy={23} r={19} fill={`url(#${id})`} />
      <path
        d="M 24 12 A 11 11 0 0 0 13 23"
        stroke="#fff3c4"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
        opacity={0.7}
      />
      <text x={24} y={30} textAnchor="middle" fontSize={17} fontWeight={800} fill="#a8710a" fontFamily="var(--font-display)">
        G
      </text>
    </svg>
  );
}

export function FlameIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  const id = useSvgId("flame");
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffd76a" />
          <stop offset="55%" stopColor="var(--color-gk-coral)" />
          <stop offset="100%" stopColor="#c23b1f" />
        </linearGradient>
      </defs>
      <path
        d="M 24 4 C 30 14 36 18 32 28 C 38 26 40 34 34 40 C 38 34 32 32 30 36 C 30 30 24 30 24 36 C 20 30 26 28 22 24 C 16 30 10 36 16 42 C 6 38 6 24 14 16 C 14 22 18 22 18 18 C 18 12 22 8 24 4 Z"
        fill={`url(#${id})`}
      />
    </svg>
  );
}

export function StarIcon({ size = 24, className = "", color = "var(--color-gk-gold)" }: { size?: number; className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      <path
        d="M24 4 L29.5 18 L44 19 L32.5 28.5 L36.5 43 L24 34.5 L11.5 43 L15.5 28.5 L4 19 L18.5 18 Z"
        fill={color}
      />
    </svg>
  );
}

export function ChestIcon({
  size = 64,
  className = "",
  open = false,
}: {
  size?: number;
  className?: string;
  open?: boolean;
}) {
  const id = useSvgId("chest");
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#c98a4a" />
          <stop offset="100%" stopColor="#9c6530" />
        </linearGradient>
      </defs>

      {open && (
        <motion.circle
          cx={60}
          cy={40}
          r={30}
          fill="#fff3c4"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0.9, 0], scale: [0.5, 1.8] }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      )}

      <rect x={16} y={62} width={88} height={44} rx={8} fill={`url(#${id})`} stroke="#6b4420" strokeWidth={2} />
      <rect x={16} y={78} width={88} height={8} fill="#6b4420" opacity={0.5} />
      <circle cx={60} cy={82} r={7} fill="var(--color-gk-gold)" stroke="#6b4420" strokeWidth={1.5} />

      <motion.g
        style={{ transformOrigin: "60px 62px" }}
        animate={open ? { rotate: -35, y: -6 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <path d="M 16 62 Q 16 30 60 30 Q 104 30 104 62 Z" fill={`url(#${id})`} stroke="#6b4420" strokeWidth={2} />
        <path d="M 16 62 Q 16 44 60 44 Q 104 44 104 62 Z" fill="#b57a3f" opacity={0.6} />
      </motion.g>
    </svg>
  );
}

export function GameControllerIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  const id = useSvgId("controller");
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-teal)" />
          <stop offset="100%" stopColor="#2a7d8c" />
        </linearGradient>
      </defs>
      <path
        d="M 12 18 Q 4 18 4 28 Q 4 38 11 38 Q 15 38 17 32 L 31 32 Q 33 38 37 38 Q 44 38 44 28 Q 44 18 36 18 Z"
        fill={`url(#${id})`}
      />
      <rect x={11} y={25} width={3} height={9} rx={1.4} fill="#eafaff" />
      <rect x={7.5} y={28.5} width={9} height={3} rx={1.4} fill="#eafaff" />
      <circle cx={33} cy={24} r={2.6} fill="#eafaff" />
      <circle cx={39} cy={28} r={2.6} fill="#eafaff" />
    </svg>
  );
}

export function WordCatchIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const id = useSvgId("catch");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe8a3" />
          <stop offset="100%" stopColor="var(--color-gk-gold)" />
        </linearGradient>
      </defs>
      <rect x={38} y={10} width={24} height={24} rx={6} fill={`url(#${id})`} stroke="#2d2a26" strokeWidth={2} />
      <text x={50} y={28} textAnchor="middle" fontSize={16} fontWeight={800} fill="#2d2a26">
        A
      </text>
      <line x1={50} y1={36} x2={50} y2={54} stroke="#2d2a26" strokeWidth={2} strokeDasharray="3 4" opacity={0.5} />
      <path d="M 18 62 Q 50 84 82 62 L 74 88 Q 50 96 26 88 Z" fill="var(--color-teal)" stroke="#2d2a26" strokeWidth={2} strokeLinejoin="round" />
      <path d="M 18 62 Q 50 74 82 62" fill="none" stroke="#2d2a26" strokeWidth={2} />
    </svg>
  );
}

export function MemoryMatchIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const idA = useSvgId("matchA");
  const idB = useSvgId("matchB");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={idA} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffb3c6" />
          <stop offset="100%" stopColor="var(--color-gk-coral)" />
        </linearGradient>
        <linearGradient id={idB} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bfe8ff" />
          <stop offset="100%" stopColor="var(--color-teal)" />
        </linearGradient>
      </defs>
      <rect x={16} y={30} width={38} height={50} rx={8} fill={`url(#${idA})`} stroke="#2d2a26" strokeWidth={2} transform="rotate(-8 35 55)" />
      <rect x={46} y={26} width={38} height={50} rx={8} fill={`url(#${idB})`} stroke="#2d2a26" strokeWidth={2} transform="rotate(6 65 51)" />
      <path d="M 56 46 L 62 54 L 74 40" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function WordScrambleIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const colors = ["#ffd23f", "var(--color-teal)", "var(--color-gk-coral)"];
  const letters = ["W", "O", "N"];
  const transforms = ["rotate(-12 30 40)", "rotate(10 55 30)", "rotate(-6 76 55)"];
  const positions: [number, number][] = [
    [16, 26],
    [42, 16],
    [62, 40],
  ];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      {positions.map(([x, y], i) => (
        <g key={i} transform={transforms[i]}>
          <rect x={x} y={y} width={28} height={28} rx={7} fill={colors[i]} stroke="#2d2a26" strokeWidth={2} />
          <text x={x + 14} y={y + 20} textAnchor="middle" fontSize={15} fontWeight={800} fill="#2d2a26">
            {letters[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function EmojiQuizIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const id = useSvgId("emojiQuiz");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffb3c6" />
          <stop offset="100%" stopColor="var(--color-gk-coral)" />
        </linearGradient>
      </defs>
      <circle cx={38} cy={40} r={26} fill={`url(#${id})`} stroke="#2d2a26" strokeWidth={2} />
      <circle cx={30} cy={34} r={3.5} fill="#2d2a26" />
      <circle cx={46} cy={34} r={3.5} fill="#2d2a26" />
      <path d="M 27 48 Q 38 58 49 48" fill="none" stroke="#2d2a26" strokeWidth={3} strokeLinecap="round" />
      <circle cx={74} cy={64} r={18} fill="#fff8ec" stroke="#2d2a26" strokeWidth={2} />
      <text x={74} y={72} textAnchor="middle" fontSize={22} fontWeight={800} fill="var(--color-gk-gold-dark)">
        ?
      </text>
    </svg>
  );
}

export function PicturePickIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const id = useSvgId("picturePick");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="100%" stopColor="var(--color-gk-gold)" />
        </linearGradient>
      </defs>
      <rect x={18} y={22} width={64} height={50} rx={8} fill={`url(#${id})`} stroke="#2d2a26" strokeWidth={2} />
      <circle cx={34} cy={38} r={6} fill="#fff8ec" stroke="#2d2a26" strokeWidth={1.5} />
      <path d="M 22 66 L 42 46 L 56 60 L 66 50 L 78 62 L 78 68 L 22 68 Z" fill="var(--color-teal)" opacity={0.85} />
      <circle cx={76} cy={30} r={13} fill="#fff8ec" stroke="#2d2a26" strokeWidth={2} />
      <path d="M 70 30 L 74 34 L 82 25" fill="none" stroke="var(--color-teal)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrueOrFalseIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const idA = useSvgId("tofA");
  const idB = useSvgId("tofB");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={idA} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bff2df" />
          <stop offset="100%" stopColor="var(--color-teal)" />
        </linearGradient>
        <linearGradient id={idB} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffb3c6" />
          <stop offset="100%" stopColor="var(--color-gk-coral)" />
        </linearGradient>
      </defs>
      <circle cx={34} cy={50} r={28} fill={`url(#${idA})`} stroke="#2d2a26" strokeWidth={2} />
      <path d="M 22 50 L 30 58 L 46 40" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={74} cy={30} r={17} fill={`url(#${idB})`} stroke="#2d2a26" strokeWidth={2} />
      <path d="M 67 23 L 81 37 M 81 23 L 67 37" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
}

export function OddOneOutIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const idA = useSvgId("oooA");
  const idB = useSvgId("oooB");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={idA} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bfe8ff" />
          <stop offset="100%" stopColor="var(--color-teal)" />
        </linearGradient>
        <linearGradient id={idB} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffb3c6" />
          <stop offset="100%" stopColor="var(--color-gk-coral)" />
        </linearGradient>
      </defs>
      <circle cx={24} cy={30} r={13} fill={`url(#${idA})`} stroke="#2d2a26" strokeWidth={2} />
      <circle cx={58} cy={24} r={13} fill={`url(#${idA})`} stroke="#2d2a26" strokeWidth={2} />
      <circle cx={30} cy={64} r={13} fill={`url(#${idA})`} stroke="#2d2a26" strokeWidth={2} />
      <rect x={57} y={57} width={30} height={30} rx={8} fill={`url(#${idB})`} stroke="#2d2a26" strokeWidth={2.5} transform="rotate(8 72 72)" />
    </svg>
  );
}

export function CategorySortIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const idA = useSvgId("catsortA");
  const idB = useSvgId("catsortB");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={idA} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe8a3" />
          <stop offset="100%" stopColor="var(--color-gk-gold)" />
        </linearGradient>
        <linearGradient id={idB} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bfe8ff" />
          <stop offset="100%" stopColor="var(--color-teal)" />
        </linearGradient>
      </defs>
      <path d="M 12 46 L 40 46 L 36 82 L 16 82 Z" fill={`url(#${idA})`} stroke="#2d2a26" strokeWidth={2} />
      <path d="M 60 46 L 88 46 L 84 82 L 64 82 Z" fill={`url(#${idB})`} stroke="#2d2a26" strokeWidth={2} />
      <circle cx={26} cy={30} r={8} fill={`url(#${idA})`} stroke="#2d2a26" strokeWidth={1.5} />
      <rect x={68} y={22} width={16} height={16} rx={4} fill={`url(#${idB})`} stroke="#2d2a26" strokeWidth={1.5} />
      <path d="M 40 34 Q 50 44 60 34" fill="none" stroke="#2d2a26" strokeWidth={2} strokeDasharray="3 4" opacity={0.5} />
    </svg>
  );
}

export function CountingQuizIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const id = useSvgId("countingQuiz");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe8a3" />
          <stop offset="100%" stopColor="var(--color-gk-gold)" />
        </linearGradient>
      </defs>
      <circle cx={28} cy={34} r={13} fill={`url(#${id})`} stroke="#2d2a26" strokeWidth={2} />
      <circle cx={58} cy={30} r={13} fill={`url(#${id})`} stroke="#2d2a26" strokeWidth={2} />
      <circle cx={40} cy={60} r={13} fill={`url(#${id})`} stroke="#2d2a26" strokeWidth={2} />
      <circle cx={76} cy={62} r={17} fill="var(--color-teal)" stroke="#2d2a26" strokeWidth={2} />
      <text x={76} y={70} textAnchor="middle" fontSize={18} fontWeight={800} fill="#fff" fontFamily="var(--font-display)">
        3
      </text>
    </svg>
  );
}

export function MissingLetterIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const idA = useSvgId("missingA");
  const idB = useSvgId("missingB");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={idA} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bfe8ff" />
          <stop offset="100%" stopColor="var(--color-teal)" />
        </linearGradient>
        <linearGradient id={idB} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffb3c6" />
          <stop offset="100%" stopColor="var(--color-gk-coral)" />
        </linearGradient>
      </defs>
      <rect x={12} y={36} width={26} height={30} rx={7} fill={`url(#${idA})`} stroke="#2d2a26" strokeWidth={2} />
      <text x={25} y={58} textAnchor="middle" fontSize={18} fontWeight={800} fill="#fff" fontFamily="var(--font-display)">
        C
      </text>
      <rect x={42} y={36} width={26} height={30} rx={7} fill="#fff8ec" stroke="#2d2a26" strokeWidth={2} strokeDasharray="4 3" />
      <text x={55} y={58} textAnchor="middle" fontSize={18} fontWeight={800} fill="#c9beac" fontFamily="var(--font-display)">
        ?
      </text>
      <rect x={72} y={36} width={26} height={30} rx={7} fill={`url(#${idB})`} stroke="#2d2a26" strokeWidth={2} />
      <text x={85} y={58} textAnchor="middle" fontSize={18} fontWeight={800} fill="#fff" fontFamily="var(--font-display)">
        T
      </text>
    </svg>
  );
}

export function SequenceMemoryIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const idA = useSvgId("seqA");
  const idB = useSvgId("seqB");
  const idC = useSvgId("seqC");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={idA} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe8a3" />
          <stop offset="100%" stopColor="var(--color-gk-gold)" />
        </linearGradient>
        <linearGradient id={idB} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffb3c6" />
          <stop offset="100%" stopColor="var(--color-gk-coral)" />
        </linearGradient>
        <linearGradient id={idC} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bfe8ff" />
          <stop offset="100%" stopColor="var(--color-teal)" />
        </linearGradient>
      </defs>
      <rect x={10} y={38} width={24} height={24} rx={7} fill={`url(#${idA})`} stroke="#2d2a26" strokeWidth={2} />
      <rect x={38} y={16} width={24} height={24} rx={7} fill={`url(#${idB})`} stroke="#2d2a26" strokeWidth={2} />
      <rect x={66} y={38} width={24} height={24} rx={7} fill={`url(#${idC})`} stroke="#2d2a26" strokeWidth={2} />
      <path d="M 34 44 L 40 34 M 62 34 L 68 44" fill="none" stroke="#2d2a26" strokeWidth={2} strokeDasharray="3 4" opacity={0.5} />
      <rect x={38} y={68} width={24} height={20} rx={6} fill="#fff8ec" stroke="#2d2a26" strokeWidth={2} strokeDasharray="4 3" />
    </svg>
  );
}

export function BalloonPopIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const id = useSvgId("balloonPop");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffb3c6" />
          <stop offset="100%" stopColor="var(--color-gk-coral)" />
        </radialGradient>
      </defs>
      <path d="M 50 12 C 30 12 20 30 20 44 C 20 60 34 72 50 72 C 66 72 80 60 80 44 C 80 30 70 12 50 12 Z" fill={`url(#${id})`} stroke="#2d2a26" strokeWidth={2} />
      <path d="M 50 72 L 46 82 L 54 82 Z" fill="#2d2a26" />
      <path d="M 50 82 Q 44 88 50 94" fill="none" stroke="#2d2a26" strokeWidth={2} strokeLinecap="round" />
      <ellipse cx={40} cy={32} rx={7} ry={11} fill="#fff" opacity={0.4} />
    </svg>
  );
}

export function FastPicksIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const id = useSvgId("fastPicks");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe8a3" />
          <stop offset="100%" stopColor="var(--color-gk-gold)" />
        </linearGradient>
      </defs>
      <circle cx={44} cy={54} r={32} fill={`url(#${id})`} stroke="#2d2a26" strokeWidth={2} />
      <rect x={36} y={14} width={16} height={8} rx={3} fill="#c9860a" />
      <path d="M 44 34 L 44 54 L 58 54" fill="none" stroke="#2d2a26" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 70 62 L 84 62 L 66 90 L 72 74 L 60 74 Z" fill="var(--color-gk-coral)" stroke="#2d2a26" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

export function WordRushIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const id = useSvgId("wordRush");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bfe8ff" />
          <stop offset="100%" stopColor="var(--color-teal)" />
        </linearGradient>
      </defs>
      <rect x={14} y={22} width={72} height={56} rx={10} fill={`url(#${id})`} stroke="#2d2a26" strokeWidth={2} />
      <text x={38} y={62} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff" fontFamily="var(--font-display)">
        A
      </text>
      <path d="M 60 32 L 48 58 L 58 58 L 52 78 L 76 46 L 64 46 Z" fill="var(--color-gk-gold)" stroke="#2d2a26" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

export function CategoryBlitzIcon({ size = 48, className = "" }: { size?: number; className?: string }) {
  const idA = useSvgId("catblitzA");
  const idB = useSvgId("catblitzB");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={idA} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe8a3" />
          <stop offset="100%" stopColor="var(--color-gk-gold)" />
        </linearGradient>
        <linearGradient id={idB} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bfe8ff" />
          <stop offset="100%" stopColor="var(--color-teal)" />
        </linearGradient>
      </defs>
      <path d="M 8 44 L 34 44 L 30 82 L 12 82 Z" fill={`url(#${idA})`} stroke="#2d2a26" strokeWidth={2} />
      <path d="M 54 44 L 80 44 L 76 82 L 58 82 Z" fill={`url(#${idB})`} stroke="#2d2a26" strokeWidth={2} />
      <path d="M 66 8 L 54 34 L 64 34 L 58 54 L 82 22 L 70 22 Z" fill="var(--color-gk-coral)" stroke="#2d2a26" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

export function BoosterPackIcon({
  size = 64,
  className = "",
  color = "var(--color-gk-gold)",
}: {
  size?: number;
  className?: string;
  color?: string;
}) {
  const id = useSvgId("pack");
  return (
    <svg viewBox="0 0 120 150" width={size} height={size} className={className}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor="var(--color-gk-gold-dark)" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x={10} y={10} width={100} height={130} rx={14} />
        </clipPath>
      </defs>
      <rect x={10} y={10} width={100} height={130} rx={14} fill={`url(#${id})`} stroke="#2d2a26" strokeWidth={2} opacity={0.95} />
      <g clipPath={`url(#${id}-clip)`}>
        <path d="M -10 40 L 40 -10 L 60 -10 L 0 60 Z" fill="#fff" opacity={0.25} />
        <path d="M 30 160 L 90 90 L 110 90 L 50 170 Z" fill="#fff" opacity={0.18} />
      </g>
      <rect x={10} y={10} width={100} height={20} rx={10} fill="#2d2a26" opacity={0.14} />
      <circle cx={60} cy={70} r={22} fill="#fff" opacity={0.3} />
      <path
        d="M60 54 L65.5 65 L78 66.5 L69 75 L71.5 87.5 L60 81 L48.5 87.5 L51 75 L42 66.5 L54.5 65 Z"
        fill="#fff"
        opacity={0.85}
      />
    </svg>
  );
}
