"use client";

import { ContactShadows } from "@react-three/drei";
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
        <ContactShadows position={[0, -0.72, 0]} opacity={0.35} scale={2.4} blur={2.2} far={1} />
      </Scene3D>
    </div>
  );
}
