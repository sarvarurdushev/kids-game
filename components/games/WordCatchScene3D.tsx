"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Scene3D } from "@/components/three/Scene3D";
import { TextSprite } from "@/components/three/TextSprite";

const TOP_Y = 1.35;
const BOTTOM_Y = -1.3;
const LANE_X = [-1.15, 0, 1.15];

export type BlockTint = "neutral" | "correct" | "wrong";

export interface FallingWord {
  word: string;
  tint: BlockTint;
}

interface BlockProps extends FallingWord {
  laneX: number;
  fallDurationMs: number;
  isPlaying: boolean;
  onTap: () => void;
}

function FallingBlock({ word, laneX, fallDurationMs, isPlaying, tint, onTap }: BlockProps) {
  const groupRef = useRef<Group>(null);
  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    if (isPlaying) elapsedRef.current += delta * 1000;
    const progress = Math.min(1, elapsedRef.current / fallDurationMs);
    const y = TOP_Y - progress * (TOP_Y - BOTTOM_Y);
    groupRef.current?.position.set(laneX, y, 0);
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(elapsedRef.current * 0.002) * 0.15;
    }
  });

  const color = tint === "correct" ? "#2a7d8c" : tint === "wrong" ? "#e63946" : "#ffd23f";

  return (
    <group ref={groupRef} position={[laneX, TOP_Y, 0]} onClick={onTap}>
      <mesh>
        <boxGeometry args={[0.85, 0.6, 0.5]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
      <TextSprite text={word} position={[0, 0, 0.26]} width={0.7} height={0.35} />
    </group>
  );
}

interface WordCatchScene3DProps {
  roundKey: number;
  bubbles: FallingWord[];
  fallDurationMs: number;
  isPlaying: boolean;
  onTap: (word: string) => void;
  className?: string;
}

export function WordCatchScene3D({
  roundKey,
  bubbles,
  fallDurationMs,
  isPlaying,
  onTap,
  className = "",
}: WordCatchScene3DProps) {
  return (
    <div className={`h-[280px] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-gold/10 to-teal/10 ${className}`}>
      <Scene3D key={roundKey} camera={{ position: [0, 0, 4.2], fov: 42 }}>
        {bubbles.map((bubble, i) => (
          <FallingBlock
            key={bubble.word}
            word={bubble.word}
            tint={bubble.tint}
            laneX={LANE_X[i]}
            fallDurationMs={fallDurationMs}
            isPlaying={isPlaying}
            onTap={() => onTap(bubble.word)}
          />
        ))}
      </Scene3D>
    </div>
  );
}
