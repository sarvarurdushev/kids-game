"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Scene3D } from "@/components/three/Scene3D";
import { TextSprite } from "@/components/three/TextSprite";

const SPACING = 0.72;

export interface ScrambleTile {
  id: string;
  char: string;
  used: boolean;
}

function Tile3D({ tile, x, onTap }: { tile: ScrambleTile; x: number; onTap: () => void }) {
  const groupRef = useRef<Group>(null);
  // Deterministic per-tile phase offset (derived from its lane position, not
  // Math.random) so the idle bob staggers into a little wave across the row
  // without calling an impure function during render.
  const bobRef = useRef(x * 3);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    bobRef.current += delta * 2;
    const targetScale = tile.used ? 0 : 1;
    const s = group.scale.x + (targetScale - group.scale.x) * Math.min(1, delta * 10);
    group.scale.set(s, s, s);
    group.position.y = tile.used ? 0 : Math.sin(bobRef.current) * 0.03;
  });

  return (
    <group ref={groupRef} position={[x, 0, 0]} onClick={tile.used ? undefined : onTap}>
      <mesh>
        <boxGeometry args={[0.62, 0.62, 0.3]} />
        <meshStandardMaterial color="#ffffff" flatShading />
      </mesh>
      <TextSprite text={tile.char.toUpperCase()} position={[0, 0, 0.16]} width={0.36} height={0.36} />
    </group>
  );
}

interface WordScrambleScene3DProps {
  tiles: ScrambleTile[];
  onTap: (id: string) => void;
  className?: string;
}

export function WordScrambleScene3D({ tiles, onTap, className = "" }: WordScrambleScene3DProps) {
  const n = tiles.length;
  const spacing = n > 7 ? SPACING * 0.82 : SPACING;

  return (
    <div className={`h-28 w-full overflow-hidden rounded-3xl ${className}`}>
      <Scene3D camera={{ position: [0, 0, 2.2], fov: 50 }}>
        {tiles.map((tile, i) => (
          <Tile3D key={tile.id} tile={tile} x={(i - (n - 1) / 2) * spacing} onTap={() => onTap(tile.id)} />
        ))}
      </Scene3D>
    </div>
  );
}
