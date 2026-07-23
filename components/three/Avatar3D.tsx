"use client";

import { ContactShadows } from "@react-three/drei";
import { Scene3D } from "./Scene3D";
import { Character3D } from "./Character3D";
import type { AvatarEquippedKeys, AvatarMood } from "@/components/avatar/AvatarCharacter";

interface Avatar3DProps {
  equippedKeys: AvatarEquippedKeys;
  mood?: AvatarMood;
  dancing?: boolean;
  size?: number;
  className?: string;
  /** When true, `size` becomes a cap rather than a fixed pixel size: the div
   * fills 100% of its parent's width (so a responsive wrapper — e.g.
   * Tailwind's w-48 sm:w-72 lg:w-96 — actually grows the character across
   * breakpoints) up to that cap, staying square via aspect-ratio. Opt-in
   * because Avatar3D is also used at ~40 small, fixed-size call sites (game
   * mascots, login picker) that rely on the literal size={n} box today. */
  responsive?: boolean;
}

export function Avatar3D({
  equippedKeys,
  mood = "neutral",
  dancing = false,
  size = 120,
  className = "",
  responsive = false,
}: Avatar3DProps) {
  const style = responsive
    ? { width: "100%", maxWidth: size, aspectRatio: "1 / 1" }
    : { width: size, height: size };
  return (
    <div style={style} className={className}>
      <Scene3D camera={{ position: [0, 0.31, 4.4], fov: 32 }}>
        <Character3D equippedKeys={equippedKeys} mood={mood} dancing={dancing} />
        <ContactShadows position={[0, -0.72, 0]} opacity={0.35} scale={2.4} blur={2.2} far={1} />
      </Scene3D>
    </div>
  );
}
