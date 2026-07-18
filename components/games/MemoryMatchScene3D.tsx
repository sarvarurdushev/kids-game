"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Scene3D } from "@/components/three/Scene3D";
import { TextSprite } from "@/components/three/TextSprite";

const COLS = 4;
const ROWS = 3;
const SPACING = 1.05;

export interface MatchCardData {
  id: string;
  kind: "emoji" | "word";
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function gridPosition(index: number): [number, number] {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const x = (col - (COLS - 1) / 2) * SPACING;
  const y = ((ROWS - 1) / 2 - row) * SPACING;
  return [x, y];
}

function FlipCard({
  card,
  position,
  onTap,
}: {
  card: MatchCardData;
  position: [number, number];
  onTap: () => void;
}) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    const target = card.isFlipped ? Math.PI : 0;
    const group = groupRef.current;
    if (!group) return;
    group.rotation.y += (target - group.rotation.y) * Math.min(1, delta * 9);
  });

  return (
    <group position={[position[0], position[1], 0]} ref={groupRef} onClick={onTap}>
      <mesh>
        <planeGeometry args={[0.92, 0.92]} />
        <meshStandardMaterial color="#e0a800" flatShading />
      </mesh>
      <TextSprite text="?" position={[0, 0, 0.01]} width={0.35} height={0.35} color="#fff8e5" />

      <group rotation={[0, Math.PI, 0]}>
        <mesh>
          <planeGeometry args={[0.92, 0.92]} />
          <meshStandardMaterial color={card.isMatched ? "#cdeee6" : "#ffffff"} flatShading />
        </mesh>
        <TextSprite
          text={card.value}
          position={[0, 0, 0.01]}
          width={card.kind === "emoji" ? 0.6 : 0.8}
          height={card.kind === "emoji" ? 0.6 : 0.32}
        />
      </group>
    </group>
  );
}

interface MemoryMatchScene3DProps {
  cards: MatchCardData[];
  onTap: (id: string) => void;
  className?: string;
}

export function MemoryMatchScene3D({ cards, onTap, className = "" }: MemoryMatchScene3DProps) {
  return (
    <div className={`aspect-[4/3] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-gold/10 to-teal/10 ${className}`}>
      <Scene3D camera={{ position: [0, 0, 4.4], fov: 45 }}>
        {cards.map((card, i) => (
          <FlipCard key={card.id} card={card} position={gridPosition(i)} onTap={() => onTap(card.id)} />
        ))}
      </Scene3D>
    </div>
  );
}
