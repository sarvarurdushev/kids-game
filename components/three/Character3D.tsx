"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import type { ReactNode } from "react";
import type { AvatarEquippedKeys, AvatarMood } from "@/components/avatar/AvatarCharacter";

const SKIN = "#f2c49b";
const INK = "#2d2a26";

const CLOTHES: Record<string, { color: string; accent?: (color: string) => ReactNode }> = {
  clothes_tshirt: { color: "#4fb3d9" },
  clothes_hoodie: {
    color: "#33475b",
    accent: () => (
      <mesh position={[0, 0.16, 0]}>
        <torusGeometry args={[0.22, 0.055, 6, 10]} />
        <meshStandardMaterial color="#25333f" flatShading />
      </mesh>
    ),
  },
  clothes_dress: {
    color: "#d46fb8",
    accent: () => (
      <mesh position={[0, -0.52, 0]}>
        <coneGeometry args={[0.42, 0.35, 8]} />
        <meshStandardMaterial color="#b6549a" flatShading />
      </mesh>
    ),
  },
  clothes_superhero: {
    color: "#e74c3c",
    accent: () => (
      <>
        <mesh position={[0, -0.1, -0.32]} rotation={[0.15, 0, 0]}>
          <planeGeometry args={[0.5, 0.7]} />
          <meshStandardMaterial color="#2b5fb0" side={2} flatShading />
        </mesh>
        <mesh position={[0, 0.05, 0.33]}>
          <octahedronGeometry args={[0.07, 0]} />
          <meshStandardMaterial color="#ffd23f" flatShading />
        </mesh>
      </>
    ),
  },
};

const HAIR: Record<string, () => ReactNode> = {
  hair_brown: () => (
    <mesh position={[0, 0.68, -0.02]} scale={[1.08, 0.72, 1.05]}>
      <icosahedronGeometry args={[0.4, 1]} />
      <meshStandardMaterial color="#6b4226" flatShading />
    </mesh>
  ),
  hair_curly: () => (
    <>
      {[
        [0, 0.78, 0.05, 0.19],
        [-0.24, 0.68, 0.05, 0.16],
        [0.24, 0.68, 0.05, 0.16],
        [-0.14, 0.82, -0.15, 0.15],
        [0.14, 0.82, -0.15, 0.15],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color="#3d2a1a" flatShading />
        </mesh>
      ))}
    </>
  ),
  hair_spiky: () => (
    <>
      <mesh position={[0, 0.65, -0.03]} scale={[1.05, 0.55, 1]}>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial color="#4a3628" flatShading />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 4) * Math.PI - Math.PI / 2;
        return (
          <mesh
            key={i}
            position={[Math.sin(angle) * 0.3, 0.85, Math.cos(angle) * 0.15 - 0.1]}
            rotation={[0.3, 0, -angle * 0.6]}
          >
            <coneGeometry args={[0.08, 0.32, 5]} />
            <meshStandardMaterial color="#4a3628" flatShading />
          </mesh>
        );
      })}
    </>
  ),
};

const HATS: Record<string, () => ReactNode> = {
  hat_cap: () => (
    <group position={[0, 0.86, 0]}>
      <mesh scale={[1, 0.6, 1]}>
        <icosahedronGeometry args={[0.32, 1]} />
        <meshStandardMaterial color="#2a7d8c" flatShading />
      </mesh>
      <mesh position={[0, -0.03, 0.32]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.32, 0.04, 0.22]} />
        <meshStandardMaterial color="#2a7d8c" flatShading />
      </mesh>
    </group>
  ),
  hat_wizard: () => (
    <group position={[0, 0.78, 0]}>
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 0.05, 10]} />
        <meshStandardMaterial color="#6a3fb5" flatShading />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <coneGeometry args={[0.24, 0.7, 8]} />
        <meshStandardMaterial color="#7c4fc9" flatShading />
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <octahedronGeometry args={[0.06, 0]} />
        <meshStandardMaterial color="#ffd23f" flatShading emissive="#ffd23f" emissiveIntensity={0.3} />
      </mesh>
    </group>
  ),
  hat_crown: () => (
    <group position={[0, 0.85, 0]}>
      <mesh>
        <torusGeometry args={[0.32, 0.06, 6, 12]} />
        <meshStandardMaterial color="#ffd23f" flatShading />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(angle) * 0.32, 0.1, Math.cos(angle) * 0.32]}>
            <coneGeometry args={[0.06, 0.16, 4]} />
            <meshStandardMaterial color="#ffd23f" flatShading />
          </mesh>
        );
      })}
    </group>
  ),
  hat_party: () => (
    <group position={[0, 0.8, 0]}>
      <mesh position={[0, 0.2, 0]}>
        <coneGeometry args={[0.26, 0.55, 8]} />
        <meshStandardMaterial color="#ff6f91" flatShading />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <icosahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial color="#fff" flatShading />
      </mesh>
    </group>
  ),
};

const ACCESSORIES: Record<string, () => ReactNode> = {
  accessory_glasses: () => (
    <group position={[0, 0.55, 0.37]}>
      <mesh position={[-0.15, 0, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 6, 10]} />
        <meshStandardMaterial color={INK} flatShading />
      </mesh>
      <mesh position={[0.15, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 6, 10]} />
        <meshStandardMaterial color={INK} flatShading />
      </mesh>
      <mesh>
        <boxGeometry args={[0.1, 0.02, 0.02]} />
        <meshStandardMaterial color={INK} flatShading />
      </mesh>
    </group>
  ),
  accessory_bowtie: () => (
    <group position={[0, 0.16, 0.32]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.09, 0.12, 4]} />
        <meshStandardMaterial color="#e63946" flatShading />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 2]} position={[0.0, 0, 0]}>
        <coneGeometry args={[0.09, 0.12, 4]} />
        <meshStandardMaterial color="#e63946" flatShading />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.04, 0]} />
        <meshStandardMaterial color="#c1121f" flatShading />
      </mesh>
    </group>
  ),
  accessory_scarf: () => (
    <mesh position={[0, 0.15, 0]}>
      <torusGeometry args={[0.24, 0.07, 6, 12]} />
      <meshStandardMaterial color="#e63946" flatShading />
    </mesh>
  ),
  accessory_medal: () => (
    <group position={[0, -0.15, 0.28]}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.04, 0.3, 0.02]} />
        <meshStandardMaterial color="#2b5fb0" flatShading />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.09, 0.09, 0.03, 10]} />
        <meshStandardMaterial color="#ffd23f" flatShading />
      </mesh>
    </group>
  ),
};

const EYE_STYLE: Record<string, { size: number; color: string; highlights: number }> = {
  eyes_round: { size: 0.045, color: INK, highlights: 1 },
  eyes_sparkle: { size: 0.06, color: INK, highlights: 2 },
  eyes_star: { size: 0.06, color: "#ffb703", highlights: 1 },
};

function Eyes({ eyesKey }: { eyesKey: string }) {
  const style = EYE_STYLE[eyesKey] ?? EYE_STYLE.eyes_round;
  const isStar = eyesKey === "eyes_star";
  return (
    <>
      {[-0.15, 0.15].map((x) => (
        <group key={x} position={[x, 0.52, 0.37]}>
          <mesh>
            {isStar ? <octahedronGeometry args={[style.size, 0]} /> : <sphereGeometry args={[style.size, 8, 8]} />}
            <meshStandardMaterial color={style.color} flatShading />
          </mesh>
          <mesh position={[-style.size * 0.35, style.size * 0.35, style.size * 0.6]}>
            <sphereGeometry args={[style.size * 0.28, 6, 6]} />
            <meshStandardMaterial color="#fff" flatShading />
          </mesh>
        </group>
      ))}
    </>
  );
}

const DEFAULTS = {
  hair: "hair_brown",
  eyes: "eyes_round",
  clothes: "clothes_tshirt",
};

interface Character3DProps {
  equippedKeys: AvatarEquippedKeys;
  mood?: AvatarMood;
}

export function Character3D({ equippedKeys, mood = "neutral" }: Character3DProps) {
  const groupRef = useRef<Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    const group = groupRef.current;
    if (!group) return;
    if (mood === "happy") {
      group.position.y = Math.sin(t.current * 7) * 0.06;
      group.rotation.z = Math.sin(t.current * 6) * 0.05;
    } else if (mood === "sad") {
      group.position.y = -0.03 + Math.sin(t.current * 2) * 0.015;
      group.rotation.z = Math.sin(t.current * 1.5) * 0.02;
    } else {
      group.position.y = Math.sin(t.current * 1.6) * 0.025;
      group.rotation.z = Math.sin(t.current * 1.2) * 0.015;
    }
  });

  const clothesKey = equippedKeys.clothes ?? DEFAULTS.clothes;
  const hairKey = equippedKeys.hair ?? DEFAULTS.hair;
  const eyesKey = equippedKeys.eyes ?? DEFAULTS.eyes;
  const hatKey = equippedKeys.hat;
  const accessoryKey = equippedKeys.accessory;

  const clothes = CLOTHES[clothesKey] ?? CLOTHES[DEFAULTS.clothes];
  const renderHair = HAIR[hairKey] ?? HAIR[DEFAULTS.hair];
  const renderHat = hatKey ? HATS[hatKey] : null;
  const renderAccessory = accessoryKey ? ACCESSORIES[accessoryKey] : null;

  const mouthColor = mood === "happy" ? "#a8402c" : mood === "sad" ? "#7a3a24" : "#7a3a24";
  const mouthScale: [number, number, number] = mood === "happy" ? [1.3, 1.1, 1] : mood === "sad" ? [0.8, 0.7, 1] : [1, 1, 1];

  return (
    <group ref={groupRef}>
      <mesh position={[0, -0.32, 0]}>
        <capsuleGeometry args={[0.34, 0.32, 4, 8]} />
        <meshStandardMaterial color={clothes.color} flatShading />
      </mesh>
      {clothes.accent?.(clothes.color)}

      <mesh position={[0, 0.5, 0]}>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial color={SKIN} flatShading />
      </mesh>

      <Eyes eyesKey={eyesKey} />

      <mesh position={[0, 0.36, 0.38]} scale={mouthScale}>
        <boxGeometry args={[0.14, 0.045, 0.03]} />
        <meshStandardMaterial color={mouthColor} flatShading />
      </mesh>

      {renderHair()}
      {renderAccessory?.()}
      {renderHat?.()}
    </group>
  );
}
