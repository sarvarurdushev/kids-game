"use client";

import { Scene3D } from "./Scene3D";
import { Character3D } from "./Character3D";
import type { AvatarEquippedKeys, AvatarMood } from "@/components/avatar/AvatarCharacter";

interface Avatar3DProps {
  equippedKeys: AvatarEquippedKeys;
  mood?: AvatarMood;
  size?: number;
  className?: string;
}

export function Avatar3D({ equippedKeys, mood = "neutral", size = 120, className = "" }: Avatar3DProps) {
  return (
    <div style={{ width: size, height: size }} className={className}>
      <Scene3D camera={{ position: [0, 0.31, 4.4], fov: 32 }}>
        <Character3D equippedKeys={equippedKeys} mood={mood} />
      </Scene3D>
    </div>
  );
}
