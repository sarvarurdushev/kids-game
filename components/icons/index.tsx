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
