"use client";

import { useState } from "react";
import { motion } from "motion/react";

const COLORS = [
  "var(--color-gk-gold)",
  "var(--color-gk-teal)",
  "var(--color-gk-coral)",
  "var(--color-universe-dinosaur)",
];

interface Piece {
  left: number;
  delay: number;
  duration: number;
  color: string;
}

function generatePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 1.4 + Math.random(),
    color: COLORS[i % COLORS.length],
  }));
}

export function ConfettiOverlay({ show }: { show: boolean }) {
  // Lazy initializer runs once on mount, not on every render, so this stays
  // the one sanctioned place to compute the random burst layout.
  const [pieces] = useState(() => generatePieces(24));

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((piece, i) => (
        <motion.span
          key={i}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: "100vh", opacity: 0, rotate: 360 }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: "easeIn" }}
          className="absolute top-0 block h-3 w-3 rounded-sm"
          style={{ left: `${piece.left}%`, backgroundColor: piece.color }}
        />
      ))}
    </div>
  );
}
